// API Base URL
const API_BASE = '';

// State
let authToken = localStorage.getItem('authToken');
let currentUser = localStorage.getItem('userEmail');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
});

// Check if user is logged in
function checkAuthState() {
    if (authToken) {
        showDashboard();
        searchBooks(); // Load all books on login
    } else {
        showAuthSection();
    }
}

// Show/Hide Sections
function showAuthSection() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
}

// Tab Navigation (Auth)
function showTab(tabName) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    
    if (tabName === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        tabs[0].classList.add('active');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        tabs[1].classList.add('active');
    }
    
    clearMessage('auth-message');
}

// Dashboard Tab Navigation
function showDashTab(tabName) {
    const tabs = ['books', 'add-book', 'recommendations'];
    const tabBtns = document.querySelectorAll('.dash-tab-btn');
    
    tabs.forEach((tab, index) => {
        const element = document.getElementById(`${tab}-tab`);
        if (tab === tabName) {
            element.classList.remove('hidden');
            tabBtns[index].classList.add('active');
        } else {
            element.classList.add('hidden');
            tabBtns[index].classList.remove('active');
        }
    });
    
    clearMessage('dashboard-message');
}

// Handle Signup
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.text();
        
        if (response.ok) {
            showMessage('auth-message', 'Account created successfully! Please login.', 'success');
            setTimeout(() => showTab('login'), 1500);
        } else {
            showMessage('auth-message', data || 'Signup failed. Please try again.', 'error');
        }
    } catch (error) {
        showMessage('auth-message', 'Network error. Please try again.', 'error');
    }
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            currentUser = email;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userEmail', email);
            showDashboard();
            searchBooks();
        } else {
            const errorText = await response.text();
            showMessage('auth-message', errorText || 'Invalid credentials. Please try again.', 'error');
        }
    } catch (error) {
        showMessage('auth-message', 'Network error. Please try again.', 'error');
    }
}

// Handle Logout
function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    showAuthSection();
    
    // Clear forms
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}

// Search Books
async function searchBooks() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value : '';
    
    try {
        const url = query 
            ? `${API_BASE}/books/search?title=${encodeURIComponent(query)}`
            : `${API_BASE}/books/search?title=`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const books = await response.json();
            displayBooks(books);
        } else if (response.status === 401 || response.status === 403) {
            handleLogout();
            showMessage('auth-message', 'Session expired. Please login again.', 'error');
        } else {
            showMessage('dashboard-message', 'Failed to load books.', 'error');
        }
    } catch (error) {
        showMessage('dashboard-message', 'Network error. Please try again.', 'error');
    }
}

// Display Books
function displayBooks(books) {
    const container = document.getElementById('books-list');
    
    if (!books || books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No books found</h3>
                <p>Try adding some books or search with different keywords.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = books.map(book => `
        <div class="book-card" onclick="showBookDetails(${book.id})">
            <h3>${escapeHtml(book.title)}</h3>
            <p class="author">by ${escapeHtml(book.author)}</p>
            <span class="genre">${escapeHtml(book.genre)}</span>
            <div class="actions" onclick="event.stopPropagation()">
                <button class="btn btn-like" onclick="likeBook(${book.id})">❤️ Like</button>
                <div class="rating-input">
                    <select id="rating-${book.id}" onchange="rateBook(${book.id}, this.value)">
                        <option value="">Rate</option>
                        <option value="1">⭐</option>
                        <option value="2">⭐⭐</option>
                        <option value="3">⭐⭐⭐</option>
                        <option value="4">⭐⭐⭐⭐</option>
                        <option value="5">⭐⭐⭐⭐⭐</option>
                    </select>
                </div>
            </div>
        </div>
    `).join('');
}

// Add Book
async function handleAddBook(event) {
    event.preventDefault();
    
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const genre = document.getElementById('book-genre').value;
    
    try {
        const response = await fetch(`${API_BASE}/books/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, author, genre })
        });
        
        if (response.ok) {
            showMessage('add-book-message', 'Book added successfully!', 'success');
            // Clear form
            document.getElementById('book-title').value = '';
            document.getElementById('book-author').value = '';
            document.getElementById('book-genre').value = '';
            // Refresh books list
            setTimeout(() => {
                showDashTab('books');
                searchBooks();
            }, 1000);
        } else if (response.status === 401 || response.status === 403) {
            handleLogout();
            showMessage('auth-message', 'Session expired. Please login again.', 'error');
        } else {
            const errorText = await response.text();
            showMessage('add-book-message', errorText || 'Failed to add book.', 'error');
        }
    } catch (error) {
        showMessage('add-book-message', 'Network error. Please try again.', 'error');
    }
}

// Like Book
async function likeBook(bookId) {
    try {
        const response = await fetch(`${API_BASE}/interactions/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                bookId: bookId,
                liked: true
            })
        });
        
        if (response.ok) {
            showMessage('dashboard-message', 'Book liked! ❤️', 'success');
            setTimeout(() => clearMessage('dashboard-message'), 2000);
        } else {
            showMessage('dashboard-message', 'Failed to like book.', 'error');
        }
    } catch (error) {
        showMessage('dashboard-message', 'Network error.', 'error');
    }
}

// Rate Book
async function rateBook(bookId, rating) {
    if (!rating) return;
    
    try {
        const response = await fetch(`${API_BASE}/interactions/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                bookId: bookId,
                rating: parseInt(rating)
            })
        });
        
        if (response.ok) {
            showMessage('dashboard-message', `Rated ${rating} stars! ⭐`, 'success');
            setTimeout(() => clearMessage('dashboard-message'), 2000);
        } else {
            showMessage('dashboard-message', 'Failed to rate book.', 'error');
        }
    } catch (error) {
        showMessage('dashboard-message', 'Network error.', 'error');
    }
}

// Get Recommendations
async function getRecommendations() {
    const container = document.getElementById('recommendations-list');
    container.innerHTML = '<div class="empty-state"><p>Loading recommendations...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/recommendations/top`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const books = await response.json();
            
            if (!books || books.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No recommendations yet</h3>
                        <p>Like or rate some books to get personalized recommendations!</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = books.map(book => `
                <div class="book-card">
                    <h3>${escapeHtml(book.title)}</h3>
                    <p class="author">by ${escapeHtml(book.author)}</p>
                    <span class="genre">${escapeHtml(book.genre)}</span>
                </div>
            `).join('');
        } else if (response.status === 401 || response.status === 403) {
            handleLogout();
            showMessage('auth-message', 'Session expired. Please login again.', 'error');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Could not load recommendations</h3>
                    <p>Please try again later.</p>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Network error</h3>
                <p>Please check your connection and try again.</p>
            </div>
        `;
    }
}

// Show Book Details (Modal)
function showBookDetails(bookId) {
    // For now, just show a simple message
    // This could be expanded to show more details
    showMessage('dashboard-message', 'Click "Like" or select a rating to interact with this book!', 'success');
    setTimeout(() => clearMessage('dashboard-message'), 3000);
}

// Close Modal
function closeModal() {
    document.getElementById('book-modal').classList.add('hidden');
}

// Utility Functions
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
}

function clearMessage(elementId) {
    const element = document.getElementById(elementId);
    element.textContent = '';
    element.className = 'message';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Allow search on Enter key
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'search-input') {
        searchBooks();
    }
});
