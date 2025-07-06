# PopStreet Bakes MiniPOS

A lightweight Point-of-Sale web application tailored for PopStreet Bakes bakery. Built with Next.js, TypeScript, Tailwind CSS, Express.js, and PostgreSQL.
## 🎥 Demo Video

[Watch the gameplay demo on Google Drive](https://drive.google.com/file/d/1x6OI1XB77q6IIUxnP_WKLXVNyPQIIdeh/view?usp=drive_link)

## 🚀 Features

### POS System (Staff Interface)
- **Touch-friendly interface** - Optimized for tablets and touch devices
- **Product grid** - Browse bakery items with images and prices
- **Cart management** - Add, remove, and modify quantities
- **Real-time inventory** - Stock levels update automatically
- **Quick checkout** - Process orders and generate receipts

### Admin Dashboard
- **Product management** - Add, edit, and manage bakery products
- **Sales analytics** - View detailed sales reports and metrics
- **Order history** - Track all customer orders and transactions
- **User management** - Manage staff accounts and permissions
- **Inventory control** - Track stock levels and receive alerts

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Image Storage**: Cloudinary (optional)
- **Styling**: Custom bakery-themed design system

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PopStreet-Bakes-MiniPOS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/popstreet_bakes_pos"
   
   # JWT Secret
   JWT_SECRET="your-super-secret-jwt-key"
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Admin Credentials
   ADMIN_EMAIL="admin@popstreetbakes.com"
   ADMIN_PASSWORD="admin123"
   ```

4. **Set up PostgreSQL database**
   - Install PostgreSQL locally or use a cloud service
   - Create a database named `popstreet_bakes_pos`
   - Update the `DATABASE_URL` in your `.env` file

5. **Run database migrations**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the frontend (Next.js) and backend (Express.js) servers concurrently.

## 🌐 Usage

### Access Points
- **Home Page**: `http://localhost:3000`
- **POS System**: `http://localhost:3000/pos`
- **Admin Panel**: `http://localhost:3000/admin`
- **API Health Check**: `http://localhost:3001/api/health`

### Default Admin Credentials
- **Email**: `admin@popstreetbakes.com`
- **Password**: `admin123`

## 📱 Product Categories

The system supports the following bakery categories:
- Breads
- Pastries
- Cakes
- Cookies
- Beverages
- Sandwiches
- Seasonal
- Other

## 🔧 Development

### Available Scripts

```bash
# Development (runs both frontend and backend)
npm run dev

# Frontend only
npm run dev:client

# Backend only
npm run dev:server

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:studio     # Open Prisma Studio
```

### Project Structure

```
PopStreet-Bakes-MiniPOS/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── lib/          # Utility functions and API clients
│   └── types/        # TypeScript type definitions
├── server/
│   ├── routes/       # Express.js API routes
│   ├── middleware/   # Custom middleware
│   └── models/       # Database models
├── prisma/
│   └── schema.prisma # Database schema
└── public/           # Static assets
```

## 🎨 Design System

The application uses a custom bakery-themed design system:

- **Primary Color**: Saddle Brown (#8B4513)
- **Secondary Color**: Burlywood (#DEB887)
- **Accent Color**: Sandy Brown (#F4A460)
- **Light Background**: Cornsilk (#FFF8DC)
- **Dark Text**: Dark Brown (#654321)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/stock` - Update stock

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/stats/summary` - Get sales statistics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection protection with Prisma
- CORS configuration
- Rate limiting (recommended for production)

## 🚧 Roadmap

### Phase 1: Core Features ✅
- [x] Project setup and configuration
- [x] Database schema and models
- [x] Basic API endpoints
- [x] Authentication system
- [x] Landing page and navigation

### Phase 2: POS Interface (In Progress)
- [ ] Product grid with filtering
- [ ] Shopping cart functionality
- [ ] Checkout process
- [ ] Receipt generation

### Phase 3: Admin Dashboard (In Progress)
- [ ] Product management interface
- [ ] Order history and details
- [ ] Sales analytics and reports
- [ ] User management

### Phase 4: Advanced Features (Planned)
- [ ] Image upload for products
- [ ] PDF receipt generation
- [ ] Inventory alerts
- [ ] Advanced reporting
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with love for small businesses
- Inspired by real bakery operations
- Designed for ease of use and efficiency

---

**PopStreet Bakes MiniPOS** - Making bakery management simple and delightful! 🧁✨ 
