# KFUPM Smart Section Picker

A comprehensive web application that helps KFUPM students choose optimal class schedules with interactive campus mapping, schedule optimization, and CRN export functionality.

## 🚀 Features

### Core Features
- **Smart Schedule Generation**: AI-powered algorithm that creates clash-free schedules
- **Interactive Campus Map**: Visualize your schedule on KFUPM campus with walking paths
- **CRN Export**: Export course registration numbers for easy registration
- **Schedule Comparison**: Compare multiple schedules side-by-side
- **User Preferences**: Set preferred professors, buildings, and time constraints

### User Interface
- **Modern React Frontend**: Built with React 18, Tailwind CSS, and Framer Motion
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Components**: Real-time schedule updates and map interactions
- **Beautiful UI**: Clean, modern interface with smooth animations

### Backend Features
- **Node.js/Express API**: RESTful API with comprehensive endpoints
- **MongoDB Database**: Scalable NoSQL database for data storage
- **JWT Authentication**: Secure user authentication and authorization
- **Schedule Optimization**: Advanced backtracking algorithm for optimal schedules

### Monetization
- **Free Tier**: 1 schedule per term, basic features
- **Premium Tier**: Unlimited schedules, advanced filters, map view, CRN export
- **Stripe Integration**: Secure payment processing

## 🛠️ Technology Stack

### Frontend
- React 18
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- React Leaflet (Interactive Maps)
- React Select
- React Hook Form

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs (Password Hashing)
- Stripe (Payments)
- Helmet (Security)

### Development Tools
- Concurrently (Run frontend/backend simultaneously)
- Nodemon (Auto-restart server)
- ESLint
- Prettier

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kfupm-smart-section-picker
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   Create `.env` file in the server directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/kfupm-scheduler
   JWT_SECRET=your-secret-key-here
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Populate sample data**
   ```bash
   cd server
   node -e "require('./data/sampleData').populateSampleData().then(() => process.exit())"
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🗄️ Database Setup

### MongoDB Connection
The application uses MongoDB for data storage. You can use:
- Local MongoDB installation
- MongoDB Atlas (cloud)
- Docker MongoDB container

### Sample Data
The application includes sample data for:
- KFUPM buildings with coordinates
- Sample courses and sections
- User accounts for testing

## 🔧 Configuration

### Environment Variables

#### Required
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens

#### Optional
- `STRIPE_SECRET_KEY`: Stripe secret key for payments
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `NODE_ENV`: Environment (development/production)
- `CLIENT_URL`: Frontend URL for CORS
- `PORT`: Backend port (default: 5000)

### Stripe Setup (for payments)
1. Create a Stripe account
2. Get your API keys from the dashboard
3. Set up webhook endpoints
4. Add keys to environment variables

## 📱 Usage

### For Students
1. **Register/Login**: Create an account with your KFUPM email
2. **Set Preferences**: Choose preferred professors, buildings, and constraints
3. **Select Courses**: Search and select courses for your term
4. **Generate Schedules**: Get optimized schedules based on your preferences
5. **View on Map**: Visualize your schedule on the interactive campus map
6. **Export CRNs**: Get course registration numbers for registration
7. **Save & Compare**: Save multiple schedules and compare them

### For Administrators
- Monitor user activity and schedule generation
- Manage course data and building information
- View subscription analytics
- Handle payment processing

## 🚀 Deployment

### Production Deployment

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-secret
   STRIPE_SECRET_KEY=your-production-stripe-key
   ```

3. **Deploy to your preferred platform**
   - Heroku
   - Vercel
   - AWS
   - DigitalOcean

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:courseCode` - Get specific course
- `GET /api/courses/departments/list` - Get departments
- `GET /api/courses/buildings/list` - Get buildings

### Schedules
- `POST /api/schedules/generate` - Generate schedules
- `POST /api/schedules/save` - Save schedule
- `GET /api/schedules/my-schedules` - Get user schedules
- `GET /api/schedules/:id/crns` - Get CRNs for schedule

### Payments
- `POST /api/payments/create-subscription` - Create premium subscription
- `GET /api/payments/subscription-status` - Get subscription status

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Mobile app development
- Integration with KFUPM registration system
- Advanced analytics and insights
- Social features (schedule sharing)
- AI-powered course recommendations
- Real-time course availability updates

## 📈 Performance

- Optimized schedule generation algorithm
- Database indexing for fast queries
- Caching for frequently accessed data
- Lazy loading for better UX
- Responsive design for all devices

---

**Built with ❤️ for KFUPM students**