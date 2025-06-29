// Global variables
let currentUser = null;
let currentUserType = null;
let currentStore = null;
let currentChat = null;
let chatPollingInterval = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadStores();
    updateStats();
    
    // Set up form event listeners
    setupFormListeners();
    
    // Set up navigation
    setupNavigation();
    
    // Check for existing session
    checkExistingSession();
});

function initializeApp() {
    console.log('LocalKirana app initialized');
}

function setupFormListeners() {
    // Customer registration form
    const customerRegisterForm = document.getElementById('customerRegisterForm');
    if (customerRegisterForm) {
        customerRegisterForm.addEventListener('submit', handleCustomerRegister);
    }
    
    // Customer login form
    const customerLoginForm = document.getElementById('customerLoginForm');
    if (customerLoginForm) {
        customerLoginForm.addEventListener('submit', handleCustomerLogin);
    }
    
    // Shopkeeper registration form
    const shopkeeperRegisterForm = document.getElementById('shopkeeperRegisterForm');
    if (shopkeeperRegisterForm) {
        shopkeeperRegisterForm.addEventListener('submit', handleShopkeeperRegister);
    }
    
    // Shopkeeper login form
    const shopkeeperLoginForm = document.getElementById('shopkeeperLoginForm');
    if (shopkeeperLoginForm) {
        shopkeeperLoginForm.addEventListener('submit', handleShopkeeperLogin);
    }
    
    // Request form
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', handleItemRequest);
    }
    
    // Edit profile form
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
    
    // Edit product form
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleEditProduct);
    }
    
    // Chat form
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatMessage);
    }
}

function setupNavigation() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function checkExistingSession() {
    const savedUser = localStorage.getItem('currentUser');
    const savedUserType = localStorage.getItem('currentUserType');
    
    if (savedUser && savedUserType) {
        currentUser = JSON.parse(savedUser);
        currentUserType = savedUserType;
        updateNavigation();
    }
}

// Authentication functions
async function handleCustomerRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: document.getElementById('customerRegisterName').value,
        phone: document.getElementById('customerRegisterPhone').value,
        email: document.getElementById('customerRegisterEmail').value,
        location: document.getElementById('customerRegisterLocation').value,
        password: document.getElementById('customerRegisterPassword').value
    };
    
    // Validate password confirmation
    const confirmPassword = document.getElementById('customerConfirmPassword').value;
    if (data.password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/customer-register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Registration successful! Please login.', 'success');
            switchTab('customerLogin');
            e.target.reset();
        } else {
            showMessage(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    }
}

