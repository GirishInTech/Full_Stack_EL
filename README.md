# TeamFinder 🤝

**Find. Connect. Collaborate.**

TeamFinder is a comprehensive web platform designed for college students to discover events like hackathons, ideathons, and research competitions, and to form teams based on shared interests and complementary skills.

Built with the MERN stack (MongoDB, Express.js, React, Node.js) using plain JavaScript - perfect for learning and understanding full-stack development!

---

## 🎯 Features

### For Students
- **Event Discovery**: Browse upcoming, ongoing, and past events with filters
- **Smart Team Formation**: Create teams or join existing ones for specific events
- **Skill-Based Search**: Find teammates with complementary skills and invite them directly
- **Invitation System**: View and manage team invitations (accept/decline)
- **Profile Management**: Showcase your skills, achievements, phone number, and experience
- **AI Chatbot**: Ask questions about events (stub implementation)
- **Personalized Dashboard**: See recommended events and potential teammates

### For Admins
- **Event Management**: Create, update, and delete events
- **Brochure Parsing**: Upload event brochures (AI parsing stubbed)
- **Event Monitoring**: Track registrations and team formations

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool (lightning fast!)
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first styling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Additional Tools
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Multer** - File upload handling
- **Express Rate Limit** - API rate limiting

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **npm** or **pnpm** - Comes with Node.js

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd code
```

### 2. Install Dependencies

Install all dependencies for root, backend, and frontend:

```bash
npm run install:all
```

Or install manually:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Set Up Environment Variables

Create a `.env` file in the `backend` folder:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configurations:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/teamfinder

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_ACCESS_SECRET=your_super_secret_access_key_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# MongoDB should start automatically as a service
# Or manually start it:
mongod
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
# Or
brew services start mongodb-community
```

### 5. Run the Application

From the root directory:

```bash
npm run dev
```

This will start:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:5173`

---

## 📁 Project Structure

```
code/
├── backend/                 # Express.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware (auth, errors)
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic & AI stubs
│   ├── .env               # Environment variables
│   ├── package.json       # Backend dependencies
│   └── server.js          # Entry point
│
├── frontend/               # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (auth)
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions (API)
│   │   ├── App.jsx        # Root component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html         # HTML template
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   └── tailwind.config.js # Tailwind configuration
│
├── package.json           # Root package (scripts)
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

---

## 🔐 Default Users

For testing, you can create users via the Register page or API.

**Test Admin Account** (create manually):
- Register with role: "admin"
- Email: admin@example.com
- Password: admin123

**Test Student Account**:
- Register with role: "student"
- Email: student@example.com
- Password: student123

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile (name, phone, skills, etc.)
- `GET /api/users/search?skills=react,python` - Search users by skills
- `GET /api/users/all` - Get all students (for teammate discovery)
- `GET /api/users/:id` - Get user by ID

### Events
- `POST /api/events` - Create event (Admin)
- `GET /api/events` - List all events (with filters)
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)
- `POST /api/events/:id/parse-brochure` - Parse brochure (Admin, stub)
- `POST /api/events/:id/ask` - Ask chatbot (stub)

### Teams
- `POST /api/teams` - Create team
- `GET /api/teams/my-teams` - Get user's teams
- `GET /api/teams/my-invites` - Get pending invitations
- `GET /api/teams/event/:eventId` - Get teams for event
- `GET /api/teams/:id` - Get team details
- `POST /api/teams/:id/invite` - Invite user to team
- `POST /api/teams/:id/join` - Join team (accept invite)
- `POST /api/teams/:id/decline` - Decline team invitation
- `POST /api/teams/:id/leave` - Leave team
- `DELETE /api/teams/:id` - Delete team (Leader only)

---

## 🎨 Key Features Explained

### 1. Authentication System
- **JWT-based**: Uses access tokens (15min) and refresh tokens (7 days)
- **Role-based access**: Students and Admins have different permissions
- **Secure**: Passwords hashed with bcrypt, tokens stored securely

### 2. Event Management
- **CRUD operations**: Admins can create, read, update, delete events
- **Status tracking**: Events automatically marked as upcoming/ongoing/past
- **Filtering**: Filter events by status and category
- **Brochure support**: Upload and link event brochures

