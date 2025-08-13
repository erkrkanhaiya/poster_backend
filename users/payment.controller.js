const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../common/transaction.model');
const Subscription = require('../common/subscription.model');
const User = require('../common/users.model');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Test Razorpay connection
exports.testRazorpayConnection = async (req, res) => {
  try {
    // Check if credentials are set
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        status: false, 
        message: 'Razorpay credentials not configured', 
        data: {
          keyId: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not Set',
          keySecret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not Set'
        }
      });
    }

    // Test with a simple API call
    const testOrder = await razorpay.orders.create({
      amount: 100, // 1 rupee in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`
    });

    res.json({ 
      status: true, 
      message: 'Razorpay connection successful', 
      data: { 
        orderId: testOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID.substring(0, 10) + '...',
        environment: process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_') ? 'Test' : 'Live'
      } 
    });
  } catch (err) {
    console.error('Razorpay connection test failed:', err);
    res.status(500).json({ 
      status: false, 
      message: 'Razorpay connection failed', 
      data: { 
        error: err.message,
        keyId: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not Set',
        keySecret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not Set'
      }
    });
  }
};

// Create recurring subscription
exports.createSubscription = async (req, res) => {
  try {
    const { amount, currency = 'INR', notes, description, plan = 'monthly' } = req.body;
    const userId = req.user.id;

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({ 
        status: false, 
        message: 'Amount must be at least ₹1', 
        data: {} 
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(400).json({ 
        status: false, 
        message: 'User already has an active subscription', 
        data: {} 
      });
    }

    // Create Razorpay plan
    const planOptions = {
      period: plan === 'monthly' ? 'monthly' : 'yearly',
      interval: 1,
      item: {
        name: description || 'Monthly Subscription',
        amount: amount,
        currency: currency
      },
      notes: {
        userId: userId,
        notes: notes || ''
      }
    };

    const razorpayPlan = await razorpay.plans.create(planOptions);

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

    // Create subscription record
    const subscription = new Subscription({
      user: userId,
      plan: plan,
      amount: amount,
      currency: currency,
      razorpayPlanId: razorpayPlan.id,
      startDate: startDate,
      endDate: endDate,
      nextBillingDate: endDate,
      billingCycle: plan,
      description: description || 'Monthly Subscription',
      notes: notes
    });

    await subscription.save();

    // Create Razorpay subscription
    const subscriptionOptions = {
      plan_id: razorpayPlan.id,
      customer_notify: 1,
      total_count: 12, // 12 months
      notes: {
        userId: userId,
        subscriptionId: subscription._id.toString()
      }
    };

    const razorpaySubscription = await razorpay.subscriptions.create(subscriptionOptions);

    // Update subscription with Razorpay subscription ID
    subscription.razorpaySubscriptionId = razorpaySubscription.id;
    await subscription.save();

    // Create initial transaction record
    const transaction = new Transaction({
      user: userId,
      amount: amount,
      currency: currency,
      status: 'pending',
      razorpayOrderId: razorpaySubscription.id,
      receipt: `sub_${subscription._id}`,
      notes: notes,
      description: description || 'Monthly Subscription',
      subscriptionId: subscription._id,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate
    });

    await transaction.save();

    // Generate checkout URL for subscription
    const successUrl = `${req.protocol}://${req.get('host')}/payment-success.html?subscriptionId=${subscription._id}`;
    const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.html?key=${process.env.RAZORPAY_KEY_ID}&subscription_id=${razorpaySubscription.id}&name=Your%20Company%20Name&description=${encodeURIComponent(description || 'Monthly Subscription')}&prefill[name]=User&prefill[email]=user@example.com&prefill[contact]=9999999999&notes[subscriptionId]=${subscription._id}&theme[color]=#667eea&callback_url=${encodeURIComponent(successUrl)}`;

    res.json({ 
      status: true, 
      message: 'Subscription created successfully', 
      data: { 
        subscription: {
          id: subscription._id,
          razorpaySubscriptionId: razorpaySubscription.id,
          plan: plan,
          amount: amount,
          currency: currency,
          startDate: startDate,
          endDate: endDate,
          status: subscription.status
        },
        transactionId: transaction._id,
        checkoutUrl: checkoutUrl,
        description: description || 'Monthly Subscription'
      } 
    });
  } catch (err) {
    console.error('Error in createSubscription:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Create payment order for fixed amount
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', notes, description } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate amount
    if (!amount || amount < 100) { // Minimum 1 rupee (100 paise)
      return res.status(400).json({ 
        status: false, 
        message: 'Amount must be at least ₹1', 
        data: {} 
      });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: amount, // Amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId,
        notes: notes || '',
        description: description || 'Payment'
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Create transaction record
    const transaction = new Transaction({
      user: userId,
      amount: amount,
      currency: currency,
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
      receipt: razorpayOrder.receipt,
      notes: notes,
      description: description || 'Payment',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 days default
    });

    await transaction.save();

    // Generate Razorpay checkout URL with success redirect
    const successUrl = `${req.protocol}://${req.get('host')}/payment-success.html?transactionId=${transaction._id}`;
    const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.html?key=${process.env.RAZORPAY_KEY_ID}&amount=${amount}&currency=${currency}&name=Your%20Company%20Name&description=${encodeURIComponent(description || 'Payment')}&order_id=${razorpayOrder.id}&prefill[name]=User&prefill[email]=user@example.com&prefill[contact]=9999999999&notes[transactionId]=${transaction._id}&theme[color]=#667eea&callback_url=${encodeURIComponent(successUrl)}`;

    res.json({ 
      status: true, 
      message: 'Order created successfully', 
      data: { 
        order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt
        },
        transactionId: transaction._id,
        checkoutUrl: checkoutUrl,
        description: description || 'Payment'
      } 
    });
  } catch (err) {
    console.error('Error in createOrder:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Verify subscription payment
exports.verifySubscriptionPayment = async (req, res) => {
  try {
    const { 
      razorpay_subscription_id, 
      razorpay_payment_id, 
      razorpay_signature,
      subscriptionId 
    } = req.body;

    // Verify signature
    const body = razorpay_subscription_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ status: false, message: 'Invalid payment signature', data: {} });
    }

    // Find subscription
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ status: false, message: 'Subscription not found', data: {} });
    }

    // Update subscription status
    subscription.status = 'active';
    await subscription.save();

    // Create transaction record for this payment
    const transaction = new Transaction({
      user: subscription.user,
      amount: subscription.amount,
      currency: subscription.currency,
      status: 'completed',
      razorpayOrderId: razorpay_subscription_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      receipt: `sub_payment_${Date.now()}`,
      description: subscription.description,
      subscriptionId: subscription._id,
      subscriptionStartDate: subscription.startDate,
      subscriptionEndDate: subscription.endDate,
      isActive: true
    });

    await transaction.save();

    // Update user subscription status
    await User.findByIdAndUpdate(subscription.user, {
      hasActiveSubscription: true,
      subscriptionEndDate: subscription.endDate
    });

    res.json({ 
      status: true, 
      message: 'Subscription payment verified successfully', 
      data: { 
        subscription: {
          id: subscription._id,
          status: subscription.status,
          amount: subscription.amount,
          endDate: subscription.endDate,
          nextBillingDate: subscription.nextBillingDate
        },
        transaction: {
          id: transaction._id,
          status: transaction.status,
          amount: transaction.amount
        }
      } 
    });
  } catch (err) {
    console.error('Error in verifySubscriptionPayment:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Verify payment and update transaction
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      transactionId 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ status: false, message: 'Invalid payment signature', data: {} });
    }

    // Find and update transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ status: false, message: 'Transaction not found', data: {} });
    }

    if (transaction.status === 'completed') {
      return res.status(400).json({ status: false, message: 'Payment already verified', data: {} });
    }

    // Update transaction
    transaction.status = 'completed';
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    transaction.isActive = true;
    await transaction.save();

    // Update user subscription status (optional)
    await User.findByIdAndUpdate(transaction.user, {
      hasActiveSubscription: true,
      subscriptionEndDate: transaction.subscriptionEndDate
    });

    res.json({ 
      status: true, 
      message: 'Payment verified successfully', 
      data: { 
        transaction: {
          id: transaction._id,
          status: transaction.status,
          amount: transaction.amount,
          subscriptionEndDate: transaction.subscriptionEndDate,
          description: transaction.description
        }
      } 
    });
  } catch (err) {
    console.error('Error in verifyPayment:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Get user's active subscription
exports.getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    }).populate('user', 'name email phone');

    if (!subscription) {
      return res.json({ 
        status: true, 
        message: 'No active subscription found', 
        data: { subscription: null } 
      });
    }

    res.json({ 
      status: true, 
      message: 'Subscription fetched successfully', 
      data: { subscription } 
    });
  } catch (err) {
    console.error('Error in getUserSubscription:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ 
        status: false, 
        message: 'No active subscription found', 
        data: {} 
      });
    }

    // Cancel Razorpay subscription
    await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);

    // Update subscription status
    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    // Update user subscription status
    await User.findByIdAndUpdate(userId, {
      hasActiveSubscription: false
    });

    res.json({ 
      status: true, 
      message: 'Subscription cancelled successfully', 
      data: { 
        subscription: {
          id: subscription._id,
          status: subscription.status,
          endDate: subscription.endDate
        }
      } 
    });
  } catch (err) {
    console.error('Error in cancelSubscription:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Get payment status by order ID (for success page)
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ status: false, message: 'Order ID is required', data: {} });
    }

    // Find transaction by order ID
    const transaction = await Transaction.findOne({ 
      razorpayOrderId: orderId 
    }).populate('user', 'name email');

    if (!transaction) {
      return res.status(404).json({ status: false, message: 'Transaction not found', data: {} });
    }

    res.json({ 
      status: true, 
      message: 'Payment status fetched successfully', 
      data: { 
        transaction: {
          id: transaction._id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          description: transaction.description,
          subscriptionEndDate: transaction.subscriptionEndDate,
          user: transaction.user
        }
      } 
    });
  } catch (err) {
    console.error('Error in getPaymentStatus:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Get user's transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments({ user: userId });

    res.json({ 
      status: true, 
      message: 'Transaction history fetched successfully', 
      data: { 
        transactions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      } 
    });
  } catch (err) {
    console.error('Error in getTransactionHistory:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Get current subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const activeTransaction = await Transaction.findOne({
      user: userId,
      status: 'completed',
      isActive: true,
      subscriptionEndDate: { $gt: new Date() }
    });

    if (!activeTransaction) {
      return res.json({ 
        status: true, 
        message: 'No active subscription', 
        data: { 
          hasActiveSubscription: false,
          subscription: null
        } 
      });
    }

    res.json({ 
      status: true, 
      message: 'Subscription status fetched successfully', 
      data: { 
        hasActiveSubscription: true,
        subscription: {
          id: activeTransaction._id,
          startDate: activeTransaction.subscriptionStartDate,
          endDate: activeTransaction.subscriptionEndDate,
          amount: activeTransaction.amount,
          status: activeTransaction.status,
          description: activeTransaction.description
        }
      } 
    });
  } catch (err) {
    console.error('Error in getSubscriptionStatus:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
}; 