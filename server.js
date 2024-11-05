const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const FileStore = require('session-file-store')(session);

// CORS configuration
app.use(cors({
    origin: 'https://iosx.vercel.app',
    credentials: true
}));

// Session configuration
app.use(session({
    store: new FileStore({ path: './sessions' }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Body parser for JSON
app.use(bodyParser.json());

// Your activity tracking data and routes
const correctPasskey = process.env.PASSKEY || "default_passkey";
let activityData = {
    Notifications: 'Sample notification data',
    SMS: 'Sample SMS data',
    CallLogs: 'Sample call log data',
    Location: 'Sample location data',
    SocialMedia: 'Sample social media data',
    GalleryAccess: 'Sample gallery access data',
    FileManager: 'Sample file manager data',
    Keystrokes: 'Sample keystrokes data'
};

// Authentication route
app.post('/Login', (req, res) => {
    const { passkey } = req.body;
    if (passkey === correctPasskey) {
        req.session.authenticated = true;
        console.log('User authenticated, session created.');
        console.log('Session ID:', req.sessionID);
        res.status(200).json({ message: 'Authenticated' });
    } else {
        res.status(401).json({ message: 'Incorrect passkey' });
    }
});

// Check auth status route
app.get('/auth-status', (req, res) => {
    console.log('Checking auth status:', req.session.authenticated);
    if (req.session.authenticated) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.status(200).json({ message: 'Logged out' });
    });
});

// Data fetching route
app.get('/fetch/:activityType', (req, res) => {
    if (!req.session.authenticated) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    const activityType = req.params.activityType;
    const data = activityData[activityType] || `No data available for ${activityType}`;
    res.json({ data });
});

// Server listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