### 3. Team Formation
- **Team creation**: Students create teams for specific events
- **Invite system**: Team leaders invite members by email
- **Size limits**: Teams respect event's min/max size requirements
- **One team per event**: Users can only join one team per event

### 4. Skill-Based Search
- **Smart matching**: Search finds users with matching skills
- **Ranking**: Results ranked by skill matches and experience
- **Stats display**: See each user's event participation and wins

### 5. AI Features (Stubbed)
- **Brochure Parser**: Mock service extracts event details from uploads
- **Chatbot**: Rule-based Q&A about events
- **Ready for integration**: Easy to replace with real Gemini/OpenAI APIs

---

## 🧪 Testing the Application

### Manual Testing Flow

1. **Register as Student**
   - Go to `/register`
   - Create student account with skills and optional phone number

2. **View Events**
   - Browse dashboard
   - Apply filters
   - View event details

3. **Register as Admin**
   - Create another account with role "admin"

4. **Create Event (as Admin)**
   - Go to `/create-event`
   - Fill in event details
   - Submit

5. **Create Team (as Student)**
   - View an event
   - Go to Teams tab
   - Create a new team

6. **Search Teammates**
   - Go to `/search`
   - Search by skills (e.g., "react") or view all students
   - Invite users directly from search results

7. **Manage Invitations**
   - Go to My Teams page
   - View pending invitations
   - Accept or decline invites

8. **Test Chatbot**
   - Open any event
   - Go to Chatbot tab
   - Ask questions about deadlines, rules, etc.

---

## 🔧 Common Issues & Solutions

### Issue: MongoDB connection error
**Solution**: 
- Ensure MongoDB is running: `mongod` or check services
- Verify `MONGODB_URI` in `.env`
- Check if port 27017 is available

### Issue: Frontend can't connect to backend
**Solution**:
- Ensure backend is running on port 5000
- Check proxy settings in `vite.config.js`
- Verify `CORS_ORIGIN` in backend `.env`

### Issue: JWT token errors
**Solution**:
- Clear localStorage: `localStorage.clear()` in browser console
- Verify JWT secrets are set in `.env`
- Check token expiration times

### Issue: Tailwind styles not working
**Solution**:
- Run `npm install` in frontend folder
- Restart Vite dev server
- Check `tailwind.config.js` content paths

---

## 📚 Learning Resources

This project is perfect for learning:
- **MERN Stack**: MongoDB, Express, React, Node.js
- **REST APIs**: Building and consuming RESTful services
- **JWT Authentication**: Secure token-based auth
- **React Hooks**: useState, useEffect, useContext
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP requests and interceptors

### Recommended Study Path
1. Understand the data models (User, Event, Team)
2. Study the authentication flow
3. Explore the API endpoints
4. Learn how React context manages state
5. See how components communicate
6. Understand the routing structure

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Real AI integration (Gemini/OpenAI)
- [ ] Resume analysis for teammate suggestions
- [ ] Email notifications
- [ ] Real-time chat between team members
- [ ] College domain verification (RVCE)
- [ ] Leaderboard for most active students
- [ ] Event analytics dashboard
- [ ] Mobile responsive improvements
- [ ] PWA support
- [ ] Dark mode

### Production Deployment
To deploy this app:
1. Set up production MongoDB (MongoDB Atlas)
2. Deploy backend to Render/Railway/Heroku
3. Deploy frontend to Vercel/Netlify
4. Update environment variables
5. Enable HTTPS
6. Set up proper CORS
7. Implement rate limiting
8. Add monitoring (Sentry)

---

## 🤝 Contributing

This is a learning project, so contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

---

## 👨‍💻 Author

Created for learning purposes as part of full-stack development coursework.

---

## 📞 Support

If you encounter any issues:
1. Check this README
2. Review the code comments (heavily documented)
3. Check the browser console for errors
4. Check the backend terminal for errors

---

## 🎓 Academic Use

This project is designed for educational purposes. Feel free to:
- Use it as a reference for your projects
- Learn from the code structure
- Extend it with new features
- Share it with classmates

**Note**: If you use this for academic submissions, make sure to follow your institution's policies on code sharing and attribution.

---

## 🌟 Acknowledgments

- Inspired by real problems faced in college event management
- Built with modern web technologies
- Designed to be beginner-friendly and educational

---

**Happy Coding! 🚀**

*Find. Connect. Collaborate.*
