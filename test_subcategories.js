const mongoose = require('mongoose');
const Subcategory = require('./common/subcategory.model');
const Category = require('./common/category.model');
require('dotenv').config();

async function testSubcategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const categoryId = '6887c6b49ea7adc8279bf01d'; // Quotes category
    
    // Check subcategories in this category
    const subcategories = await Subcategory.find({
      category: categoryId,
      isDeleted: false,
      isSuspended: false
    }).populate('category', 'title slug');
    
    console.log(`Found ${subcategories.length} subcategories in "Quotes" category:`);
    subcategories.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.title} (${sub.images.length} images)`);
    });
    
    // Check total subcategories
    const totalSubcategories = await Subcategory.find({
      isDeleted: false,
      isSuspended: false
    }).countDocuments();
    
    console.log(`\nTotal subcategories in database: ${totalSubcategories}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testSubcategories();