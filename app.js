// ===========================
// App State Management
// ===========================
const AppState = {
    isOnline: true,
    currentView: 'dashboard',
    currentScreen: 'login',
    riderInfo: {
        name: 'Rupesh Vishwakarma',
        phone: '',
        riderId: 'ZR2024001',
        rating: 4.8,
        totalDeliveries: 2456,
        onTimeRate: 98,
        daysActive: 156
    },
    todayStats: {
        earnings: 1240,
        deliveries: 12,
        distance: 45,
        tips: 180
    },
    activeOrders: [],
    orderHistory: [],
    transactions: []
};

// ===========================
// Sample Data
// ===========================
const sampleOrders = [
    {
        id: 'ORD001',
        status: 'pending',
        restaurant: {
            name: 'Burger King',
            address: 'Shop 12, Phoenix Mall, MG Road, Bangalore'
        },
        customer: {
            name: 'Rahul Sharma',
            address: 'Flat 302, Green Valley Apartments, Koramangala, Bangalore',
            phone: '+91 98765 43210'
        },
        amount: 450,
        distance: 3.2,
        items: ['Whopper Burger', 'French Fries', 'Coke'],
        orderTime: '14:25',
        estimatedTime: '15:10'
    },
    {
        id: 'ORD002',
        status: 'picked',
        restaurant: {
            name: 'Dominos Pizza',
            address: '45, Brigade Road, Bangalore'
        },
        customer: {
            name: 'Priya Patel',
            address: 'House 15, Sector 7, HSR Layout, Bangalore',
            phone: '+91 87654 32109'
        },
        amount: 680,
        distance: 4.5,
        items: ['Margherita Pizza', 'Garlic Bread', 'Pepsi'],
        orderTime: '14:15',
        estimatedTime: '15:00'
    }
];

const sampleTransactions = [
    { id: 'TXN001', title: 'Order #ORD125', date: 'Today, 2:30 PM', amount: 120 },
    { id: 'TXN002', title: 'Order #ORD124', date: 'Today, 1:45 PM', amount: 95 },
    { id: 'TXN003', title: 'Order #ORD123', date: 'Today, 12:20 PM', amount: 150 },
    { id: 'TXN004', title: 'Tip from customer', date: 'Today, 11:30 AM', amount: 50 },
    { id: 'TXN005', title: 'Order #ORD122', date: 'Today, 10:15 AM', amount: 180 },
    { id: 'TXN006', title: 'Order #ORD121', date: 'Today, 9:45 AM', amount: 110 },
    { id: 'TXN007', title: 'Peak hour bonus', date: 'Today, 9:00 AM', amount: 100 },
    { id: 'TXN008', title: 'Order #ORD120', date: 'Today, 8:30 AM', amount: 85 }
];

// ===========================
// DOM Elements
// ===========================
const elements = {
    // Screens
    loginScreen: document.getElementById('loginScreen'),
    mainApp: document.getElementById('mainApp'),
    
    // Login
    phoneInput: document.getElementById('phoneNumber'),
    loginBtn: document.getElementById('loginBtn'),
    
    // Navigation
    bottomNavItems: document.querySelectorAll('.bottom-nav .nav-item'),
    notificationBtn: document.getElementById('notificationBtn'),
    profileBtn: document.getElementById('profileBtn'),
    
    // Views
    dashboardView: document.getElementById('dashboardView'),
    orderDetailView: document.getElementById('orderDetailView'),
    earningsView: document.getElementById('earningsView'),
    profileView: document.getElementById('profileView'),
    
    // Dashboard
    toggleStatusBtn: document.getElementById('toggleStatusBtn'),
    activeOrdersList: document.getElementById('activeOrdersList'),
    
    // Back buttons
    backToOrders: document.getElementById('backToOrders'),
    backFromEarnings: document.getElementById('backFromEarnings'),
    backFromProfile: document.getElementById('backFromProfile'),
    
    // Earnings
    transactionList: document.getElementById('transactionList'),
    
    // Modal
    orderNotificationModal: document.getElementById('orderNotificationModal'),
    notificationBody: document.getElementById('notificationBody'),
    acceptOrderBtn: document.getElementById('acceptOrderBtn'),
    rejectOrderBtn: document.getElementById('rejectOrderBtn')
};

