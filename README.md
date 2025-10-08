# Oshocks Junior Bike Shop

> Kenya's Premier Cycling E-Commerce Marketplace

A comprehensive multi-vendor e-commerce platform for cycling products in Kenya, combining the functionality of Amazon and Alibaba with local payment integration and marketplace features.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20?logo=laravel)](https://laravel.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 🎯 Project Vision

Oshocks Junior Bike Shop is building Kenya's central hub for cycling enthusiasts—a fully-featured marketplace that connects bicycle sellers with customers nationwide. Starting as an online extension of a physical cycling shop in Nairobi, the platform is designed to scale into a thriving multi-vendor ecosystem.

## ✨ Key Features

### For Customers
- **Advanced Product Discovery** - Intelligent search and filtering across thousands of products
- **Personalized Experience** - User accounts with shopping carts, wishlists, and order history
- **Product Reviews & Ratings** - Community-driven feedback system
- **Live Chat Support** - Real-time customer assistance via Tawk.to
- **Mobile-First Design** - Seamless experience across all devices

### For Sellers
- **Vendor Dashboards** - Complete inventory and order management
- **Product Listing Tools** - Easy product creation with image uploads
- **Sales Analytics** - Track performance and revenue
- **Order Fulfillment** - Streamlined order processing workflow

### Payment & Transactions
- **M-Pesa Integration** - Safaricom Daraja API for mobile money
- **Card Payments** - Stripe/Flutterwave for international transactions
- **Secure Processing** - PCI-compliant payment handling
- **Email Notifications** - Automated order confirmations and updates

## 🏗️ Architecture

### Frontend
- **Framework**: React.js 18.x
- **Styling**: Tailwind CSS
- **State Management**: Redux / React Context API
- **Deployment**: Vercel / Netlify

### Backend
- **Framework**: Laravel 10.x (PHP)
- **API**: RESTful architecture
- **Authentication**: Laravel Sanctum / Passport
- **Deployment**: Railway.app / Render.com

### Database
- **Primary DB**: MySQL
- **Caching**: Redis
- **Hosting**: PlanetScale / Supabase

### Third-Party Services
- **Image Storage**: Cloudinary (25GB free tier)
- **Email**: SendGrid / Resend
- **Search**: Algolia / MeiliSearch
- **Live Chat**: Tawk.to
- **Payments**: M-Pesa Daraja API, Stripe, Flutterwave

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PHP (v8.1 or higher)
- Composer
- MySQL (v8.0 or higher)
- Redis (optional, for caching)

### Installation

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your API endpoints

# Start development server
npm run dev
```

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Create environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database and services in .env
# Run migrations
php artisan migrate

# Seed database with sample data (optional)
php artisan db:seed

# Start development server
php artisan serve
```

### Environment Variables

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
VITE_TAWK_PROPERTY_ID=your_tawk_property_id
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

#### Backend (.env)
```
APP_NAME="Oshocks Junior Bike Shop"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=oshocks_db
DB_USERNAME=root
DB_PASSWORD=

MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey

STRIPE_KEY=your_stripe_key
STRIPE_SECRET=your_stripe_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAIL_MAILER=sendgrid
MAIL_FROM_ADDRESS=noreply@oshocks.com
SENDGRID_API_KEY=your_sendgrid_key
```

## 📁 Project Structure

```
oshocks-junior-bike-shop/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── redux/           # State management
│   │   ├── services/        # API integration
│   │   ├── utils/           # Helper functions
│   │   └── App.jsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/ # API controllers
│   │   │   └── Middleware/  # Custom middleware
│   │   ├── Models/          # Eloquent models
│   │   └── Services/        # Business logic
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── seeders/         # Data seeders
│   ├── routes/
│   │   └── api.php          # API routes
│   └── composer.json
│
├── docs/                    # Documentation
├── .gitignore
├── LICENSE
└── README.md
```

## 🗺️ Roadmap

### Phase 1: Core E-Commerce (Current)
- [x] Project setup and architecture
- [ ] Product catalog with categories
- [ ] Shopping cart functionality
- [ ] User authentication and accounts
- [ ] Basic checkout process
- [ ] M-Pesa payment integration

### Phase 2: Enhanced Features
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Order tracking
- [ ] Email notifications
- [ ] Search optimization with Algolia/MeiliSearch

### Phase 3: Multi-Vendor Platform
- [ ] Seller registration and onboarding
- [ ] Vendor dashboards
- [ ] Commission system
- [ ] Seller analytics
- [ ] Multi-vendor order management

### Phase 4: Advanced Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Loyalty program
- [ ] International shipping
- [ ] API for third-party integrations

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📝 Development Guidelines

- Follow PSR-12 coding standards for PHP
- Use ESLint and Prettier for JavaScript/React code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
php artisan test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Founder & Lead Developer** - Building Kenya's premier cycling marketplace

## 📞 Contact & Support

- **Website**: [Coming Soon]
- **Email**: support@oshocks.com
- **Location**: Nairobi, Kenya

## 🙏 Acknowledgments

- Inspired by Amazon and Alibaba's marketplace models
- Built for the Kenyan cycling community
- Powered by open-source technologies

## 📊 Project Status

**Current Status**: 🚧 In Active Development

- Frontend: Initial Setup
- Backend: Initial Setup
- Payment Integration: Planned
- Deployment: Pending

---

**Made with ❤️ for Kenyan Cyclists**