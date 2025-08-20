#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up KFUPM Smart Section Picker...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v16 or higher.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log(`✅ npm version: ${npmVersion.trim()}`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm.');
  process.exit(1);
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `MONGODB_URI=mongodb://mongo:PAwYKGVMTLgOtnWEJWanEhdHmYOEYJCM@trolley.proxy.rlwy.net:26642
JWT_SECRET=test1234test
NODE_ENV=development
CLIENT_URL=http://localhost:3000
PORT=5000`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });
  
  console.log('Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  console.log('✅ All dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Populate sample data
console.log('\n🗄️ Populating sample data...');
try {
  execSync('cd server && node -e "require(\'./data/sampleData\').populateSampleData().then(() => process.exit())"', { stdio: 'inherit' });
  console.log('✅ Sample data populated successfully');
} catch (error) {
  console.error('❌ Failed to populate sample data:', error.message);
  console.log('⚠️ You can manually populate data later using the API');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Start MongoDB (if not already running)');
console.log('2. Run "npm run dev" to start the application');
console.log('3. Open http://localhost:3000 in your browser');
console.log('4. Register a new account and start using the app!');
console.log('\n📚 For more information, check the README.md file');
console.log('\n🔧 Available commands:');
console.log('- npm run dev: Start development servers');
console.log('- npm run build: Build for production');
console.log('- npm run server: Start only the backend server');
console.log('- npm run client: Start only the frontend client');