// ===========================
// Initialization
// ===========================
function init() {
    setupEventListeners();
    loadSampleData();
    
    // Auto-login for demo (remove in production)
    setTimeout(() => {
        if (AppState.currentScreen === 'login') {
            elements.phoneInput.value = '9876543210';
            handleLogin();
        }
    }, 1000);
}

// ===========================
// Event Listeners
// ===========================
function setupEventListeners() {
    // Login
    elements.loginBtn.addEventListener('click', handleLogin);
    elements.phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Phone input validation
    elements.phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
    
    // Bottom Navigation
    elements.bottomNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            switchView(view);
            
            // Update active state
            elements.bottomNavItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Status Toggle
    elements.toggleStatusBtn.addEventListener('click', toggleOnlineStatus);
    
    // Back buttons
    elements.backToOrders.addEventListener('click', () => switchView('dashboard'));
    elements.backFromEarnings.addEventListener('click', () => switchView('dashboard'));
    elements.backFromProfile.addEventListener('click', () => switchView('dashboard'));
    
    // Profile button
    elements.profileBtn.addEventListener('click', () => {
        switchView('profile');
        elements.bottomNavItems.forEach(nav => nav.classList.remove('active'));
        document.querySelector('[data-view="profile"]').classList.add('active');
    });
    
    // Quick actions
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', () => {
            const action = card.dataset.action;
            handleQuickAction(action);
        });
    });
    
    // Modal actions
    elements.acceptOrderBtn.addEventListener('click', acceptOrder);
    elements.rejectOrderBtn.addEventListener('click', rejectOrder);
    
    // Logout
    document.querySelector('.menu-item.logout').addEventListener('click', handleLogout);
}

// ===========================
// Authentication
// ===========================
function handleLogin() {
    const phone = elements.phoneInput.value.trim();
    
    if (phone.length !== 10) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    // Store phone
    AppState.riderInfo.phone = phone;
    
    // Switch to main app
    elements.loginScreen.classList.remove('active');
    elements.mainApp.classList.add('active');
    AppState.currentScreen = 'main';
    
    // Show welcome notification
    setTimeout(() => {
        showNotification(`Welcome back, ${AppState.riderInfo.name}!`, 'success');
        
        // Simulate new order after 3 seconds
        setTimeout(() => {
            showNewOrderNotification(sampleOrders[0]);
        }, 3000);
    }, 500);
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        elements.mainApp.classList.remove('active');
        elements.loginScreen.classList.add('active');
        AppState.currentScreen = 'login';
        elements.phoneInput.value = '';
        
        // Reset state
        AppState.activeOrders = [];
        switchView('dashboard');
    }
}

// ===========================
// View Management
// ===========================
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    switch(viewName) {
        case 'dashboard':
            elements.dashboardView.classList.add('active');
            break;
        case 'orders':
            elements.dashboardView.classList.add('active');
            // Scroll to orders section
            document.querySelector('.orders-section').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'earnings':
            elements.earningsView.classList.add('active');
            renderTransactions();
            break;
        case 'profile':
            elements.profileView.classList.add('active');
            break;
    }
    
    AppState.currentView = viewName;
}

// ===========================
// Online Status
// ===========================
function toggleOnlineStatus() {
    AppState.isOnline = !AppState.isOnline;
    
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    const toggleBtn = elements.toggleStatusBtn;
    
    if (AppState.isOnline) {
        statusIndicator.classList.add('online');
        statusIndicator.classList.remove('offline');
        statusText.textContent = "You're Online";
        toggleBtn.textContent = 'Go Offline';
        showNotification('You are now online and will receive orders', 'success');
    } else {
        statusIndicator.classList.remove('online');
        statusIndicator.classList.add('offline');
        statusText.textContent = "You're Offline";
        toggleBtn.textContent = 'Go Online';
        showNotification('You are now offline', 'info');
    }
}

