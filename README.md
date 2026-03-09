# 🚴 Zomato Rider App - Delivery Partner Application

A premium, modern delivery partner application inspired by Zomato Rider. Built with vanilla HTML, CSS, and JavaScript featuring a stunning dark theme with glassmorphism effects.

## ✨ Features

### 🔐 Authentication
- Phone number-based login
- Secure rider authentication
- Auto-login for demo purposes

### 📊 Dashboard
- Real-time online/offline status toggle
- Today's earnings summary
- Delivery statistics (orders, distance, tips)
- Active orders list
- Quick action buttons

### 📦 Order Management
- Accept/Reject new orders
- Real-time order notifications
- Detailed order information
- Pickup and delivery locations
- Customer contact details
- Order status tracking (Pending, Picked, Delivered)
- Navigation integration
- Order completion

### 💰 Earnings
- Weekly earnings overview
- Earnings breakdown (Base Fare, Tips, Incentives)
- Transaction history
- Growth indicators
- Visual progress bars

### 👤 Profile
- Rider information
- Performance statistics
- Rating system
- Personal information management
- Document management
- Bank details
- Settings
- Logout functionality

### 🎨 Design Features
- **Dark Theme**: Modern dark color scheme with Zomato red accents
- **Glassmorphism**: Beautiful frosted glass effects
- **Smooth Animations**: Micro-interactions and transitions
- **Responsive Design**: Mobile-first approach, works on all devices
- **Premium UI**: Gradient backgrounds, shadows, and modern typography
- **Interactive Elements**: Hover effects, click animations
- **Real-time Updates**: Live status indicators and notifications

## 🎯 Tech Stack

- **HTML5**: Semantic markup with proper SEO
- **CSS3**: Custom properties, animations, glassmorphism
- **Vanilla JavaScript**: No frameworks, pure JS
- **Google Fonts**: Inter font family
- **SVG Icons**: Custom inline SVG graphics

## 🚀 Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in your browser
3. That's it! No build process required.

### Demo Login

For demo purposes, the app auto-fills the phone number after 1 second:
- Phone: `9876543210`
- Just click "Continue" to login

## 📱 Usage

### Login
1. Enter your 10-digit phone number
2. Click "Continue"
3. You'll be redirected to the dashboard

### Going Online/Offline
- Click the "Go Offline" button in the status card
- Toggle between online and offline status
- Only receive orders when online

### Managing Orders
1. New orders appear as notifications when online
2. Click "Accept" to take the order
3. Click "Reject" to decline
4. View order details by clicking on order cards
5. Use "Navigate" to open maps
6. Click "Complete" when delivery is done

### Viewing Earnings
- Click "Earnings" in bottom navigation
- View weekly earnings and breakdown
- Check transaction history

### Profile Management
- Click profile icon or "Profile" in bottom nav
- View your statistics and rating
- Access settings and documents
- Logout from the app

## 🎨 Color Scheme

```css
Primary: #E23744 (Zomato Red)
Primary Dark: #C62828
Primary Light: #FF6B6B
Success: #4CAF50
Warning: #FFC107
Info: #2196F3

Background: #0A0E27 → #151932 → #1E2139 (Gradient)
```

## 📂 File Structure

```
my delivery/
├── index.html          # Main HTML file
├── styles.css          # All styling and animations
├── app.js             # Application logic and functionality
└── README.md          # This file
```

## 🔧 Customization

### Changing Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #E23744;
    --bg-primary: #0A0E27;
    /* ... more variables */
}
```

### Adding Features
All app logic is in `app.js`:
- `AppState`: Manages application state
- `sampleOrders`: Sample order data
- Event listeners and handlers
- View management functions

## 🌟 Key Features Explained

### State Management
The app uses a centralized state object (`AppState`) to manage:
- Online/offline status
- Current view
- Rider information
- Active orders
- Earnings and transactions

### View System
Multiple views managed by `switchView()`:
- Dashboard
- Order Details
- Earnings
- Profile

### Notification System
Custom notification system with:
- Success, error, info, and warning types
- Auto-dismiss after 3 seconds
- Smooth slide-in/out animations
- Sound alerts for new orders

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 480px
- Touch-friendly buttons and cards
- Optimized for all screen sizes

## 🎭 Demo Data

The app includes sample data for demonstration:
- 2 active orders
- 8 recent transactions
- Rider statistics
- Earnings breakdown

## 🔒 Security Notes

For production use:
- Implement proper authentication
- Add backend API integration
- Secure phone number verification
- Add JWT tokens
- Implement proper session management

## 📈 Future Enhancements

- [ ] Real-time GPS tracking
- [ ] Push notifications
- [ ] Chat with customer
- [ ] Multiple language support
- [ ] Dark/Light theme toggle
- [ ] Offline mode with sync
- [ ] Performance analytics
- [ ] Referral system
- [ ] Achievement badges

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs!

## 📄 License

Free to use for personal and commercial projects.

## 👨‍💻 Developer

Created by **Rupesh Vishwakarma**
- Portfolio: [TheVTechLabs](https://thevtechlabs.com)
- GitHub: [@Rupesh033](https://github.com/Rupesh033)

## 🙏 Acknowledgments

- Design inspired by Zomato Rider App
- Icons: Custom SVG graphics
- Fonts: Google Fonts (Inter)

---

**Note**: This is a frontend demo application. For a production app, you'll need to integrate with a backend API for real order management, authentication, and data persistence.

## 🎉 Enjoy!

Happy delivering! 🚴‍♂️📦
