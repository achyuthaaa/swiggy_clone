// server.js
// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Initialize express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cors({
  origin: '*', // For development only
  credentials: true
}));

// Static files (optional if you have public folder)
const path = require("path");
app.use(require("express").static(path.join(__dirname, "public")));

// JWT Secret Key
const SECRET_KEY = process.env.JWT_SECRET;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.log('❌ MongoDB Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
});

const User = mongoose.model('User', userSchema);

// ========================
// VALIDATION RULES
// ========================
const signupRules = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginRules = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Middleware to check validation errors
function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            ok: false,
            message: 'Validation failed',
            errors: errors.array().map(e => ({ field: e.path, msg: e.msg }))
        });
    }
    next();
}

// ========================
// ROUTES
// ========================

// Test API
app.get('/', (req, res) => {
    res.send('API is working 🚀');
});

// Signup Endpoint
app.post('/signup', signupRules, validate, async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Signup failed' });
    }
});

// Login Endpoint
app.post('/login', loginRules, validate, async (req, res) => {
    const { email, password } = req.body;
console.log("email,passwprd",email, password )
    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate JWT Token
        const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Protected Route
app.get('/profile', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        res.json({ message: `Welcome ${user.email}, this is your profile data` });
    });
});

// ========================
// START SERVER
// ========================
app.listen(5000, () => {
    console.log('🚀 Server running at http://localhost:5000');
});