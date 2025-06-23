const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/orders - Get all orders with pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      startDate, 
      endDate 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.order.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/:id - Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Parse ID as integer
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// POST /api/orders - Create new order (checkout)
router.post('/', async (req, res) => {
  try {
    const { items } = req.body; // items: [{ productId, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order items are required'
      });
    }

    // Validate and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'All items must have valid productId and quantity'
        });
      }

      // Parse product ID as integer
      const parsedProductId = parseInt(productId);
      if (isNaN(parsedProductId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid product ID'
        });
      }

      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: parsedProductId }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${productId} not found`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product "${product.name}" is not available`
        });
      }

      if (product.stockQty < quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${product.name}". Available: ${product.stockQty}, Requested: ${quantity}`
        });
      }

      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: parsedProductId,
        quantity: parseInt(quantity),
        priceAtPurchase: product.price
      });
    }

    // Create order with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          totalAmount,
          status: 'COMPLETED',
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Update stock quantities
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: {
              decrement: item.quantity
            }
          }
        });
      }

      return order;
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Order completed successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process order'
    });
  }
});

// GET /api/orders/stats/summary - Get sales summary
router.get('/stats/summary', async (req, res) => {
  try {
    const { period = 'today' } = req.query; // today, week, month, year

    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
    }

    const whereClause = {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: 'COMPLETED'
    };

    // Get summary stats
    const [
      orders,
      totalRevenue,
      orderCount,
      totalItemsSold
    ] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              }
            }
          }
        }
      }),
      prisma.order.aggregate({
        where: whereClause,
        _sum: {
          totalAmount: true
        }
      }),
      prisma.order.count({
        where: whereClause
      }),
      prisma.orderItem.aggregate({
        where: {
          order: whereClause
        },
        _sum: {
          quantity: true
        }
      })
    ]);

    // Calculate popular items
    const itemStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.product.id;
        if (!itemStats[key]) {
          itemStats[key] = {
            productId: item.product.id,
            productName: item.product.name,
            category: item.product.category,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        itemStats[key].totalQuantity += item.quantity;
        itemStats[key].totalRevenue += item.quantity * item.priceAtPurchase;
      });
    });

    const popularItems = Object.values(itemStats)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    // Calculate average order value
    const averageOrderValue = orderCount > 0 ? 
      (totalRevenue._sum.totalAmount || 0) / orderCount : 0;

    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          orderCount,
          totalItemsSold: totalItemsSold._sum.quantity || 0,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100
        },
        popularItems,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics'
    });
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be PENDING, COMPLETED, or CANCELLED'
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// GET /api/orders/analytics/dashboard - Get dashboard analytics
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    // Calculate date range based on period
    let startDate, endDate;
    const now = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        startDate = weekStart;
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }

    // Get orders in date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate items sold and popular products
    const itemsSold = {};
    let totalItemsCount = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        totalItemsCount += item.quantity;
        const productName = item.product.name;
        if (!itemsSold[productName]) {
          itemsSold[productName] = {
            name: productName,
            category: item.product.category,
            quantity: 0,
            revenue: 0
          };
        }
        itemsSold[productName].quantity += item.quantity;
        itemsSold[productName].revenue += item.priceAtPurchase * item.quantity;
      });
    });

    // Get top 5 products by quantity
    const topProducts = Object.values(itemsSold)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Get hourly sales for today (if period is today)
    let hourlySales = [];
    if (period === 'today') {
      const hourlyData = {};
      for (let i = 0; i < 24; i++) {
        hourlyData[i] = { hour: i, sales: 0, orders: 0 };
      }

      orders.forEach(order => {
        const hour = order.createdAt.getHours();
        hourlyData[hour].sales += order.totalAmount;
        hourlyData[hour].orders += 1;
      });

      hourlySales = Object.values(hourlyData);
    }

    res.json({
      success: true,
      data: {
        period,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        totalItemsSold: totalItemsCount,
        topProducts,
        hourlySales: period === 'today' ? hourlySales : []
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

module.exports = router; 
 