require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ScaleDownAPI = require('./utils/scaledown');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize ScaleDown API
const scaleDown = new ScaleDownAPI(process.env.SCALEDOWN_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load data
let orders = JSON.parse(fs.readFileSync('./data/orders.json', 'utf8'));
let policies = JSON.parse(fs.readFileSync('./data/policies.json', 'utf8'));
let returns = JSON.parse(fs.readFileSync('./data/returns.json', 'utf8'));

// User activity tracking for fraud detection
let userActivity = {};

// Helper function to calculate days since delivery
function daysSinceDelivery(deliveryDate) {
  const today = new Date();
  const delivery = new Date(deliveryDate);
  const diffTime = Math.abs(today - delivery);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Helper function to generate tracking ID
function generateTrackingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let tracking = 'TRK-';
  for (let i = 0; i < 3; i++) {
    tracking += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  tracking += '-';
  for (let i = 0; i < 6; i++) {
    tracking += Math.floor(Math.random() * 10);
  }
  return tracking;
}

// Check fraud detection
function checkFraudRisk(userId) {
  if (!userActivity[userId]) {
    userActivity[userId] = { returns: [], highValueReturns: 0 };
  }

  const activity = userActivity[userId];
  const recentReturns = activity.returns.filter(r => {
    const returnDate = new Date(r.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return returnDate > thirtyDaysAgo;
  });

  if (recentReturns.length >= 3) {
    return { risk: true, message: "Your account requires manual review due to high return frequency." };
  }

  if (activity.highValueReturns >= 2) {
    return { risk: true, message: "Your account requires manual review. Please contact support." };
  }

  return { risk: false };
}

// API Routes

// Chatbot endpoint
app.post('/api/chat', async (req, res) => {
  const { message, userId = 'user123' } = req.body;
  const msg = message.toLowerCase();

  try {
    let response = {};

    // Return eligibility check
    if (msg.includes('return') && msg.includes('ord-')) {
      const orderIdMatch = msg.match(/ord-\d+/i);
      if (orderIdMatch) {
        const orderId = orderIdMatch[0].toUpperCase();
        const order = orders.find(o => o.orderId === orderId);

        if (!order) {
          response = {
            text: `I couldn't find order ${orderId}. Please check your order ID and try again.`,
            type: 'error'
          };
        } else {
          const days = daysSinceDelivery(order.deliveryDate);
          const policy = policies.policies[order.category];
          const eligible = days <= policy.returnWindow;

          // Check fraud risk
          const fraudCheck = checkFraudRisk(userId);
          if (fraudCheck.risk) {
            response = {
              text: fraudCheck.message,
              type: 'warning'
            };
          } else if (eligible) {
            const compressed = await scaleDown.compressPolicy(policy.fullPolicy);
            response = {
              text: `✅ Great news! Your ${order.product} is eligible for return.\n\n📋 Policy: ${compressed}\n\n🏷️ Days since delivery: ${days} days\n📦 Return window: ${policy.returnWindow} days\n\nWould you like me to generate a return label?`,
              type: 'success',
              order: order,
              canReturn: true
            };
          } else {
            response = {
              text: `❌ Sorry, your ${order.product} is no longer eligible for return.\n\n🏷️ Days since delivery: ${days} days\n📦 Return window: ${policy.returnWindow} days\n\nThe return window has expired. Please contact customer support for special cases.`,
              type: 'error',
              canReturn: false
            };
          }
        }
      }
    }
    // Generate return label
    else if (msg.includes('generate label') || msg.includes('create label')) {
      const orderIdMatch = msg.match(/ord-\d+/i);
      if (orderIdMatch) {
        const orderId = orderIdMatch[0].toUpperCase();
        const order = orders.find(o => o.orderId === orderId);

        if (order) {
          const trackingId = generateTrackingId();
          const returnId = `RET-${String(returns.length + 1).padStart(3, '0')}`;

          response = {
            text: `📦 Return label generated successfully!\n\n🔖 Return ID: ${returnId}\n📍 Tracking ID: ${trackingId}\n\n📄 Instructions:\n1. Pack your item securely\n2. Print this label and attach to package\n3. Drop off at any shipping location\n\n💰 Refund will be processed within 5-7 days after we receive your return.`,
            type: 'success',
            trackingId: trackingId,
            returnId: returnId
          };

          // Track user activity
          if (!userActivity[userId]) {
            userActivity[userId] = { returns: [], highValueReturns: 0 };
          }
          userActivity[userId].returns.push({ date: new Date().toISOString(), orderId });
          if (order.price > 500) {
            userActivity[userId].highValueReturns++;
          }
        }
      }
    }
    // Refund status
    else if (msg.includes('refund') || msg.includes('status')) {
      const orderIdMatch = msg.match(/ord-\d+/i);
      if (orderIdMatch) {
        const orderId = orderIdMatch[0].toUpperCase();
        const returnRecord = returns.find(r => r.orderId === orderId);

        if (returnRecord) {
          const statusEmoji = {
            'Processing': '⏳',
            'Approved': '✅',
            'Refunded': '💰',
            'Rejected': '❌'
          };

          response = {
            text: `${statusEmoji[returnRecord.status]} Refund Status: ${returnRecord.status}\n\n🔖 Return ID: ${returnRecord.returnId}\n📍 Tracking: ${returnRecord.trackingId}\n💵 Amount: $${returnRecord.refundAmount}\n📅 Request Date: ${returnRecord.requestDate}\n\n${returnRecord.status === 'Processing' ? 'Your return is being processed. You will receive your refund within 5-7 business days.' : ''}`,
            type: 'info',
            status: returnRecord.status
          };
        } else {
          response = {
            text: `I couldn't find a return record for order ${orderId}. Have you initiated a return yet?`,
            type: 'info'
          };
        }
      }
    }
    // Exchange request
    else if (msg.includes('exchange')) {
      response = {
        text: `🔄 I can help you with an exchange!\n\nWhat would you like to exchange?\n• Size\n• Color\n• Different item\n\nPlease provide your order ID (e.g., ORD-001) and what you'd like to exchange for.`,
        type: 'info'
      };
    }
    // General greeting
    else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      response = {
        text: `👋 Hello! I'm your AI Returns Assistant. I can help you with:\n\n✅ Check return eligibility\n📦 Generate return labels\n💰 Track refund status\n🔄 Request exchanges\n\nHow can I assist you today?`,
        type: 'greeting'
      };
    }
    // Default response
    else {
      response = {
        text: `I can help you with returns! Try asking:\n\n• "Can I return my order ORD-001?"\n• "Generate a return label for ORD-002"\n• "What's my refund status for ORD-001?"\n• "I want to exchange my item"\n\nWhat would you like to do?`,
        type: 'help'
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      text: 'Sorry, I encountered an error. Please try again.',
      type: 'error'
    });
  }
});

// Get order details
app.get('/api/order/:orderId', (req, res) => {
  const order = orders.find(o => o.orderId.toLowerCase() === req.params.orderId.toLowerCase());
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Get analytics data
app.get('/api/analytics', (req, res) => {
  const totalOrders = orders.length;
  const totalReturns = returns.length;
  const returnRate = ((totalReturns / totalOrders) * 100).toFixed(1);

  const reasonCounts = {};
  returns.forEach(r => {
    reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
  });

  const topReason = Object.keys(reasonCounts).reduce((a, b) => 
    reasonCounts[a] > reasonCounts[b] ? a : b, Object.keys(reasonCounts)[0]
  );

  res.json({
    totalOrders,
    totalReturns,
    returnRate,
    reasonCounts,
    topReason,
    metrics: {
      processingSpeed: '70% faster',
      fraudReduction: '30%',
      customerSatisfaction: '+25%'
    }
  });
});

// Submit return request
app.post('/api/return/submit', async (req, res) => {
  const { orderId, reason, userId = 'user123' } = req.body;
  
  const order = orders.find(o => o.orderId === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Check fraud risk
  const fraudCheck = checkFraudRisk(userId);
  if (fraudCheck.risk) {
    return res.json({
      success: false,
      message: fraudCheck.message,
      requiresReview: true
    });
  }

  const days = daysSinceDelivery(order.deliveryDate);
  const policy = policies.policies[order.category];

  if (days > policy.returnWindow) {
    return res.json({
      success: false,
      message: 'Return window has expired',
      eligible: false
    });
  }

  const returnId = `RET-${String(returns.length + 1).padStart(3, '0')}`;
  const trackingId = generateTrackingId();

  const newReturn = {
    returnId,
    orderId,
    reason,
    status: 'Processing',
    trackingId,
    requestDate: new Date().toISOString().split('T')[0],
    refundAmount: order.price
  };

  returns.push(newReturn);
  fs.writeFileSync('./data/returns.json', JSON.stringify(returns, null, 2));

  // Track activity
  if (!userActivity[userId]) {
    userActivity[userId] = { returns: [], highValueReturns: 0 };
  }
  userActivity[userId].returns.push({ date: new Date().toISOString(), orderId });
  if (order.price > 500) {
    userActivity[userId].highValueReturns++;
  }

  res.json({
    success: true,
    returnId,
    trackingId,
    message: 'Return request submitted successfully'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Returns Assistant running on http://localhost:${PORT}`);
  console.log(`📊 Analytics: http://localhost:${PORT}/analytics`);
  console.log(`💬 Chat interface ready!`);
});
