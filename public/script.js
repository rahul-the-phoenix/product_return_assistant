// API Base URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const orderLookup = document.getElementById('orderLookup');
const lookupBtn = document.getElementById('lookupBtn');
const orderDetails = document.getElementById('orderDetails');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAnalytics();
    addBotMessage('👋 Hello! I\'m your AI Returns Assistant. I can help you with returns, refunds, and exchanges. Try asking about an order!', 'greeting');
});

// Send message on Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Send button click
sendBtn.addEventListener('click', sendMessage);

// Lookup button click
lookupBtn.addEventListener('click', lookupOrder);

// Quick message function
function quickMessage(message) {
    chatInput.value = message;
    sendMessage();
}

// Send message to chatbot
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addUserMessage(message);
    chatInput.value = '';

    // Show typing indicator
    const typingDiv = addTypingIndicator();

    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        
        // Remove typing indicator
        typingDiv.remove();

        // Add bot response
        addBotMessage(data.text, data.type || 'bot');

        // Reload analytics if return was processed
        if (data.trackingId) {
            setTimeout(loadAnalytics, 500);
        }

    } catch (error) {
        typingDiv.remove();
        addBotMessage('Sorry, I encountered an error. Please try again.', 'error');
        console.error('Chat error:', error);
    }
}

// Add user message to chat
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Add bot message to chat
function addBotMessage(text, type = 'bot') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message bot ${type}`;
    
    // Convert newlines to br tags for formatting
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Add typing indicator
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot loading';
    typingDiv.textContent = 'AI is thinking...';
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
    return typingDiv;
}

// Scroll chat to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Load analytics data
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_URL}/analytics`);
        const data = await response.json();

        document.getElementById('totalReturns').textContent = data.totalReturns;
        document.getElementById('returnRate').textContent = data.returnRate + '%';
        document.getElementById('topReason').textContent = data.topReason || 'N/A';

    } catch (error) {
        console.error('Analytics error:', error);
    }
}

// Lookup order
async function lookupOrder() {
    const orderId = orderLookup.value.trim().toUpperCase();
    if (!orderId) {
        alert('Please enter an order ID');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/order/${orderId}`);
        
        if (response.ok) {
            const order = await response.json();
            displayOrderDetails(order);
        } else {
            orderDetails.innerHTML = '<p style="color: #f44336;">❌ Order not found. Please check the Order ID.</p>';
            orderDetails.classList.add('show');
        }

    } catch (error) {
        console.error('Lookup error:', error);
        orderDetails.innerHTML = '<p style="color: #f44336;">Error loading order details.</p>';
        orderDetails.classList.add('show');
    }
}

// Display order details
function displayOrderDetails(order) {
    const deliveryDate = new Date(order.deliveryDate);
    const today = new Date();
    const diffTime = Math.abs(today - deliveryDate);
    const daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    orderDetails.innerHTML = `
        <div class="order-info"><strong>📦 Product:</strong> ${order.product}</div>
        <div class="order-info"><strong>🏷️ Category:</strong> ${order.category}</div>
        <div class="order-info"><strong>💰 Price:</strong> $${order.price}</div>
        <div class="order-info"><strong>📅 Purchase Date:</strong> ${order.purchaseDate}</div>
        <div class="order-info"><strong>🚚 Delivery Date:</strong> ${order.deliveryDate}</div>
        <div class="order-info"><strong>⏱️ Days Since Delivery:</strong> ${daysSince} days</div>
        <div class="order-info"><strong>✅ Status:</strong> ${order.status}</div>
    `;
    orderDetails.classList.add('show');
}

// Example orders for demo
const exampleOrders = [
    'ORD-001', 'ORD-002', 'ORD-003', 'ORD-004', 'ORD-005', 'ORD-006'
];

// Add helpful hint
console.log('%c🤖 AI Returns Assistant Demo', 'font-size: 16px; font-weight: bold; color: #667eea;');
console.log('%cTry these example orders:', 'font-size: 14px; color: #764ba2;');
exampleOrders.forEach(order => {
    console.log(`  - ${order}`);
});
console.log('%c\nExample questions:', 'font-size: 14px; color: #764ba2;');
console.log('  - "Can I return my order ORD-001?"');
console.log('  - "Generate a return label for ORD-002"');
console.log('  - "What\'s my refund status for ORD-001?"');
console.log('  - "I want to exchange my item"');
