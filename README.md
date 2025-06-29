# LocalKirana - Local Store Management Platform

LocalKirana is a comprehensive web platform that connects local kirana stores with customers, enabling shopkeepers to onboard their stores and customers to discover, browse, and book items from nearby stores.

## Features

### For Shopkeepers
- **Store Registration**: Easy onboarding process with store details and location
- **Product Management**: Add and manage product listings with prices and availability
- **Customer Notifications**: Receive item requests from customers
- **Store Profile**: Update store information and address

### For Customers
- **Store Discovery**: Find nearby kirana stores based on location
- **Product Browsing**: View available products and prices from different stores
- **Item Booking**: Reserve items for pickup
- **Item Requests**: Request items not currently listed
- **Direct Contact**: Call stores directly from the platform

### Technical Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live store status and product availability
- **Location-based Search**: Find stores by area or pincode
- **JSON Database**: Lightweight data storage using JSON files
- **RESTful API**: Clean API endpoints for all operations

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python 3 with built-in HTTP server
- **Database**: JSON file storage
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## Installation & Setup

1. **Clone or download the project files**

2. **Ensure Python 3 is installed**
   ```bash
   python --version
   ```

3. **Run the server**
   ```bash
   python server.py
   ```

4. **Access the application**
   Open your browser and go to `http://localhost:8000`

## Project Structure

```
LocalKirana/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript
├── server.py           # Python backend server
├── data/               # JSON database files
│   ├── stores.json     # Store data
│   ├── bookings.json   # Booking records
│   └── requests.json   # Item requests
└── README.md           # This file
```

## API Endpoints

### GET Endpoints
- `GET /api/stores` - Retrieve all stores
- `GET /api/bookings` - Retrieve all bookings
- `GET /api/requests` - Retrieve all item requests

### POST Endpoints
- `POST /api/register-shop` - Register a new store
- `POST /api/book-item` - Book an item from a store
- `POST /api/request-item` - Request an item
- `POST /api/update-store` - Update store information

## Usage Guide

### For Shopkeepers

1. **Register Your Store**
   - Click "Join as Shopkeeper" button
   - Fill in store details including name, address, category
   - Submit the form to go live

2. **Manage Your Store**
   - Your store will appear in the stores listing
   - Customers can view your products and contact you
   - You'll receive notifications for item requests

### For Customers

1. **Access the Platform**
   - Click "Customer Login" or "Start Shopping"
   - Enter your details and location

2. **Find Stores**
   - Use the search feature to find stores by location
   - Browse stores by category
   - View store details and available products

3. **Book Items**
   - Click on a store to view products
   - Book available items for pickup
   - Request items that aren't listed

## Data Storage

The application uses JSON files for data persistence:

- **stores.json**: Contains all registered store information
- **bookings.json**: Records of all item bookings
- **requests.json**: Customer item requests

## Customization

### Adding New Store Categories
Edit the category options in both `index.html` and `script.js`:

```javascript
const categories = {
    grocery: 'Grocery Store',
    medical: 'Medical Store',
    stationery: 'Stationery',
    electronics: 'Electronics',
    general: 'General Store',
    // Add new categories here
};
```

### Modifying Default Products
Update the `get_default_products()` function in `server.py` to change default product listings for each category.

### Styling Changes
Modify `styles.css` to customize the appearance. The CSS uses CSS Grid and Flexbox for responsive layouts.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Considerations

For production deployment, consider:
- Input validation and sanitization
- HTTPS encryption
- Authentication and authorization
- Rate limiting
- Database security (migrate from JSON to proper database)

## Future Enhancements

- Real-time notifications (WebSocket/Server-Sent Events)
- Payment integration
- Order tracking
- Review and rating system
- Advanced search and filtering
- Mobile app development
- Integration with mapping services
- Inventory management for shopkeepers

## Support

For issues or questions, please check the code comments or modify the application according to your needs.

## License

This project is open source and available under the MIT License.