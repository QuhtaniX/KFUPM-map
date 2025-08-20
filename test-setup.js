// Use server's node_modules for dependencies
const path = require('path');
const mongoose = require(path.join(__dirname, 'server', 'node_modules', 'mongoose'));
require(path.join(__dirname, 'server', 'node_modules', 'dotenv')).config({ path: './server/.env' });

async function testSetup() {
  console.log('🧪 Testing local setup...\n');
  
  // Test environment variables
  console.log('📋 Environment Variables:');
  console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}`);
  console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || '❌ Missing'}`);
  console.log(`- CLIENT_URL: ${process.env.CLIENT_URL || '❌ Missing'}`);
  console.log(`- PORT: ${process.env.PORT || '❌ Missing'}`);
  console.log(`- STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '⚠️  Set (will be disabled)' : '✅ Not set (as expected)'}\n`);
  
  // Test MongoDB connection
  console.log('🔌 Testing MongoDB connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Test basic database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Database accessible. Found ${collections.length} collections`);
    
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully\n');
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('💡 Make sure your Railway MongoDB is running and accessible\n');
  }
  
  // Test server dependencies
  console.log('📦 Testing server dependencies...');
  try {
    require('./server/package.json');
    console.log('✅ Server package.json found');
  } catch (error) {
    console.log('❌ Server package.json not found');
  }
  
  try {
    require('./client/package.json');
    console.log('✅ Client package.json found');
  } catch (error) {
    console.log('❌ Client package.json not found');
  }
  
  console.log('\n🎉 Setup test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Run: npm run install-all');
  console.log('2. Run: npm run dev');
  console.log('3. Open: http://localhost:3000');
}

testSetup().catch(console.error);