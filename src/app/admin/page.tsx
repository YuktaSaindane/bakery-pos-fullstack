'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Product, PRODUCT_CATEGORIES } from '@/types';
import { productsApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import SafeProductImage from '@/components/SafeProductImage';
import ImageErrorBoundary from '@/components/ImageErrorBoundary';
import SalesDashboard from '@/components/SalesDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthHeader from '@/components/AuthHeader';

interface ProductFormData {
  name: string;
  price: number;
  category: string;
  stockQty: number;
  imageUrl: string;
  isActive: boolean;
}

const initialFormData: ProductFormData = {
  name: '',
  price: 0,
  category: 'Breads',
  stockQty: 0,
  imageUrl: '',
  isActive: true
};

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
      toast.error('Failed to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered products for better performance
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearchQuery, selectedCategory]);

  // Optimistic update helper
  const updateProductInState = useCallback((updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }, []);

  const addProductToState = useCallback((newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const removeProductFromState = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.price <= 0) {
      toast.error('Please fill in all required fields with valid values.');
      return;
    }

    const submitPromise = async () => {
      setSubmitting(true);
      
      try {
        if (editingProduct) {
          // Update existing product
          const response = await productsApi.update(editingProduct.id, formData);
          if (response.success) {
            updateProductInState(response.data);
            closeModal();
            return response.data;
          } else {
            throw new Error('Failed to update the product');
          }
        } else {
          // Create new product
          const response = await productsApi.create(formData);
          if (response.success) {
            addProductToState(response.data);
            closeModal();
            return response.data;
          } else {
            throw new Error('Failed to create the product');
          }
        }
      } finally {
        setSubmitting(false);
      }
    };

    toast.promise(
      submitPromise(),
      {
        loading: editingProduct ? `Updating "${formData.name}"...` : `Adding "${formData.name}" to your menu...`,
        success: (data) => `"${data.name}" has been ${editingProduct ? 'updated' : 'added'} successfully!`,
        error: (err) => err.message || 'An error occurred while saving the product.',
      }
    );
  };

  // Handle delete with proper toast management
  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    const deletePromise = async () => {
      const response = await productsApi.delete(product.id);
      if (response.success) {
        removeProductFromState(product.id);
        return product;
      } else {
        throw new Error('Failed to delete the product');
      }
    };

    toast.promise(
      deletePromise(),
      {
        loading: `Removing "${product.name}" from your menu...`,
        success: (deletedProduct) => `"${deletedProduct.name}" has been removed from your menu!`,
        error: (err) => err.message || 'An error occurred while deleting the product.',
      }
    );
  };

  // Modal functions
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      stockQty: product.stockQty,
      imageUrl: product.imageUrl || '',
      isActive: product.isActive
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(initialFormData);
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen" style={{backgroundColor: '#FFE1E0'}}>
        {/* Auth Header */}
        <AuthHeader 
          title="Admin Dashboard" 
          subtitle={activeTab === 'products' ? 'Product Management' : 'Sales Analytics'} 
        />

        <div className="max-w-full mx-auto p-3 sm:p-6">
          {/* Tab Navigation - Mobile Optimized */}
          <div className="bg-white rounded-2xl shadow-sm border-2 p-2 mb-4 sm:mb-6" style={{borderColor: '#F49BAB'}}>
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 ${
                  activeTab === 'products'
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50 active:scale-95'
                }`}
                style={{
                  backgroundColor: activeTab === 'products' ? '#7F55B1' : 'transparent'
                }}
              >
                🛍️ Products
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50 active:scale-95'
                }`}
                style={{
                  backgroundColor: activeTab === 'analytics' ? '#7F55B1' : 'transparent'
                }}
              >
                📊 Analytics
              </button>
            </div>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
              {/* Mobile Add Product Button + Controls */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-purple-200 p-3 sm:p-4 mb-4">
                <div className="flex flex-col gap-3">
                  {/* Add Product Button */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-purple-700">
                      Product Management
                    </h2>
                    <button
                      onClick={openAddModal}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium active:scale-95 transition-all duration-200 shadow-sm hover:bg-purple-700 text-sm"
                    >
                      + Add Product
                    </button>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col gap-2">
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

                    {/* Category Filter + View Mode */}
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
              </div>

              {/* Products Grid/List */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-purple-200 p-3 sm:p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-lg font-semibold text-gray-600">No products found</p>
                    <button
                      onClick={openAddModal}
                      className="mt-3 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium active:scale-95 transition-all duration-200 shadow-sm hover:bg-purple-700"
                    >
                      Add Your First Product
                    </button>
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
                          viewMode === 'grid' 
                            ? 'rounded-lg hover:shadow-md hover:-translate-y-0.5 hover:border-purple-300' 
                            : 'rounded-lg flex items-center p-3 hover:shadow-md hover:scale-[1.01] hover:border-purple-300'
                        }`}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            {/* Grid View - Compact */}
                            <div className="relative h-24 sm:h-28 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                              <ImageErrorBoundary alt={product.name} width={200} height={120}>
                                <SafeProductImage
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  width={200}
                                  height={120}
                                />
                              </ImageErrorBoundary>
                              
                              {/* Status indicators */}
                              <div className="absolute top-1.5 right-1.5 flex flex-col gap-1">
                                {!product.isActive && (
                                  <span className="bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                                    Inactive
                                  </span>
                                )}
                                <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                                  {product.stockQty}
                                </span>
                              </div>

                              {/* Category badge */}
                              <div className="absolute top-1.5 left-1.5">
                                <span className="bg-white/90 text-purple-700 text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                                  {product.category.slice(0, 3)}
                                </span>
                              </div>
                            </div>

                            {/* Product Info - Compact */}
                            <div className="p-2.5">
                              <h3 className="font-medium mb-1.5 text-xs leading-tight line-clamp-2 text-gray-800 min-h-[2rem]">
                                {product.name}
                              </h3>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-purple-700">
                                  ${product.price.toFixed(2)}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                  product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              
                              {/* Action Buttons - Compact */}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openEditModal(product)}
                                  className="flex-1 bg-purple-600 text-white px-2 py-1.5 rounded-md hover:bg-purple-700 transition-all duration-200 active:scale-95 text-xs font-medium"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(product)}
                                  className="flex-1 bg-red-500 text-white px-2 py-1.5 rounded-md hover:bg-red-600 transition-all duration-200 active:scale-95 text-xs font-medium"
                                >
                                  Delete
                                </button>
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
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                                  product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-purple-700">
                                    ${product.price.toFixed(2)}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                    {product.stockQty} in stock
                                  </span>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => openEditModal(product)}
                                    className="bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 transition-all duration-200 active:scale-95 text-xs font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product)}
                                    className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-all duration-200 active:scale-95 text-xs font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-4 sm:space-y-6">
              <SalesDashboard />
            </div>
          )}
        </div>

        {/* Product Form Modal - Mobile Optimized */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold" style={{color: '#7F55B1'}}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#7F55B1'}}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all text-base"
                    style={{
                      borderColor: '#F49BAB',
                      '--tw-ring-color': '#9B7EBD'
                    }}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#7F55B1'}}>
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all text-base"
                    style={{
                      borderColor: '#F49BAB',
                      '--tw-ring-color': '#9B7EBD'
                    }}
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#7F55B1'}}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent bg-white transition-all text-base"
                    style={{
                      borderColor: '#F49BAB',
                      '--tw-ring-color': '#9B7EBD',
                      color: '#7F55B1'
                    }}
                    required
                  >
                    {PRODUCT_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#7F55B1'}}>
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({...formData, stockQty: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all text-base"
                    style={{
                      borderColor: '#F49BAB',
                      '--tw-ring-color': '#9B7EBD'
                    }}
                    placeholder="0"
                    required
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#7F55B1'}}>
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all text-base"
                    style={{
                      borderColor: '#F49BAB',
                      '--tw-ring-color': '#9B7EBD'
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl" style={{backgroundColor: '#FFE1E0'}}>
                  <label className="text-sm font-medium" style={{color: '#7F55B1'}}>
                    Product Active
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>

                {/* Form Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 px-6 border-2 rounded-xl font-semibold active:scale-95 transition-all duration-200"
                    style={{
                      borderColor: '#F49BAB',
                      color: '#7F55B1'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 px-6 rounded-xl text-white font-semibold active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:active:scale-100"
                    style={{backgroundColor: '#7F55B1'}}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      editingProduct ? 'Update Product' : 'Add Product'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <Toaster />
      </div>
    </ProtectedRoute>
  );
} 