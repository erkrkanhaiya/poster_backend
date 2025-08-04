const mongoose = require('mongoose');
const User = require('./common/users.model');
const Category = require('./common/category.model');
require('dotenv').config();

async function testUserInterests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const userId = '6890d3221e8abc08c304b48a';
    const categoryId = '6887c6b49ea7adc8279bf01d';
    
    // Check if user exists
    const user = await User.findById(userId).populate('interests', 'title slug');
    
    if (!user) {
      console.log('❌ User not found with ID:', userId);
      
      // Create a test user
      const newUser = new User({
        _id: userId,
        phone: '+919999999999',
        name: 'Test User',
        isProfileCompleted: true,
        interests: [categoryId]
      });
      
      await newUser.save();
      console.log('✅ Created test user with interests');
      
      // Verify creation
      const createdUser = await User.findById(userId).populate('interests', 'title slug');
      console.log('Created user:', {
        id: createdUser._id,
        name: createdUser.name,
        interests: createdUser.interests
      });
    } else {
      console.log('✅ User found:', {
        id: user._id,
        name: user.name,
        interests: user.interests
      });
      
      if (!user.interests || user.interests.length === 0) {
        console.log('⚠️  User has no interests, adding interest:', categoryId);
        user.interests = [categoryId];
        await user.save();
        console.log('✅ Updated user interests');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testUserInterests();