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
              <div className="bg-white rounded-2xl shadow-sm border-2 p-4 sm:p-6 mb-4 sm:mb-6" style={{borderColor: '#F49BAB'}}>
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all"
                      style={{
                        borderColor: '#F49BAB',
                        '--tw-ring-color': '#9B7EBD'
                      }}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{color: '#9B7EBD'}}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Category Filter + View Mode Toggle */}
                  <div className="flex gap-3">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 px-4 py-4 text-lg border-2 rounded-xl focus:ring-2 focus:border-transparent bg-white transition-all"
                      style={{
                        borderColor: '#F49BAB',
                        '--tw-ring-color': '#9B7EBD',
                        color: '#7F55B1'
                      }}
                    >
                      <option value="all">All Categories</option>
                      {PRODUCT_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    
                    {/* View Mode Toggle */}
                    <div className="flex rounded-xl border-2 overflow-hidden" style={{borderColor: '#F49BAB'}}>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-4 transition-all ${viewMode === 'grid' ? 'text-white' : 'text-gray-600'}`}
                        style={{backgroundColor: viewMode === 'grid' ? '#7F55B1' : 'white'}}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-4 transition-all ${viewMode === 'list' ? 'text-white' : 'text-gray-600'}`}
                        style={{backgroundColor: viewMode === 'list' ? '#7F55B1' : 'white'}}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              <div className="bg-white rounded-2xl shadow-sm border-2 p-4 sm:p-6" style={{borderColor: '#F49BAB'}}>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent" style={{borderTopColor: '#7F55B1'}}></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-8xl mb-4">🔍</div>
                    <p className="text-2xl font-bold" style={{color: '#9B7EBD'}}>No products found</p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" 
                    : "space-y-3"
                  }>
                    {filteredProducts.map(product => (
                      <div 
                        key={product.id} 
                        className={`group bg-white border-2 overflow-hidden transition-all duration-300 relative ${
                          product.isActive 
                            ? 'hover:shadow-xl cursor-pointer active:scale-95' 
                            : 'opacity-50 cursor-not-allowed grayscale'
                        } ${
                          viewMode === 'grid' 
                            ? 'rounded-2xl hover:-translate-y-1' 
                            : 'rounded-xl flex items-center p-4 hover:scale-[1.02]'
                        }`}
                        style={{borderColor: '#FFE1E0'}}
                        onClick={() => product.isActive && addToCart(product)}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            {/* Grid View - Product Image */}
                            <div className="relative h-40 sm:h-48 overflow-hidden" style={{backgroundColor: '#FFE1E0'}}>
                              <ImageErrorBoundary alt={product.name} width={400} height={300}>
                                <SafeProductImage
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className={`w-full h-full transition-transform duration-500 ${
                                    product.isActive ? 'group-hover:scale-110' : ''
                                  }`}
                                  width={400}
                                  height={300}
                                />
                              </ImageErrorBoundary>
                              
                              {/* Status indicators */}
                              <div className="absolute top-3 right-3 flex flex-col gap-2">
                                {!product.isActive && (
                                  <span className="bg-gray-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                                    Inactive
                                  </span>
                                )}
                                {product.stockQty > 0 ? (
                                  <span className="text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg backdrop-blur-sm" style={{backgroundColor: 'rgba(127, 85, 177, 0.9)'}}>
                                    {product.stockQty}
                                  </span>
                                ) : (
                                  <span className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                                    Out of Stock
                                  </span>
                                )}
                              </div>

                              {/* Category badge */}
                              <div className="absolute top-3 left-3">
                                <span className="bg-white/95 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg" style={{color: '#7F55B1'}}>
                                  {product.category}
                                </span>
                              </div>

                              {/* Quick add button overlay */}
                              {product.stockQty > 0 && product.isActive && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                  <button 
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300"
                                    style={{backgroundColor: '#7F55B1'}}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart(product);
                                    }}
                                  >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Grid View - Product Info */}
                            <div className="p-4">
                              <h3 className="font-semibold mb-3 text-sm sm:text-base leading-tight line-clamp-2 min-h-[2.5rem]" style={{color: '#7F55B1'}}>
                                {product.name}
                              </h3>
                              <div className="flex items-center justify-between">
                                <span className="text-xl sm:text-2xl font-bold" style={{color: '#7F55B1'}}>
                                  ${product.price.toFixed(2)}
                                </span>
                                {product.stockQty > 0 && product.isActive ? (
                                  <button 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 active:scale-90 shadow-lg"
                                    style={{backgroundColor: '#7F55B1'}}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart(product);
                                    }}
                                  >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M17 13v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0" />
                                    </svg>
                                  </button>
                                ) : (
                                  <button 
                                    disabled
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white cursor-not-allowed"
                                    style={{backgroundColor: '#9B7EBD', opacity: 0.5}}
                                  >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* List View */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 mr-4" style={{backgroundColor: '#FFE1E0'}}>
                              <ImageErrorBoundary alt={product.name} width={80} height={80}>
                                <SafeProductImage
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  width={80}
                                  height={80}
                                />
                              </ImageErrorBoundary>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg truncate" style={{color: '#7F55B1'}}>
                                  {product.name}
                                </h3>
                                <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#FFE1E0', color: '#7F55B1'}}>
                                  {product.category}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold" style={{color: '#7F55B1'}}>
                                  ${product.price.toFixed(2)}
                                </span>
                                <div className="flex items-center gap-3">
                                  {product.stockQty > 0 ? (
                                    <span className="text-sm px-2 py-1 rounded-full" style={{backgroundColor: '#7F55B1', color: 'white'}}>
                                      {product.stockQty} left
                                    </span>
                                  ) : (
                                    <span className="text-sm px-2 py-1 rounded-full bg-red-500 text-white">
                                      Sold Out
                                    </span>
                                  )}
                                  
                                  {product.stockQty > 0 && product.isActive ? (
                                    <button 
                                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 active:scale-90 shadow-lg"
                                      style={{backgroundColor: '#7F55B1'}}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(product);
                                      }}
                                    >
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      </svg>
                                    </button>
                                  ) : (
                                    <button 
                                      disabled
                                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white cursor-not-allowed"
                                      style={{backgroundColor: '#9B7EBD', opacity: 0.5}}
                                    >
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <div className="absolute inset-0 bg-gray-900/30 flex items-center justify-center rounded-2xl">
                            <span className="text-white font-bold text-lg px-4 py-2 rounded-xl bg-gray-600/90">
                              INACTIVE
                            </span>
                          </div>
                        )}
                        {product.stockQty <= 0 && product.isActive && (
                          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-2xl">
                            <span className="text-white font-bold text-lg px-4 py-2 rounded-xl" style={{backgroundColor: 'rgba(239, 68, 68, 0.9)'}}>
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