// ===========================
// Orders Management
// ===========================
function loadSampleData() {
    AppState.activeOrders = [...sampleOrders];
    AppState.transactions = [...sampleTransactions];
    renderActiveOrders();
}

function renderActiveOrders() {
    elements.activeOrdersList.innerHTML = '';
    
    if (AppState.activeOrders.length === 0) {
        elements.activeOrdersList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <svg style="width: 80px; height: 80px; margin: 0 auto 1rem; opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke-width="2"/>
                </svg>
                <p style="font-size: 1.125rem; font-weight: 600;">No active orders</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">New orders will appear here</p>
            </div>
        `;
        return;
    }
    
    AppState.activeOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        elements.activeOrdersList.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
        <div class="order-header">
            <span class="order-id">#${order.id}</span>
            <span class="order-status ${order.status}">${formatStatus(order.status)}</span>
        </div>
        
        <div class="order-details">
            <div class="order-location">
                <svg class="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2"/>
                    <circle cx="12" cy="10" r="3" stroke-width="2"/>
                </svg>
                <div class="location-text">
                    <p class="location-label">Pickup</p>
                    <p class="location-address">${order.restaurant.name}</p>
                </div>
            </div>
            
            <div class="order-location">
                <svg class="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke-width="2"/>
                </svg>
                <div class="location-text">
                    <p class="location-label">Delivery</p>
                    <p class="location-address">${order.customer.address.split(',')[0]}</p>
                </div>
            </div>
        </div>
        
        <div class="order-footer">
            <span class="order-amount">₹${order.amount}</span>
            <span class="order-distance">${order.distance} km</span>
        </div>
    `;
    
    card.addEventListener('click', () => showOrderDetail(order));
    
    return card;
}

function showOrderDetail(order) {
    const detailContent = document.getElementById('orderDetailContent');
    detailContent.innerHTML = `
        <div style="background: var(--bg-glass); backdrop-filter: blur(20px); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-bottom: var(--spacing-md);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
                <h3 style="font-size: var(--font-size-xl); font-weight: 700;">Order #${order.id}</h3>
                <span class="order-status ${order.status}">${formatStatus(order.status)}</span>
            </div>
            
            <div style="margin-bottom: var(--spacing-lg);">
                <h4 style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Restaurant</h4>
                <p style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-xs);">${order.restaurant.name}</p>
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">${order.restaurant.address}</p>
            </div>
            
            <div style="margin-bottom: var(--spacing-lg);">
                <h4 style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Customer</h4>
                <p style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-xs);">${order.customer.name}</p>
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-xs);">${order.customer.address}</p>
                <a href="tel:${order.customer.phone}" style="color: var(--primary); font-size: var(--font-size-sm); text-decoration: none; font-weight: 600;">${order.customer.phone}</a>
            </div>
            
            <div style="margin-bottom: var(--spacing-lg);">
                <h4 style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Items</h4>
                <ul style="list-style: none; padding: 0;">
                    ${order.items.map(item => `<li style="padding: var(--spacing-xs) 0; font-size: var(--font-size-sm);">• ${item}</li>`).join('')}
                </ul>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--border-color);">
                <div>
                    <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 4px;">Order Amount</p>
                    <p style="font-size: var(--font-size-xl); font-weight: 700; color: var(--success);">₹${order.amount}</p>
                </div>
                <div>
                    <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 4px;">Distance</p>
                    <p style="font-size: var(--font-size-xl); font-weight: 700;">${order.distance} km</p>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md);">
            <button class="btn btn-secondary" onclick="window.open('https://maps.google.com', '_blank')" style="padding: var(--spacing-md);">
                <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2"/>
                    <circle cx="12" cy="10" r="3" stroke-width="2"/>
                </svg>
                Navigate
            </button>
            <button class="btn btn-primary" onclick="completeOrder('${order.id}')" style="padding: var(--spacing-md);">
                <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Complete
            </button>
        </div>
    `;
    
    switchView('orderDetail');
}

function showNewOrderNotification(order) {
    if (!AppState.isOnline) return;
    
    elements.notificationBody.innerHTML = `
        <div style="margin-bottom: var(--spacing-md);">
            <h4 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-sm);">${order.restaurant.name}</h4>
            <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Pickup: ${order.restaurant.address.split(',')[0]}</p>
            <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">Delivery: ${order.customer.address.split(',')[0]}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); padding: var(--spacing-md); background: var(--bg-glass); border-radius: var(--radius-md);">
            <div style="text-align: center;">
                <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 4px;">Amount</p>
                <p style="font-size: var(--font-size-xl); font-weight: 700; color: var(--success);">₹${order.amount}</p>
            </div>
            <div style="text-align: center;">
                <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 4px;">Distance</p>
                <p style="font-size: var(--font-size-xl); font-weight: 700;">${order.distance} km</p>
            </div>
        </div>
    `;
    
    elements.orderNotificationModal.classList.add('active');
    
    // Play notification sound (optional)
    playNotificationSound();
}

function acceptOrder() {
    elements.orderNotificationModal.classList.remove('active');
    showNotification('Order accepted! Navigate to pickup location', 'success');
    renderActiveOrders();
}

function rejectOrder() {
    elements.orderNotificationModal.classList.remove('active');
    showNotification('Order rejected', 'info');
}

window.completeOrder = function(orderId) {
    const orderIndex = AppState.activeOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        const order = AppState.activeOrders[orderIndex];
        AppState.activeOrders.splice(orderIndex, 1);
        AppState.todayStats.earnings += order.amount;
        AppState.todayStats.deliveries += 1;
        
        renderActiveOrders();
        switchView('dashboard');
        showNotification(`Order completed! ₹${order.amount} added to earnings`, 'success');
        
        // Update stats
        updateDashboardStats();
    }
};

