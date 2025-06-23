const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/products - Get all active products
router.get('/', async (req, res) => {
  try {
    const { category, isActive } = req.query;
    
    const whereClause = {
      ...(category && category !== 'all' ? { category } : {})
    };

    // Only filter by isActive if it's explicitly set to 'true' or 'false'
    if (isActive !== undefined && isActive !== 'all') {
      whereClause.isActive = isActive === 'true';
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse ID as integer
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }
    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// Helper function to generate product codes
async function generateProductCode(category) {
  const categoryMap = {
    'Breads': 'B',
    'Pastries': 'P', 
    'Cakes': 'C',
    'Cookies': 'K',
    'Beverages': 'D', // D for Drinks
    'Sandwiches': 'S',
    'Seasonal': 'Z',
    'Other': 'O'
  };
  
  const prefix = categoryMap[category] || 'X';
  
  // Find the highest number for this category
  const lastProduct = await prisma.product.findFirst({
    where: {
      productCode: {
        startsWith: prefix
      }
    },
    orderBy: {
      productCode: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastProduct) {
    const lastNumber = parseInt(lastProduct.productCode.slice(1));
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  return `${prefix}${nextNumber.toString().padStart(2, '0')}`;
}

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const { name, price, category, stockQty, imageUrl, isActive = true } = req.body;

    // Validation
    if (!name || !price || !category || stockQty === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, price, category, and stock quantity are required'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0'
      });
    }

    if (stockQty < 0) {
      return res.status(400).json({
        success: false,
        error: 'Stock quantity cannot be negative'
      });
    }

    const productCode = await generateProductCode(category);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: parseFloat(price),
        category: category.trim(),
        stockQty: parseInt(stockQty),
        imageUrl: imageUrl?.trim() || null,
        isActive: Boolean(isActive),
        productCode: productCode
      }
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, stockQty, imageUrl, isActive } = req.body;

    // Parse ID as integer
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Validation
    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0'
      });
    }

    if (stockQty !== undefined && stockQty < 0) {
      return res.status(400).json({
        success: false,
        error: 'Stock quantity cannot be negative'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category.trim();
    if (stockQty !== undefined) updateData.stockQty = parseInt(stockQty);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData
    });

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// DELETE /api/products/:id - Delete product (soft delete by setting isActive to false)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.query;

    // Parse ID as integer
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (hardDelete === 'true') {
      // Hard delete - actually remove from database
      await prisma.product.delete({
        where: { id: productId }
      });
      
      res.json({
        success: true,
        message: 'Product permanently deleted'
      });
    } else {
      // Soft delete - set isActive to false
      const product = await prisma.product.update({
        where: { id: productId },
        data: { isActive: false }
      });

      res.json({
        success: true,
        data: product,
        message: 'Product deactivated successfully'
      });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

// PATCH /api/products/:id/stock - Update product stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'

    // Parse ID as integer
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required'
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    let newStockQty;
    switch (operation) {
      case 'add':
        newStockQty = existingProduct.stockQty + parseInt(quantity);
        break;
      case 'subtract':
        newStockQty = Math.max(0, existingProduct.stockQty - parseInt(quantity));
        break;
      case 'set':
      default:
        newStockQty = parseInt(quantity);
        break;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { stockQty: newStockQty }
    });

    res.json({
      success: true,
      data: product,
      message: `Stock ${operation}ed successfully`
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update stock'
    });
  }
});

module.exports = router; 