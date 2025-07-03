'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, PRODUCT_CATEGORIES, CartItem } from '@/types';
import { productsApi, ordersApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import SafeProductImage from '@/components/SafeProductImage';
import ImageErrorBoundary from '@/components/ImageErrorBoundary';
import Receipt from '@/components/Receipt';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthHeader from '@/components/AuthHeader';

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<{
    items: CartItem[];
    total: number;
    orderNumber: string;
    timestamp: Date;
  } | null>(null);
  
  // Mobile/Tablet specific states
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const cartRef = useRef<HTMLDivElement>(null);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll({ isActive: 'all' });
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add product to cart - only allow active products
  const addToCart = (product: Product) => {
    if (product.stockQty <= 0 || !product.isActive) return;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stockQty) {
          return prevCart.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prevCart;
      } else {
        return [...prevCart, {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1
        }];
      }
    });

    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Auto-expand cart on mobile when item is added
    if (window.innerWidth < 1024) {
      setIsCartExpanded(true);
      setTimeout(() => setIsCartExpanded(false), 2000);
    }
  };

  // Remove from cart with swipe gesture support
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  // Update cart quantity
  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent, productId: string) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, productId: string) => {
    if (!touchStartX) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    // Swipe left to remove (threshold: 100px)
    if (diff > 100) {
      removeFromCart(productId);
    }
    
    setTouchStartX(null);
  };

  // Calculate total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Process order
  const processOrder = async () => {
    if (cart.length === 0) return;

    try {
      setIsProcessingOrder(true);
      const loadingToast = toast.loading('Processing Order...', {
        position: 'top-center',
      });
      
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.price
        })),
        totalAmount: cartTotal
      };

      const response = await ordersApi.create(orderData);
      
      if (response.success) {
        // Generate order number
        const orderNumber = `PB${Date.now().toString().slice(-6)}`;
        
        // Store order details for receipt
        setLastOrder({
          items: [...cart],
          total: cartTotal,
          orderNumber,
          timestamp: new Date()
        });
        
        setCart([]);
        await loadProducts();
        setShowReceipt(true);
        
        // Haptic feedback for success
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('🎉 Order Completed!', {
          duration: 3000,
          position: 'top-center',
        });
      } else {
        toast.dismiss(loadingToast);
        toast.error('Order Failed', {
          duration: 5000,
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Error processing order:', error);
      toast.dismiss(loadingToast);
      toast.error('Order Failed', {
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Print receipt
  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && lastOrder) {
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - Order #${lastOrder.orderNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
            .total { font-weight: bold; font-size: 1.2em; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2>PopStreet Bakes</h2>
            <p>Fresh Baked Daily • Made with Love</p>
            <p>123 Baker Street, Sweet City, SC 12345</p>
            <p>Phone: (555) 123-BAKE</p>
          </div>
          <div class="line"></div>
          <div class="center">
            <p><strong>Order #${lastOrder.orderNumber}</strong></p>
            <p>${lastOrder.timestamp.toLocaleDateString()} ${lastOrder.timestamp.toLocaleTimeString()}</p>
          </div>
          <div class="line"></div>
          ${lastOrder.items.map(item => `
            <div class="item">
              <div>
                <div>${item.productName}</div>
                <div>$${item.price.toFixed(2)} x ${item.quantity}</div>
              </div>
              <div>$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="item">
            <span>Subtotal:</span>
            <span>$${lastOrder.total.toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Tax (8%):</span>
            <span>$${(lastOrder.total * 0.08).toFixed(2)}</span>
          </div>
          <div class="item total">
            <span>Total:</span>
            <span>$${(lastOrder.total * 1.08).toFixed(2)}</span>
          </div>
          <div class="line"></div>
          <div class="center">
            <p><strong>Thank you for your purchase!</strong></p>
            <p>Follow us @PopStreetBakes</p>
            <p>Visit us again soon! 🧁</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{backgroundColor: '#FFE1E0'}}>
        {/* Auth Header */}
        <AuthHeader 
          title="POS System" 
          subtitle={`Cart: ${cart.length} items • $${cartTotal.toFixed(2)}`} 
        />

        {/* Mobile Cart Toggle - Only visible on small screens */}
        <div className="lg:hidden fixed bottom-20 right-4 z-50">
          <button
            onClick={() => setIsCartExpanded(!isCartExpanded)}
            className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white relative transform transition-all duration-300 hover:scale-110"
            style={{backgroundColor: '#7F55B1'}}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M17 13v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0" />
            </svg>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        <div className="max-w-full mx-auto p-3 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Products Section */}
            <div className="lg:col-span-3">
              {/* Search and Filters - Mobile Optimized */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-purple-200 p-3 sm:p-4 mb-4">
                <div className="flex flex-col gap-2 sm:gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Category Filter + View Mode Toggle */}
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 px-3 py-2.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/70 backdrop-blur-sm text-purple-700"
                    >
                      <option value="all">All Categories</option>
                      {PRODUCT_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    
                    {/* View Mode Toggle */}
                    <div className="flex rounded-lg border border-purple-200 overflow-hidden bg-white/70">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-2.5 transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-purple-600 hover:bg-purple-50'}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2.5 transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-purple-600 hover:bg-purple-50'}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-purple-200 p-3 sm:p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-lg font-semibold text-gray-600">No products found</p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" 
                    : "space-y-2"
                  }>
                    {filteredProducts.map(product => (
                      <div 
                        key={product.id} 
                        className={`group bg-white border border-purple-100 overflow-hidden transition-all duration-200 relative ${
                          product.isActive 
                            ? 'hover:shadow-md cursor-pointer active:scale-95 hover:border-purple-300' 
                            : 'opacity-60 cursor-not-allowed grayscale'
                        } ${
                          viewMode === 'grid' 
                            ? 'rounded-lg hover:-translate-y-0.5' 
                            : 'rounded-lg flex items-center p-3 hover:scale-[1.01]'
                        }`}
                        onClick={() => product.isActive && addToCart(product)}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            {/* Grid View - Compact Product Image */}
                            <div className="relative h-24 sm:h-28 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                              <ImageErrorBoundary alt={product.name} width={200} height={120}>
                                <SafeProductImage
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className={`w-full h-full object-cover transition-transform duration-300 ${
                                    product.isActive ? 'group-hover:scale-105' : ''
                                  }`}
                                  width={200}
                                  height={120}
                                />
                              </ImageErrorBoundary>
                              
                              {/* Compact Status indicators */}
                              <div className="absolute top-1.5 right-1.5">
                                {product.stockQty > 0 ? (
                                  <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                                    {product.stockQty}
                                  </span>
                                ) : (
                                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                                    0
                                  </span>
                                )}
                              </div>

                              {/* Category badge */}
                              <div className="absolute top-1.5 left-1.5">
                                <span className="bg-white/90 text-purple-700 text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                                  {product.category.slice(0, 3)}
                                </span>
                              </div>

                              {/* Quick add button overlay */}
                              {product.stockQty > 0 && product.isActive && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/20">
                                  <button 
                                    className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart(product);
                                    }}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Grid View - Compact Product Info */}
                            <div className="p-2.5">
                              <h3 className="font-medium mb-1.5 text-xs leading-tight line-clamp-2 text-gray-800 min-h-[2rem]">
                                {product.name}
                              </h3>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-purple-700">
                                  ${product.price.toFixed(2)}
                                </span>
                                {product.stockQty > 0 && product.isActive ? (
                                  <button 
                                    className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white transition-all duration-200 active:scale-90 shadow-sm hover:bg-purple-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart(product);
                                    }}
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M17 13v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0" />
                                    </svg>
                                  </button>
                                ) : (
                                  <button 
                                    disabled
                                    className="w-7 h-7 rounded-lg bg-gray-300 flex items-center justify-center text-gray-500 cursor-not-allowed"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* List View - Compact */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 mr-3 bg-gradient-to-br from-purple-50 to-pink-50">
                              <ImageErrorBoundary alt={product.name} width={64} height={64}>
                                <SafeProductImage
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  width={64}
                                  height={64}
                                />
                              </ImageErrorBoundary>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-sm truncate text-gray-800">
                                  {product.name}
                                </h3>
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 flex-shrink-0">
                                  {product.category.slice(0, 3)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-purple-700">
                                  ${product.price.toFixed(2)}
                                </span>
                                <div className="flex items-center gap-2">
                                  {product.stockQty > 0 ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                      {product.stockQty} left
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                      Sold Out
                                    </span>
                                  )}
                                  
                                  {product.stockQty > 0 && product.isActive ? (
                                    <button 
                                      className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white transition-all duration-200 active:scale-90 shadow-sm hover:bg-purple-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(product);
                                      }}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      </svg>
                                    </button>
                                  ) : (
                                    <button 
                                      disabled
                                      className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center text-gray-500 cursor-not-allowed"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Overlays for different states */}
                        {!product.isActive && (
                          <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center rounded-lg">
                            <span className="text-gray-600 font-medium text-xs px-2 py-1 rounded bg-white/90">
                              INACTIVE
                            </span>
                          </div>
                        )}
                        {product.stockQty <= 0 && product.isActive && (
                          <div className="absolute inset-0 bg-gray-900/30 flex items-center justify-center rounded-lg">
                            <span className="text-white font-medium text-xs px-2 py-1 rounded bg-red-500/90">
                              SOLD OUT
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Cart Section */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border-2 p-6 sticky top-6" style={{borderColor: '#F49BAB'}}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold" style={{color: '#7F55B1'}}>Cart</h2>
                  <span className="text-white text-sm px-3 py-1 rounded-full font-medium" style={{backgroundColor: '#9B7EBD'}}>
                    {cart.length} items
                  </span>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#FFE1E0'}}>
                        <svg className="w-8 h-8" style={{color: '#9B7EBD'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M17 13v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0" />
                        </svg>
                      </div>
                      <p className="font-medium" style={{color: '#9B7EBD'}}>Your cart is empty</p>
                      <p className="text-sm mt-1" style={{color: '#9B7EBD', opacity: 0.7}}>Add items to get started</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div 
                        key={item.productId} 
                        className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:scale-[1.02]" 
                        style={{backgroundColor: '#FFE1E0'}}
                        onTouchStart={(e) => handleTouchStart(e, item.productId)}
                        onTouchEnd={(e) => handleTouchEnd(e, item.productId)}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate" style={{color: '#7F55B1'}}>{item.productName}</h4>
                          <p className="font-bold" style={{color: '#7F55B1'}}>${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all active:scale-90"
                            style={{backgroundColor: '#F49BAB'}}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-bold text-lg" style={{color: '#7F55B1'}}>{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all active:scale-90"
                            style={{backgroundColor: '#F49BAB'}}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cart Total and Checkout */}
                {cart.length > 0 && (
                  <>
                    <div className="border-t-2 pt-4 mb-6" style={{borderColor: '#F49BAB'}}>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold" style={{color: '#7F55B1'}}>Total:</span>
                        <span className="text-2xl font-bold" style={{color: '#7F55B1'}}>${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={processOrder}
                      disabled={isProcessingOrder || cart.length === 0}
                      className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                      style={{backgroundColor: '#7F55B1'}}
                    >
                      {isProcessingOrder ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          Processing...
                        </div>
                      ) : (
                        '🎉 Complete Order'
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Cart Slide-up Panel */}
        <div className={`lg:hidden fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl border-t-2 transition-transform duration-300 z-40 ${
          isCartExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-8rem)]'
        }`} style={{borderColor: '#F49BAB'}}>
          <div className="p-4 pb-20">
            {/* Cart Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h2 className="text-xl font-bold mr-3" style={{color: '#7F55B1'}}>Cart</h2>
                <span className="text-white text-sm px-3 py-1 rounded-full font-medium" style={{backgroundColor: '#9B7EBD'}}>
                  {cart.length} items
                </span>
              </div>
              <button
                onClick={() => setIsCartExpanded(!isCartExpanded)}
                className="p-2 rounded-xl" style={{backgroundColor: '#FFE1E0'}}
              >
                <svg 
                  className={`w-6 h-6 transition-transform duration-300 ${isCartExpanded ? 'rotate-180' : ''}`} 
                  style={{color: '#7F55B1'}} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            {/* Mobile Cart Items */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#FFE1E0'}}>
                    <svg className="w-8 h-8" style={{color: '#9B7EBD'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M17 13v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0" />
                    </svg>
                  </div>
                  <p className="font-medium text-lg" style={{color: '#9B7EBD'}}>Your cart is empty</p>
                  <p className="text-sm mt-1" style={{color: '#9B7EBD', opacity: 0.7}}>Add items to get started</p>
                </div>
              ) : (
                cart.map(item => (
                  <div 
                    key={item.productId} 
                    className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 active:scale-95" 
                    style={{backgroundColor: '#FFE1E0'}}
                    onTouchStart={(e) => handleTouchStart(e, item.productId)}
                    onTouchEnd={(e) => handleTouchEnd(e, item.productId)}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base truncate" style={{color: '#7F55B1'}}>{item.productName}</h4>
                      <p className="font-bold text-lg" style={{color: '#7F55B1'}}>${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm opacity-70" style={{color: '#7F55B1'}}>Swipe left to remove</p>
                    </div>
                    <div className="flex items-center space-x-3 ml-3">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all active:scale-90"
                        style={{backgroundColor: '#F49BAB'}}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-10 text-center font-bold text-xl" style={{color: '#7F55B1'}}>{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all active:scale-90"
                        style={{backgroundColor: '#F49BAB'}}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mobile Cart Total and Checkout */}
            {cart.length > 0 && (
              <>
                <div className="border-t-2 pt-4 mb-6" style={{borderColor: '#F49BAB'}}>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold" style={{color: '#7F55B1'}}>Total:</span>
                    <span className="text-3xl font-bold" style={{color: '#7F55B1'}}>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={processOrder}
                  disabled={isProcessingOrder || cart.length === 0}
                  className="w-full py-5 rounded-xl text-white font-bold text-xl transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  style={{backgroundColor: '#7F55B1'}}
                >
                  {isProcessingOrder ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                      Processing...
                    </div>
                  ) : (
                    '🎉 Complete Order'
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Toast Container */}
        <Toaster />

        {/* Receipt Modal */}
        {showReceipt && lastOrder && (
          <Receipt
            items={lastOrder.items}
            total={lastOrder.total}
            orderNumber={lastOrder.orderNumber}
            timestamp={lastOrder.timestamp}
            onClose={() => setShowReceipt(false)}
            onPrint={handlePrintReceipt}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}