async function handleCustomerLogin(e) {
    e.preventDefault();
    
    const data = {
        phone: document.getElementById('customerLoginPhone').value,
        password: document.getElementById('customerLoginPassword').value
    };
    
    try {
        const response = await fetch('/api/customer-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.user;
            currentUserType = 'customer';
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('currentUserType', currentUserType);
            
            showMessage('Login successful!', 'success');
            hideModal('customerAuthModal');
            updateNavigation();
            e.target.reset();
        } else {
            showMessage(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please try again.', 'error');
    }
}

async function handleShopkeeperRegister(e) {
    e.preventDefault();
    
    const data = {
        shopName: document.getElementById('shopName').value,
        ownerName: document.getElementById('ownerName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        pincode: document.getElementById('pincode').value,
        category: document.getElementById('category').value,
        password: document.getElementById('shopkeeperPassword').value
    };
    
    // Validate password confirmation
    const confirmPassword = document.getElementById('shopkeeperConfirmPassword').value;
    if (data.password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/register-shop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Shop registered successfully! Please login.', 'success');
            switchTab('shopkeeperLogin');
            e.target.reset();
            loadStores(); // Refresh stores list
        } else {
            showMessage(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    }
}

async function handleShopkeeperLogin(e) {
    e.preventDefault();
    
    const data = {
        phone: document.getElementById('shopkeeperLoginPhone').value,
        password: document.getElementById('shopkeeperLoginPassword').value
    };
    
    try {
        const response = await fetch('/api/shopkeeper-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.user;
            currentUserType = 'shopkeeper';
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('currentUserType', currentUserType);
            
            showMessage('Login successful!', 'success');
            hideModal('shopkeeperAuthModal');
            updateNavigation();
            e.target.reset();
        } else {
            showMessage(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    currentUserType = null;
    
    // Clear localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUserType');
    
    // Stop chat polling
    if (chatPollingInterval) {
        clearInterval(chatPollingInterval);
        chatPollingInterval = null;
    }
    
    updateNavigation();
    showMessage('Logged out successfully', 'success');
}

function updateNavigation() {
    const guestNav = document.getElementById('guestNav');
    const customerNav = document.getElementById('customerNav');
    const shopkeeperNav = document.getElementById('shopkeeperNav');
    
    // Hide all navigation elements
    if (guestNav) guestNav.style.display = 'none';
    if (customerNav) customerNav.style.display = 'none';
    if (shopkeeperNav) shopkeeperNav.style.display = 'none';
    
    if (currentUser && currentUserType) {
        if (currentUserType === 'customer') {
            if (customerNav) {
                customerNav.style.display = 'flex';
                const nameElement = document.getElementById('customerNameNav');
                if (nameElement) nameElement.textContent = currentUser.name;
            }
        } else if (currentUserType === 'shopkeeper') {
            if (shopkeeperNav) {
                shopkeeperNav.style.display = 'flex';
                const nameElement = document.getElementById('shopkeeperNameNav');
                if (nameElement) nameElement.textContent = currentUser.owner_name || currentUser.shop_name;
            }
        }
    } else {
        if (guestNav) guestNav.style.display = 'flex';
    }
}

// Store functions
async function loadStores() {
    try {
        const response = await fetch('/api/stores');
        const result = await response.json();
        
        if (result.success) {
            displayStores(result.stores);
            updateStats();
        } else {
            console.error('Failed to load stores:', result.message);
        }
    } catch (error) {
        console.error('Error loading stores:', error);
    }
}

function displayStores(stores) {
    const storesGrid = document.getElementById('storesGrid');
    if (!storesGrid) return;
    
    if (stores.length === 0) {
        storesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-store"></i>
                <h3>No stores found</h3>
                <p>Be the first to register your store!</p>
            </div>
        `;
        return;
    }
    
    storesGrid.innerHTML = stores.map(store => `
        <div class="store-card">
            <div class="store-header">
                <div class="store-info">
                    <h3>${store.shop_name}</h3>
                    <span class="store-category">${getCategoryName(store.category)}</span>
                </div>
            </div>
            <div class="store-details">
                <div class="store-detail">
                    <i class="fas fa-user"></i>
                    <span>${store.owner_name}</span>
                </div>
                <div class="store-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${store.address}</span>
                </div>
                <div class="store-detail">
                    <i class="fas fa-phone"></i>
                    <span>${store.phone}</span>
                </div>
                <div class="store-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${store.email}</span>
                </div>
            </div>
            <div class="store-actions">
                <button class="btn-primary btn-small" onclick="viewStore(${store.id})">
                    <i class="fas fa-eye"></i>
                    View Store
                </button>
                <button class="btn-outline btn-small" onclick="callStore('${store.phone}')">
                    <i class="fas fa-phone"></i>
                    Call
                </button>
            </div>
        </div>
    `).join('');
}

function getCategoryName(category) {
    const categories = {
        grocery: 'Grocery Store',
        medical: 'Medical Store',
        stationery: 'Stationery',
        electronics: 'Electronics',
        general: 'General Store'
    };
    return categories[category] || category;
}

async function viewStore(storeId) {
    try {
        const response = await fetch('/api/stores');
        const result = await response.json();
        
        if (result.success) {
            const store = result.stores.find(s => s.id === storeId);
            if (store) {
                currentStore = store;
                displayStoreModal(store);
                showModal('storeModal');
            }
        }
    } catch (error) {
        console.error('Error loading store details:', error);
        showMessage('Failed to load store details', 'error');
    }
}

function displayStoreModal(store) {
    const modalTitle = document.getElementById('storeModalTitle');
    const modalContent = document.getElementById('storeModalContent');
    
    if (modalTitle) {
        modalTitle.textContent = store.shop_name;
    }
    
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="store-modal-content">
                <div class="store-modal-header">
                    <div class="store-modal-info">
                        <h3>${store.shop_name}</h3>
                        <span class="store-category">${getCategoryName(store.category)}</span>
                    </div>
                </div>
                
                <div class="store-modal-details">
                    <div class="detail-item">
                        <i class="fas fa-user"></i>
                        <span>Owner: ${store.owner_name}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span>${store.phone}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span>${store.email}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${store.address}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-pin"></i>
                        <span>Pincode: ${store.pincode}</span>
                    </div>
                </div>
                
                <div class="products-section">
                    <h4>Available Products</h4>
                    <div class="products-grid">
                        ${store.products && store.products.length > 0 ? 
                            store.products.map(product => `
                                <div class="product-item">
                                    <div class="product-info">
                                        <div class="product-name">${product.name}</div>
                                        <div class="product-price">${product.price}</div>
                                    </div>
                                    ${product.available ? 
                                        `<button class="btn-book" onclick="bookItem('${product.name}', '${product.price}')">
                                            <i class="fas fa-shopping-cart"></i>
                                            Book
                                        </button>` :
                                        `<span class="out-of-stock">Out of Stock</span>`
                                    }
                                </div>
                            `).join('') :
                            '<p>No products listed yet.</p>'
                        }
                    </div>
                </div>
                
                <div class="request-section">
                    <h4>Can't find what you're looking for?</h4>
                    <p>Request an item and the shopkeeper will get back to you!</p>
                    <div class="request-actions">
                        <button class="btn-primary" onclick="openRequestModal()">
                            <i class="fas fa-plus"></i>
                            Request Item
                        </button>
                        <button class="btn-outline" onclick="startChat('${store.id}', 'shopkeeper')">
                            <i class="fas fa-comments"></i>
                            Chat with Store
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

function callStore(phone) {
    window.open(`tel:${phone}`, '_self');
}

async function bookItem(itemName, price) {
    if (!currentUser || currentUserType !== 'customer') {
        showMessage('Please login as a customer to book items', 'error');
        showModal('customerAuthModal');
        return;
    }
    
    if (!currentStore) {
        showMessage('Store information not available', 'error');
        return;
    }
    
    const bookingData = {
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        storeName: currentStore.shop_name,
        storePhone: currentStore.phone,
        itemName: itemName
    };
    
    try {
        const response = await fetch('/api/book-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Item booked successfully! The store will contact you soon.', 'success');
            hideModal('storeModal');
        } else {
            showMessage(result.message || 'Booking failed', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showMessage('Booking failed. Please try again.', 'error');
    }
}

function openRequestModal() {
    if (!currentUser || currentUserType !== 'customer') {
        showMessage('Please login as a customer to request items', 'error');
        showModal('customerAuthModal');
        return;
    }
    
    hideModal('storeModal');
    showModal('requestModal');
}

async function handleItemRequest(e) {
    e.preventDefault();
    
    if (!currentUser || currentUserType !== 'customer') {
        showMessage('Please login as a customer to request items', 'error');
        return;
    }
    
    const data = {
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        customerLocation: currentUser.location,
        itemName: document.getElementById('requestItem').value,
        quantity: document.getElementById('requestQuantity').value,
        description: document.getElementById('requestDescription').value,
        targetStore: currentStore ? currentStore.shop_name : 'All Stores'
    };
    
    try {
        const response = await fetch('/api/request-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Item request sent successfully! Stores will contact you if available.', 'success');
            hideModal('requestModal');
            e.target.reset();
        } else {
            showMessage(result.message || 'Request failed', 'error');
        }
    } catch (error) {
        console.error('Request error:', error);
        showMessage('Request failed. Please try again.', 'error');
    }
}

// Dashboard functions
async function loadCustomerDashboard() {
    if (!currentUser || currentUserType !== 'customer') {
        showMessage('Please login as a customer', 'error');
        return;
    }
    
    const content = document.getElementById('customerDashboardContent');
    if (!content) return;
    
    content.innerHTML = `
        <div class="dashboard-tabs">
            <button class="tab-btn active" onclick="switchDashboardTab('customerBookings')">My Bookings</button>
            <button class="tab-btn" onclick="switchDashboardTab('customerRequests')">My Requests</button>
            <button class="tab-btn" onclick="switchDashboardTab('customerProfile')">Profile</button>
        </div>
        <div class="dashboard-content">
            <div id="customerBookings" class="tab-content active">
                <div class="loading">Loading bookings...</div>
            </div>
            <div id="customerRequests" class="tab-content">
                <div class="loading">Loading requests...</div>
            </div>
            <div id="customerProfile" class="tab-content">
                <div class="loading">Loading profile...</div>
            </div>
        </div>
    `;
    
    // Load initial tab content
    loadCustomerBookings();
}

async function loadShopkeeperDashboard() {
    if (!currentUser || currentUserType !== 'shopkeeper') {
        showMessage('Please login as a shopkeeper', 'error');
        return;
    }
    
    const content = document.getElementById('shopkeeperDashboardContent');
    if (!content) return;
    
    content.innerHTML = `
        <div class="dashboard-tabs">
            <button class="tab-btn active" onclick="switchDashboardTab('shopkeeperBookings')">Bookings</button>
            <button class="tab-btn" onclick="switchDashboardTab('shopkeeperRequests')">Requests</button>
            <button class="tab-btn" onclick="switchDashboardTab('shopkeeperProducts')">Products</button>
            <button class="tab-btn" onclick="switchDashboardTab('shopkeeperProfile')">Profile</button>
        </div>
        <div class="dashboard-content">
            <div id="shopkeeperBookings" class="tab-content active">
                <div class="loading">Loading bookings...</div>
            </div>
            <div id="shopkeeperRequests" class="tab-content">
                <div class="loading">Loading requests...</div>
            </div>
            <div id="shopkeeperProducts" class="tab-content">
                <div class="loading">Loading products...</div>
            </div>
            <div id="shopkeeperProfile" class="tab-content">
                <div class="loading">Loading profile...</div>
            </div>
        </div>
    `;
    
    // Load initial tab content
    loadShopkeeperBookings();
}

function switchDashboardTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load content based on tab
    switch(tabName) {
        case 'customerBookings':
            loadCustomerBookings();
            break;
        case 'customerRequests':
            loadCustomerRequests();
            break;
        case 'customerProfile':
            loadCustomerProfile();
            break;
        case 'shopkeeperBookings':
            loadShopkeeperBookings();
            break;
        case 'shopkeeperRequests':
            loadShopkeeperRequests();
            break;
        case 'shopkeeperProducts':
            loadShopkeeperProducts();
            break;
        case 'shopkeeperProfile':
            loadShopkeeperProfile();
            break;
    }
}

async function loadCustomerBookings() {
    try {
        const response = await fetch('/api/bookings');
        const result = await response.json();
        
        if (result.success) {
            const customerBookings = result.bookings.filter(booking => 
                booking.customer_phone === currentUser.phone
            );
            displayCustomerBookings(customerBookings);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('customerBookings').innerHTML = '<p>Error loading bookings</p>';
    }
}

function displayCustomerBookings(bookings) {
    const container = document.getElementById('customerBookings');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p>No bookings found.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="bookings-list">
            ${bookings.map(booking => `
                <div class="booking-item">
                    <div class="booking-header">
                        <h4>${booking.item_name}</h4>
                        <span class="booking-status ${booking.status}">${booking.status}</span>
                    </div>
                    <div class="booking-details">
                        <p><i class="fas fa-store"></i> ${booking.store_name}</p>
                        <p><i class="fas fa-phone"></i> ${booking.store_phone}</p>
                        <p><i class="fas fa-calendar"></i> ${new Date(booking.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadCustomerRequests() {
    try {
        const response = await fetch('/api/requests');
        const result = await response.json();
        
        if (result.success) {
            const customerRequests = result.requests.filter(request => 
                request.customer_phone === currentUser.phone
            );
            displayCustomerRequests(customerRequests);
        }
    } catch (error) {
        console.error('Error loading requests:', error);
        document.getElementById('customerRequests').innerHTML = '<p>Error loading requests</p>';
    }
}

function displayCustomerRequests(requests) {
    const container = document.getElementById('customerRequests');
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = '<p>No requests found.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="requests-list">
            ${requests.map(request => `
                <div class="request-item">
                    <div class="request-header">
                        <h4>${request.item_name}</h4>
                        <span class="request-status ${request.status}">${request.status}</span>
                    </div>
                    <div class="request-details">
                        <p><i class="fas fa-shopping-cart"></i> Quantity: ${request.quantity}</p>
                        <p><i class="fas fa-store"></i> Target: ${request.target_store}</p>
                        <p><i class="fas fa-calendar"></i> ${new Date(request.created_at).toLocaleDateString()}</p>
                        ${request.description ? `<p><i class="fas fa-comment"></i> ${request.description}</p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function loadCustomerProfile() {
    const container = document.getElementById('customerProfile');
    if (!container) return;
    
    container.innerHTML = `
        <div class="profile-section">
            <h4>Customer Profile</h4>
            <div class="profile-details">
                <p><strong>Name:</strong> ${currentUser.name}</p>
                <p><strong>Phone:</strong> ${currentUser.phone}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Location:</strong> ${currentUser.location}</p>
                <p><strong>Status:</strong> <span class="status-badge ${currentUser.status}">${currentUser.status}</span></p>
                <p><strong>Member Since:</strong> ${new Date(currentUser.created_at).toLocaleDateString()}</p>
            </div>
            <button class="btn-primary" onclick="editProfile('customer')">
                <i class="fas fa-edit"></i>
                Edit Profile
            </button>
        </div>
    `;
}

async function loadShopkeeperBookings() {
    try {
        const response = await fetch('/api/bookings');
        const result = await response.json();
        
        if (result.success) {
            const shopkeeperBookings = result.bookings.filter(booking => 
                booking.store_phone === currentUser.phone
            );
            displayShopkeeperBookings(shopkeeperBookings);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('shopkeeperBookings').innerHTML = '<p>Error loading bookings</p>';
    }
}

function displayShopkeeperBookings(bookings) {
    const container = document.getElementById('shopkeeperBookings');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p>No bookings found.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="bookings-list">
            ${bookings.map(booking => `
                <div class="booking-item">
                    <div class="booking-header">
                        <h4>${booking.item_name}</h4>
                        <span class="booking-status ${booking.status}">${booking.status}</span>
                    </div>
                    <div class="booking-details">
                        <p><i class="fas fa-user"></i> ${booking.customer_name}</p>
                        <p><i class="fas fa-phone"></i> ${booking.customer_phone}</p>
                        <p><i class="fas fa-calendar"></i> ${new Date(booking.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="booking-actions">
                        ${booking.status === 'pending' ? `
                            <button class="btn-success btn-small" onclick="updateBookingStatus(${booking.id}, 'accepted')">
                                <i class="fas fa-check"></i>
                                Accept
                            </button>
                            <button class="btn-danger btn-small" onclick="updateBookingStatus(${booking.id}, 'rejected')">
                                <i class="fas fa-times"></i>
                                Reject
                            </button>
                        ` : ''}
                        ${booking.status === 'accepted' ? `
                            <button class="btn-primary btn-small" onclick="updateBookingStatus(${booking.id}, 'completed')">
                                <i class="fas fa-check-double"></i>
                                Mark Complete
                            </button>
                        ` : ''}
                        <button class="btn-outline btn-small" onclick="callCustomer('${booking.customer_phone}')">
                            <i class="fas fa-phone"></i>
                            Call Customer
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadShopkeeperRequests() {
    try {
        const response = await fetch('/api/requests');
        const result = await response.json();
        
        if (result.success) {
            displayShopkeeperRequests(result.requests);
        }
    } catch (error) {
        console.error('Error loading requests:', error);
        document.getElementById('shopkeeperRequests').innerHTML = '<p>Error loading requests</p>';
    }
}

function displayShopkeeperRequests(requests) {
    const container = document.getElementById('shopkeeperRequests');
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = '<p>No requests found.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="requests-list">
            ${requests.map(request => `
                <div class="request-item">
                    <div class="request-header">
                        <h4>${request.item_name}</h4>
                        <span class="request-status ${request.status}">${request.status}</span>
                    </div>
                    <div class="request-details">
                        <p><i class="fas fa-user"></i> ${request.customer_name}</p>
                        <p><i class="fas fa-phone"></i> ${request.customer_phone}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${request.customer_location}</p>
                        <p><i class="fas fa-shopping-cart"></i> Quantity: ${request.quantity}</p>
                        <p><i class="fas fa-calendar"></i> ${new Date(request.created_at).toLocaleDateString()}</p>
                        ${request.description ? `<p><i class="fas fa-comment"></i> ${request.description}</p>` : ''}
                    </div>
                    <div class="request-actions">
                        <button class="btn-outline btn-small" onclick="callCustomer('${request.customer_phone}')">
                            <i class="fas fa-phone"></i>
                            Call Customer
                        </button>
                        <button class="btn-primary btn-small" onclick="startChat('${request.customer_id}', 'customer')">
                            <i class="fas fa-comments"></i>
                            Chat
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function loadShopkeeperProducts() {
    const container = document.getElementById('shopkeeperProducts');
    if (!container) return;
    
    const products = currentUser.products || [];
    
    container.innerHTML = `
        <div class="products-management">
            <div class="products-header">
                <h4>Manage Products</h4>
                <button class="btn-primary" onclick="showModal('addProductModal')">
                    <i class="fas fa-plus"></i>
                    Add Product
                </button>
            </div>
            <div class="products-list">
                ${products.length === 0 ? '<p>No products added yet.</p>' : 
                    products.map((product, index) => `
                        <div class="product-management-item">
                            <div class="product-info">
                                <div class="product-name">${product.name}</div>
                                <div class="product-price">${product.price}</div>
                                <div class="product-status ${product.available ? 'available' : 'unavailable'}">
                                    ${product.available ? 'Available' : 'Out of Stock'}
                                </div>
                            </div>
                            <div class="product-actions">
                                <button class="btn-outline btn-small" onclick="editProduct(${index})">
                                    <i class="fas fa-edit"></i>
                                    Edit
                                </button>
                                <button class="btn-danger btn-small" onclick="deleteProduct(${index})">
                                    <i class="fas fa-trash"></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
}

function loadShopkeeperProfile() {
    const container = document.getElementById('shopkeeperProfile');
    if (!container) return;
    
    container.innerHTML = `
        <div class="profile-section">
            <h4>Store Profile</h4>
            <div class="profile-details">
                <p><strong>Shop Name:</strong> ${currentUser.shop_name}</p>
                <p><strong>Owner Name:</strong> ${currentUser.owner_name}</p>
                <p><strong>Phone:</strong> ${currentUser.phone}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Address:</strong> ${currentUser.address}</p>
                <p><strong>Pincode:</strong> ${currentUser.pincode}</p>
                <p><strong>Category:</strong> ${getCategoryName(currentUser.category)}</p>
                <p><strong>Status:</strong> <span class="status-badge ${currentUser.status}">${currentUser.status}</span></p>
                <p><strong>Registered:</strong> ${new Date(currentUser.created_at).toLocaleDateString()}</p>
            </div>
            <button class="btn-primary" onclick="editProfile('shopkeeper')">
                <i class="fas fa-edit"></i>
                Edit Profile
            </button>
        </div>
    `;
}

// Product management functions
async function handleAddProduct(e) {
    e.preventDefault();
    
    const product = {
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        available: document.getElementById('productAvailable').value === 'true',
        description: document.getElementById('productDescription').value
    };
    
    try {
        const response = await fetch('/api/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storeId: currentUser.id,
                product: product
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Product added successfully!', 'success');
            hideModal('addProductModal');
            e.target.reset();
            
            // Refresh products list
            if (currentUser.products) {
                currentUser.products.push(product);
            } else {
                currentUser.products = [product];
            }
            loadShopkeeperProducts();
        } else {
            showMessage(result.message || 'Failed to add product', 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showMessage('Failed to add product', 'error');
    }
}

function editProduct(index) {
    const product = currentUser.products[index];
    if (!product) return;
    
    // Fill the edit form
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductAvailable').value = product.available.toString();
    document.getElementById('editProductDescription').value = product.description || '';
    
    // Store the index for later use
    document.getElementById('editProductForm').dataset.productIndex = index;
    
    showModal('editProductModal');
}

async function handleEditProduct(e) {
    e.preventDefault();
    
    const index = parseInt(e.target.dataset.productIndex);
    const product = {
        name: document.getElementById('editProductName').value,
        price: document.getElementById('editProductPrice').value,
        available: document.getElementById('editProductAvailable').value === 'true',
        description: document.getElementById('editProductDescription').value
    };
    
    try {
        const response = await fetch('/api/update-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storeId: currentUser.id,
                productIndex: index,
                product: product
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Product updated successfully!', 'success');
            hideModal('editProductModal');
            
            // Update local data
            currentUser.products[index] = product;
            loadShopkeeperProducts();
        } else {
            showMessage(result.message || 'Failed to update product', 'error');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showMessage('Failed to update product', 'error');
    }
}

async function deleteProduct(index) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/delete-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storeId: currentUser.id,
                productIndex: index
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Product deleted successfully!', 'success');
            
            // Remove from local data
            currentUser.products.splice(index, 1);
            loadShopkeeperProducts();
        } else {
            showMessage(result.message || 'Failed to delete product', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Failed to delete product', 'error');
    }
}

// Booking management functions
async function updateBookingStatus(bookingId, status) {
    try {
        const response = await fetch('/api/update-booking-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bookingId: bookingId,
                status: status
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(`Booking ${status} successfully!`, 'success');
            loadShopkeeperBookings(); // Refresh the bookings list
        } else {
            showMessage(result.message || 'Failed to update booking', 'error');
        }
    } catch (error) {
        console.error('Error updating booking:', error);
        showMessage('Failed to update booking', 'error');
    }
}

function callCustomer(phone) {
    window.open(`tel:${phone}`, '_self');
}

// Profile management functions
function editProfile(userType) {
    const modal = document.getElementById('editProfileModal');
    const title = document.getElementById('editProfileTitle');
    const fields = document.getElementById('editProfileFields');
    
    if (userType === 'customer') {
        title.textContent = 'Edit Customer Profile';
        fields.innerHTML = `
            <div class="form-group">
                <label for="editName">Full Name</label>
                <input type="text" id="editName" value="${currentUser.name}" required>
            </div>
            <div class="form-group">
                <label for="editEmail">Email</label>
                <input type="email" id="editEmail" value="${currentUser.email}" required>
            </div>
            <div class="form-group">
                <label for="editLocation">Location</label>
                <input type="text" id="editLocation" value="${currentUser.location}" required>
            </div>
        `;
    } else {
        title.textContent = 'Edit Store Profile';
        fields.innerHTML = `
            <div class="form-group">
                <label for="editShopName">Shop Name</label>
                <input type="text" id="editShopName" value="${currentUser.shop_name}" required>
            </div>
            <div class="form-group">
                <label for="editOwnerName">Owner Name</label>
                <input type="text" id="editOwnerName" value="${currentUser.owner_name}" required>
            </div>
            <div class="form-group">
                <label for="editEmail">Email</label>
                <input type="email" id="editEmail" value="${currentUser.email}" required>
            </div>
            <div class="form-group">
                <label for="editAddress">Address</label>
                <textarea id="editAddress" rows="3" required>${currentUser.address}</textarea>
            </div>
            <div class="form-group">
                <label for="editPincode">Pincode</label>
                <input type="text" id="editPincode" value="${currentUser.pincode}" required>
            </div>
        `;
    }
    
    document.getElementById('editProfileForm').dataset.userType = userType;
    showModal('editProfileModal');
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const userType = e.target.dataset.userType;
    let updateData = { id: currentUser.id };
    
    if (userType === 'customer') {
        updateData.name = document.getElementById('editName').value;
        updateData.email = document.getElementById('editEmail').value;
        updateData.location = document.getElementById('editLocation').value;
    } else {
        updateData.shop_name = document.getElementById('editShopName').value;
        updateData.owner_name = document.getElementById('editOwnerName').value;
        updateData.email = document.getElementById('editEmail').value;
        updateData.address = document.getElementById('editAddress').value;
        updateData.pincode = document.getElementById('editPincode').value;
    }
    
    try {
        const endpoint = userType === 'customer' ? '/api/update-customer' : '/api/update-store';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Profile updated successfully!', 'success');
            hideModal('editProfileModal');
            
            // Update current user data
            Object.assign(currentUser, updateData);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Refresh profile display
            if (userType === 'customer') {
                loadCustomerProfile();
            } else {
                loadShopkeeperProfile();
            }
        } else {
            showMessage(result.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Failed to update profile', 'error');
    }
}

// Chat functions
async function loadChats() {
    if (!currentUser) return;
    
    try {
        const response = await fetch('/api/chats');
        const result = await response.json();
        
        if (result.success) {
            displayChats(result.chats);
        }
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

function displayChats(chats) {
    const chatList = document.getElementById('chatList');
    if (!chatList) return;
    
    // Filter chats for current user
    const userChats = chats.filter(chat => {
        if (currentUserType === 'customer') {
            return chat.participant1_type === 'customer' && chat.participant1_id === currentUser.id ||
                   chat.participant2_type === 'customer' && chat.participant2_id === currentUser.id;
        } else {
            return chat.participant1_type === 'shopkeeper' && chat.participant1_id === currentUser.id ||
                   chat.participant2_type === 'shopkeeper' && chat.participant2_id === currentUser.id;
        }
    });
    
    if (userChats.length === 0) {
        chatList.innerHTML = `
            <div class="no-chats">
                <i class="fas fa-comments"></i>
                <h3>No conversations yet</h3>
                <p>Start chatting with customers or stores!</p>
            </div>
        `;
        return;
    }
    
    chatList.innerHTML = userChats.map(chat => {
        // Determine the other participant
        let otherParticipant;
        if (currentUserType === 'customer') {
            otherParticipant = chat.participant1_type === 'shopkeeper' ? 
                `Store #${chat.participant1_id}` : `Store #${chat.participant2_id}`;
        } else {
            otherParticipant = chat.participant1_type === 'customer' ? 
                `Customer #${chat.participant1_id}` : `Customer #${chat.participant2_id}`;
        }
        
        return `
            <div class="chat-item" onclick="selectChat('${chat.chat_id}')">
                <div class="chat-avatar">
                    <i class="fas fa-${currentUserType === 'customer' ? 'store' : 'user'}"></i>
                </div>
                <div class="chat-info">
                    <div class="chat-name">${otherParticipant}</div>
                    <div class="chat-last-message">${chat.last_message || 'No messages yet'}</div>
                </div>
            </div>
        `;
    }).join('');
}

function selectChat(chatId) {
    currentChat = chatId;
    
    // Update UI
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Show chat interface
    document.getElementById('chatInput').style.display = 'flex';
    
    // Load messages
    loadChatMessages(chatId);
    
    // Update header
    updateChatHeader(chatId);
}

function updateChatHeader(chatId) {
    const header = document.getElementById('chatHeader');
    const userName = document.querySelector('.chat-user-name');
    const userStatus = document.querySelector('.chat-user-status');
    
    if (userName && userStatus) {
        // Parse chat ID to get participant info
        const parts = chatId.split('_');
        if (parts.length === 4) {
            const otherType = currentUserType === 'customer' ? 'Store' : 'Customer';
            const otherId = currentUserType === 'customer' ? 
                (parts[0] === 'shopkeeper' ? parts[1] : parts[3]) :
                (parts[0] === 'customer' ? parts[1] : parts[3]);
            
            userName.textContent = `${otherType} #${otherId}`;
            userStatus.textContent = 'Online';
        }
    }
}

async function loadChatMessages(chatId) {
    try {
        const response = await fetch('/api/chats');
        const result = await response.json();
        
        if (result.success) {
            const chat = result.chats.find(c => c.chat_id === chatId);
            if (chat && chat.messages) {
                displayChatMessages(chat.messages);
            } else {
                displayChatMessages([]);
            }
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function displayChatMessages(messages) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="no-messages">
                <i class="fas fa-comment"></i>
                <h3>No messages yet</h3>
                <p>Start the conversation!</p>
            </div>
        `;
        return;
    }
    
    messagesContainer.innerHTML = messages.map(message => {
        const isSent = (currentUserType === message.sender_type && currentUser.id === message.sender_id);
        return `
            <div class="message ${isSent ? 'sent' : 'received'}">
                <div class="message-content">${message.message}</div>
                <div class="message-time">${new Date(message.created_at).toLocaleTimeString()}</div>
            </div>
        `;
    }).join('');
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function handleChatMessage(e) {
    e.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message || !currentChat) return;
    
    const chatData = {
        id: currentChat,
        senderId: currentUser.id,
        senderType: currentUserType,
        message: message
    };
    
    try {
        const response = await fetch('/api/save-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(chatData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            messageInput.value = '';
            loadChatMessages(currentChat); // Refresh messages
        } else {
            showMessage('Failed to send message', 'error');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showMessage('Failed to send message', 'error');
    }
}

function startChat(participantId, participantType) {
    if (!currentUser) {
        showMessage('Please login to start chatting', 'error');
        return;
    }
    
    // Generate chat ID
    const chatId = `${currentUserType}_${currentUser.id}_${participantType}_${participantId}`;
    
    // Show chat modal
    showModal('chatModal');
    
    // Load chats and select this one
    loadChats();
    
    // Set current chat
    currentChat = chatId;
    
    // Show chat input
    document.getElementById('chatInput').style.display = 'flex';
    
    // Update header
    updateChatHeader(chatId);
    
    // Load messages
    loadChatMessages(chatId);
}

// Search and filter functions
function searchStores() {
    const searchTerm = document.getElementById('locationSearch').value.toLowerCase();
    const storeCards = document.querySelectorAll('.store-card');
    
    storeCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Statistics functions
async function updateStats() {
    try {
        const [storesResponse, customersResponse, bookingsResponse] = await Promise.all([
            fetch('/api/stores'),
            fetch('/api/customers'),
            fetch('/api/bookings')
        ]);
        
        const [storesResult, customersResult, bookingsResult] = await Promise.all([
            storesResponse.json(),
            customersResponse.json(),
            bookingsResponse.json()
        ]);
        
        if (storesResult.success) {
            const storeCount = document.getElementById('storeCount');
            if (storeCount) storeCount.textContent = `${storesResult.stores.length}+`;
        }
        
        if (customersResult.success) {
            const customerCount = document.getElementById('customerCount');
            if (customerCount) customerCount.textContent = `${customersResult.customers.length}+`;
        }
        
        if (bookingsResult.success) {
            const bookingCount = document.getElementById('bookingCount');
            if (bookingCount) bookingCount.textContent = `${bookingsResult.bookings.length}+`;
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Load content based on modal
        if (modalId === 'customerDashboardModal') {
            loadCustomerDashboard();
        } else if (modalId === 'shopkeeperDashboardModal') {
            loadShopkeeperDashboard();
        } else if (modalId === 'chatModal') {
            loadChats();
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Stop chat polling if closing chat modal
        if (modalId === 'chatModal' && chatPollingInterval) {
            clearInterval(chatPollingInterval);
            chatPollingInterval = null;
        }
    }
}

// Tab switching functions
function switchTab(tabName) {
    // Handle authentication tabs
    if (tabName.includes('Login') || tabName.includes('Register')) {
        const isCustomer = tabName.includes('customer');
        const isLogin = tabName.includes('Login');
        
        const modalId = isCustomer ? 'customerAuthModal' : 'shopkeeperAuthModal';
        const modal = document.getElementById(modalId);
        
        if (modal) {
            // Update tab buttons
            const tabButtons = modal.querySelectorAll('.tab-btn');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            const activeButton = Array.from(tabButtons).find(btn => 
                btn.textContent.toLowerCase().includes(isLogin ? 'login' : 'register')
            );
            if (activeButton) activeButton.classList.add('active');
            
            // Update forms
            const loginForm = modal.querySelector(`#${isCustomer ? 'customer' : 'shopkeeper'}LoginForm`);
            const registerForm = modal.querySelector(`#${isCustomer ? 'customer' : 'shopkeeper'}RegisterForm`);
            
            if (loginForm && registerForm) {
                if (isLogin) {
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                } else {
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                }
            }
            
            // Update title
            const title = modal.querySelector('h2');
            if (title) {
                const userType = isCustomer ? 'Customer' : 'Shopkeeper';
                const action = isLogin ? 'Login' : (isCustomer ? 'Register' : 'Register Store');
                title.textContent = `${userType} ${action}`;
            }
        }
    }
}

// Message functions
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button class="message-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// Event listeners for modal close
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        hideModal(modalId);
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="block"]');
        if (openModal) {
            hideModal(openModal.id);
        }
    }
});

// Initialize chat polling when chat modal is opened
function startChatPolling() {
    if (chatPollingInterval) {
        clearInterval(chatPollingInterval);
    }
    
    chatPollingInterval = setInterval(() => {
        if (currentChat) {
            loadChatMessages(currentChat);
        }
        loadChats();
    }, 3000); // Poll every 3 seconds
}

// Auto-refresh functionality
setInterval(() => {
    if (currentUser) {
        updateStats();
    }
}, 30000); // Update stats every 30 seconds