'use client';

import { useState, useEffect } from 'react';
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

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.price <= 0) {
      toast.error('Please fill in all required fields with valid values.');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingProduct) {
        // Update existing product
        const response = await productsApi.update(editingProduct.id, formData);
        if (response.success) {
          await loadProducts();
          closeModal();
          toast.success(`"${formData.name}" has been updated successfully!`);
        } else {
          toast.error('Failed to update the product. Please try again.');
        }
      } else {
        // Create new product
        const response = await productsApi.create(formData);
        if (response.success) {
          await loadProducts();
          closeModal();
          toast.success(`"${formData.name}" has been added to your menu!`);
        } else {
          toast.error('Failed to create the product. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('An error occurred while saving the product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      toast.loading(`Removing "${product.name}" from your menu...`);
      const response = await productsApi.delete(product.id);
      if (response.success) {
        await loadProducts();
        toast.success(`"${product.name}" has been removed from your menu!`);
      } else {
        toast.error('Failed to delete the product. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('An error occurred while deleting the product.');
    }
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
              <div className="bg-white rounded-2xl shadow-sm border-2 p-4 sm:p-6 mb-4 sm:mb-6" style={{borderColor: '#F49BAB'}}>
                <div className="flex flex-col gap-4">
                  {/* Add Product Button */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold" style={{color: '#7F55B1'}}>
                      Product Management
                    </h2>
                    <button
                      onClick={openAddModal}
                      className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-semibold active:scale-95 transition-all duration-200 shadow-lg text-sm sm:text-base"
                      style={{backgroundColor: '#7F55B1'}}
                    >
                      + Add Product
                    </button>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col gap-3">
                    {/* Search Bar */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 sm:py-4 text-base border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all"
                        style={{
                          borderColor: '#F49BAB',
                          '--tw-ring-color': '#9B7EBD'
                        }}
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{color: '#9B7EBD'}}>
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Category Filter + View Mode */}
                    <div className="flex gap-3">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="flex-1 px-4 py-3 sm:py-4 text-base border-2 rounded-xl focus:ring-2 focus:border-transparent bg-white transition-all"
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
                          className={`px-3 sm:px-4 py-3 sm:py-4 transition-all ${viewMode === 'grid' ? 'text-white' : 'text-gray-600'}`}
                          style={{backgroundColor: viewMode === 'grid' ? '#7F55B1' : 'white'}}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`px-3 sm:px-4 py-3 sm:py-4 transition-all ${viewMode === 'list' ? 'text-white' : 'text-gray-600'}`}
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
              </div>

              {/* Products Grid/List */}
              <div className="bg-white rounded-2xl shadow-sm border-2 p-4 sm:p-6" style={{borderColor: '#F49BAB'}}>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-transparent" style={{borderTopColor: '#7F55B1'}}></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl sm:text-8xl mb-4">📦</div>
                    <p className="text-xl sm:text-2xl font-bold" style={{color: '#9B7EBD'}}>No products found</p>
                    <button
                      onClick={openAddModal}
                      className="mt-4 px-6 py-3 rounded-xl text-white font-semibold active:scale-95 transition-all duration-200 shadow-lg"
                      style={{backgroundColor: '#7F55B1'}}
                    >
                      Add Your First Product
                    </button>
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
                          viewMode === 'grid' 
                            ? 'rounded-2xl hover:shadow-xl hover:-translate-y-1' 
                            : 'rounded-xl flex items-center p-4 hover:shadow-lg hover:scale-[1.02]'
                        }`}
                        style={{borderColor: '#FFE1E0'}}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            {/* Grid View */}
                            <div className="relative h-40 sm:h-48 overflow-hidden" style={{backgroundColor: '#FFE1E0'}}>
                              <ImageErrorBoundary alt={product.name} width={400} height={300}>
                                <SafeProductImage
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                                  width={400}
                                  height={300}
                                />
                              </ImageErrorBoundary>
                              
                              {/* Status indicators */}
                              <div className="absolute top-3 right-3 flex flex-col gap-2">
                                {!product.isActive && (
                                  <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                                    Inactive
                                  </span>
                                )}
                                <span className="text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg backdrop-blur-sm" style={{backgroundColor: 'rgba(127, 85, 177, 0.9)'}}>
                                  {product.stockQty} left
                                </span>
                              </div>

                              {/* Category badge */}
                              <div className="absolute top-3 left-3">
                                <span className="bg-white/95 backdrop-blur-sm text-xs px-2 py-1 rounded-full font-semibold shadow-lg" style={{color: '#7F55B1'}}>
                                  {product.category}
                                </span>
                              </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                              <h3 className="font-semibold mb-2 text-sm sm:text-base leading-tight line-clamp-2" style={{color: '#7F55B1'}}>
                                {product.name}
                              </h3>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-lg sm:text-xl font-bold" style={{color: '#7F55B1'}}>
                                  ${product.price.toFixed(2)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                  product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openEditModal(product)}
                                  className="flex-1 py-2 px-3 rounded-lg text-white text-sm font-medium active:scale-95 transition-all duration-200 shadow-sm"
                                  style={{backgroundColor: '#F49BAB'}}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(product)}
                                  className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium active:scale-95 transition-all duration-200 shadow-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* List View */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 mr-4" style={{backgroundColor: '#FFE1E0'}}>
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
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-base sm:text-lg truncate" style={{color: '#7F55B1'}}>
                                    {product.name}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: '#FFE1E0', color: '#7F55B1'}}>
                                      {product.category}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                      product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {product.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-xl sm:text-2xl font-bold" style={{color: '#7F55B1'}}>
                                    ${product.price.toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {product.stockQty} in stock
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex space-x-2 mt-3">
                                <button
                                  onClick={() => openEditModal(product)}
                                  className="flex-1 py-2 px-4 rounded-lg text-white text-sm font-medium active:scale-95 transition-all duration-200 shadow-sm"
                                  style={{backgroundColor: '#F49BAB'}}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(product)}
                                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium active:scale-95 transition-all duration-200 shadow-sm"
                                >
                                  Delete
                                </button>
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