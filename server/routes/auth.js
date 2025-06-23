const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'popstreet-bakes-secret-key';

// Helper function to generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// POST /api/auth/login - Admin/Cashier login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // For demo purposes, allow default admin login
    if (email === 'admin@popstreetbakes.com' && password === 'admin123') {
      // Check if default admin user exists
      let user = await prisma.user.findUnique({
        where: { email }
      });

      // Create default admin if doesn't exist
      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: 'ADMIN',
            name: 'PopStreet Admin'
          }
        });
      }

      const token = generateToken(user.id, user.email, user.role);

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
          },
          token
        },
        message: 'Login successful'
      });
    }

    // Regular login flow
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// POST /api/auth/register - Create new user (admin only)
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'CASHIER', name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role.toUpperCase(),
        name: name?.trim() || null
      }
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        token
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user information'
    });
  }
});

// POST /api/auth/change-password - Change user password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// GET /api/auth/users - Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

module.exports = router; 