# LocalKirana - Production Deployment Guide

## 🚀 Production-Ready Features

Your LocalKirana platform now includes:

✅ **MySQL Database Integration**
✅ **Secure Password Hashing (bcrypt)**
✅ **Environment Configuration**
✅ **Production Server (server_mysql.py)**
✅ **Database Schema & Migrations**
✅ **Full CRUD Operations**
✅ **Real-time Chat System**
✅ **Booking Management**
✅ **Product Management**
✅ **Profile Management**
✅ **Request Management**

## 📋 Prerequisites

1. **Python 3.8+**
2. **MySQL 8.0+**
3. **Git**

## 🛠️ Local Development Setup

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Setup MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Run the schema
mysql -u root -p < database/schema.sql
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your MySQL credentials
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=localkirana_db
DB_PORT=3306
```

### Step 4: Run Development Server
```bash
python server_mysql.py
```

Visit: `http://localhost:8000`

## 🌐 Production Deployment Options

### Option 1: Railway (Recommended - Easiest)
- ✅ Automatic MySQL setup
- ✅ Zero configuration
- ✅ Free tier available
- ✅ GitHub integration

[Follow Railway Guide](deployment/railway.md)

### Option 2: Render
- ✅ PostgreSQL/MySQL support
- ✅ Free tier available
- ✅ Automatic deployments

[Follow Render Guide](deployment/render.md)

### Option 3: DigitalOcean App Platform
- ✅ Managed databases
- ✅ Scalable infrastructure
- ✅ Affordable pricing

### Option 4: AWS/Google Cloud
- ✅ Enterprise-grade
- ✅ Full control
- ✅ Scalable

## 🔧 Database Schema

The platform uses these main tables:
- `customers` - Customer accounts
- `stores` - Shop/store information
- `products` - Product catalog
- `bookings` - Item bookings
- `requests` - Item requests
- `chats` - Chat conversations
- `messages` - Chat messages

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt
- **SQL Injection Protection**: Parameterized queries
- **Environment Variables**: Sensitive data protection
- **CORS Headers**: Cross-origin security

## 📱 API Endpoints

### Authentication
- `POST /api/customer-register`
- `POST /api/customer-login`
- `POST /api/shopkeeper-login`

### Store Management
- `GET /api/stores`
- `POST /api/register-shop`
- `POST /api/update-store`

### Product Management
- `POST /api/add-product`
- `POST /api/update-product`
- `POST /api/delete-product`

### Booking System
- `POST /api/book-item`
- `POST /api/update-booking-status`
- `GET /api/bookings`

### Request System
- `POST /api/request-item`
- `GET /api/requests`

### Chat System
- `POST /api/save-chat`
- `GET /api/chats`

## 🎯 Production Checklist

Before deploying:

- [ ] Set up MySQL database
- [ ] Configure environment variables
- [ ] Test all API endpoints
- [ ] Set DEBUG=False
- [ ] Configure proper SECRET_KEY
- [ ] Set up SSL/HTTPS
- [ ] Configure domain name
- [ ] Set up monitoring
- [ ] Configure backups

## 🔄 Migration from JSON to MySQL

Your existing JSON data can be migrated:

1. Export JSON data
2. Run database schema
3. Import data using migration scripts
4. Switch to MySQL server
5. Test all functionality

## 📊 Performance Optimization

For high traffic:
- Enable MySQL query caching
- Add database indexes
- Implement connection pooling
- Use CDN for static files
- Enable gzip compression
- Add Redis for caching

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u username -p -h hostname database_name
```

### Environment Variables
```bash
# Check if .env is loaded
python -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('DB_HOST'))"
```

### Port Issues
```bash
# Check if port is in use
netstat -tulpn | grep :8000
```

## 📞 Support

For deployment issues:
1. Check logs in your hosting platform
2. Verify database connection
3. Confirm environment variables
4. Test API endpoints individually

## 🎉 Success!

Once deployed, your LocalKirana platform will be fully functional with:
- Real-time data persistence
- Multi-user support
- Secure authentication
- Complete store management
- Chat functionality
- Booking system
- Request management

Your platform is now ready for production use! 🚀