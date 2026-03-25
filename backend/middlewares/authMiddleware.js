const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        try{
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if(!token){
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const premiumOnly = (req, res, next) => {
    // Allow if user is premium
    if (req.user && req.user.tier === 'premium') {
        return next();
    }

    const count = req.user?.synthesizedBookCount || 0;
    const isOutline = req.originalUrl.includes('generate-outline');
    const isChapter = req.originalUrl.includes('generate-chapter-content');

    // Free Trial Logic: 
    // - Allow starting one book if count < 1
    // - Allow generating chapters for the first book if count <= 1
    if (req.user && (
        (isOutline && count < 1) || 
        (isChapter && count <= 1)
    )) {
        return next();
    }

    res.status(403).json({ 
        message: 'Synthesis tier required. You have already used your free AI synthesis trial. Upgrade to unlock infinite intelligence.',
        code: 'PREMIUM_REQUIRED'
    });
};

module.exports = { protect, premiumOnly };