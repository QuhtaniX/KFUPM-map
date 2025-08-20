# KFUPM Smart Section Picker

A smart application to help KFUPM students choose optimal class schedules based on their preferences and constraints.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd kfupm-smart-section-picker
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Test the setup** (optional but recommended)
   ```bash
   npm run test-setup
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
kfupm-smart-section-picker/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── data/
│   ├── .env               # Environment variables
│   └── package.json
├── package.json           # Root package.json
├── setup.js              # Initial setup script
├── test-setup.js         # Setup verification script
└── README.md
```

## 🔧 Configuration

The application uses the following environment variables (configured in `server/.env`):

- `MONGODB_URI`: MongoDB connection string (Railway)
- `JWT_SECRET`: Secret key for JWT authentication
- `NODE_ENV`: Environment (development/production)
- `CLIENT_URL`: Frontend URL (http://localhost:3000)
- `PORT`: Backend server port (5000)

## 🎯 Features

- **Smart Schedule Generation**: AI-powered schedule optimization
- **Course Management**: Browse and search courses
- **User Authentication**: Secure login/registration
- **Schedule Visualization**: Interactive calendar view
- **Conflict Detection**: Automatic schedule conflict detection
- **Export Options**: Export schedules in various formats

## 🛠️ Available Scripts

- `npm run dev`: Start both frontend and backend in development mode
- `npm run server`: Start only the backend server
- `npm run client`: Start only the frontend client
- `npm run install-all`: Install dependencies for all packages
- `npm run test-setup`: Test the local setup configuration
- `npm run setup`: Run initial setup (creates .env file)
- `npm run populate-data`: Populate database with sample data

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get specific course
- `POST /api/courses` - Create new course (admin)

### Schedules
- `GET /api/schedules` - Get user schedules
- `POST /api/schedules` - Create new schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### Payments (Disabled for local development)
- Payment endpoints are available but return "service not available" when Stripe is not configured

## 🗄️ Database

The application uses MongoDB hosted on Railway. The database includes:

- **Users**: User accounts and authentication
- **Courses**: Course information and sections
- **Schedules**: User-generated schedules
- **Sections**: Individual class sections

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your Railway MongoDB connection string
   - Ensure the database is accessible from your IP

2. **Port Already in Use**
   - Change the PORT in `server/.env`
   - Kill processes using ports 3000 or 5000

3. **Dependencies Not Found**
   - Run `npm run install-all` to install all dependencies
   - Check Node.js version (requires v16+)

4. **Environment Variables Missing**
   - Run `npm run setup` to create the .env file
   - Verify all required variables are set

### Getting Help

If you encounter issues:
1. Run `npm run test-setup` to diagnose problems
2. Check the console for error messages
3. Verify your MongoDB connection
4. Ensure all dependencies are installed

## 📝 Development Notes

- **Stripe Integration**: Currently disabled for local development
- **CORS**: Configured for localhost development
- **Hot Reload**: Both frontend and backend support hot reloading
- **Environment**: Uses development configuration by default

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.