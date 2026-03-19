const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if(!name || !email || !password){
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const userExists = await User.findOne({ email });
        if(userExists){
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ name, email, password });
        if(user){
            res.status(201).json({
                message: 'User registered successfully',
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else{
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('registerUser error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if(user && (await user.matchPassword(password))){
            res.json({
                message: 'Login successful',
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else{
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error('loginUser error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            pronouns: user.pronouns,
            bio: user.bio,
            occupation: user.occupation,
            location: user.location,
            isPro: user.isPro,
        });
    } catch (error) {
        console.error('getProfile error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(user){
            user.name = req.body.name || user.name;
            user.avatar = req.body.avatar || user.avatar;
            user.pronouns = req.body.pronouns !== undefined ? req.body.pronouns : user.pronouns;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.occupation = req.body.occupation !== undefined ? req.body.occupation : user.occupation;
            user.location = req.body.location !== undefined ? req.body.location : user.location;
            
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                pronouns: updatedUser.pronouns,
                bio: updatedUser.bio,
                occupation: updatedUser.occupation,
                location: updatedUser.location,
                isPro: updatedUser.isPro,
            });
        } else{
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('updateUserProfile error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
