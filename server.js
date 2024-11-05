const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session); 
require('dotenv').config();

const app = express();

// Middleware setup
app.use(cors({
    origin: 'https://iosx.vercel.app', // Frontend URL
    credentials: true 
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration with FileStore
app.use(session({
    store: new FileStore({ path: './sessions' }), 
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false, // Only save sessions that have been modified
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true // Prevent client-side JavaScript from accessing the cookie
    }
}));

// Logging middleware to help with debugging
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session:', req.session);
    next();
});

// Activity tracking data
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
        console.log('User is authenticated');
        next();
    } else {
        console.log('User is not authenticated, redirecting...');
        res.status(401).json({ message: "Unauthorized" });
    }
}

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid'); // Clears session cookie on the client
        console.log('User logged out, session destroyed.');
        res.status(200).json({ message: "Logged out" });
    });
});

// Endpoint to check authentication status
app.get('/auth-status', (req, res) => {
    console.log('Checking auth status:', req.session.authenticated);
    res.status(200).json({ authenticated: !!req.session.authenticated });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
