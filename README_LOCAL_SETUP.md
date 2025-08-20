# KFUPM Smart Section Picker - Local Setup

This guide will help you set up and run the KFUPM Smart Section Picker application locally.

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd kfupm-smart-section-picker
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## What's Included

- **Backend Server**: Runs on `http://localhost:5000`
- **Frontend Client**: Runs on `http://localhost:3000`
- **MongoDB**: Connected to Railway (cloud database)
- **Authentication**: JWT-based authentication
- **Sample Data**: Pre-populated with course and schedule data

## Environment Configuration

The application uses the following environment variables (already configured in `server/.env`):

- `MONGODB_URI`: Your Railway MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Set to 'development'
- `CLIENT_URL`: Frontend URL (http://localhost:3000)
- `PORT`: Backend server port (5000)

## Available Commands

- `npm run dev`: Start both frontend and backend in development mode
- `npm run server`: Start only the backend server
- `npm run client`: Start only the frontend client
- `npm run build`: Build the frontend for production
- `npm run populate-data`: Populate the database with sample data

## Features

- User registration and authentication
- Course browsing and searching
- Schedule creation and management
- Conflict detection
- Responsive design

## Notes

- Stripe payment integration is disabled for local development
- The application connects to a cloud MongoDB instance on Railway
- Sample data is automatically populated on first run

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed: `npm run install-all`
2. Check that the MongoDB connection is working
3. Ensure ports 3000 and 5000 are available
4. Check the console for any error messages

## Support

For issues or questions, please check the main README.md file or contact the development team.