function updateDashboardStats() {
    document.querySelector('.earning-value').textContent = `₹${AppState.todayStats.earnings}`;
    document.querySelectorAll('.earning-value')[1].textContent = AppState.todayStats.deliveries;
}

// ===========================
// Transactions
// ===========================
function renderTransactions() {
    elements.transactionList.innerHTML = '';
    
    AppState.transactions.forEach(txn => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <div class="transaction-info">
                <p class="transaction-title">${txn.title}</p>
                <p class="transaction-date">${txn.date}</p>
            </div>
            <p class="transaction-amount">+₹${txn.amount}</p>
        `;
        elements.transactionList.appendChild(item);
    });
}

// ===========================
// Quick Actions
// ===========================
function handleQuickAction(action) {
    switch(action) {
        case 'earnings':
            switchView('earnings');
            elements.bottomNavItems.forEach(nav => nav.classList.remove('active'));
            document.querySelector('[data-view="earnings"]').classList.add('active');
            break;
        case 'history':
            showNotification('Order history feature coming soon!', 'info');
            break;
        case 'support':
            showNotification('Support: Call 1800-123-4567', 'info');
            break;
        case 'settings':
            showNotification('Settings feature coming soon!', 'info');
            break;
    }
}

// ===========================
// Notifications
// ===========================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 1rem 1.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(20px);
    `;
    
    const color = {
        success: 'var(--success)',
        error: 'var(--danger)',
        info: 'var(--info)',
        warning: 'var(--warning)'
    }[type] || 'var(--info)';
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 4px; height: 40px; background: ${color}; border-radius: 2px;"></div>
            <p style="flex: 1; font-size: 0.875rem; color: var(--text-primary);">${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function playNotificationSound() {
    // Create a simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ===========================
// Utility Functions
// ===========================
function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending Pickup',
        'picked': 'On Delivery',
        'delivered': 'Delivered'
    };
    return statusMap[status] || status;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===========================
// Start Application
// ===========================
document.addEventListener('DOMContentLoaded', init);
