const Character = require('../models/Character');
const Discussion = require('../models/Discussion');
const mongoose = require('mongoose');

// @desc    Get top 3 characters
// @route   GET /api/social/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
    try {
        const topCharacters = await Character.find()
            .sort({ votes: -1 })
            .limit(20);
        res.status(200).json({ success: true, data: topCharacters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Vote for a character
// @route   POST /api/social/vote/:id
// @access  Private
exports.voteCharacter = async (req, res) => {
    try {
        const characterId = req.params.id;

        // Validate ObjectId to prevent Mongoose cast errors (important for fallback IDs)
        if (!mongoose.Types.ObjectId.isValid(characterId)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Character not found or currently in preview mode' 
            });
        }

        const character = await Character.findById(characterId);
        if (!character) {
            return res.status(404).json({ success: false, message: 'Character not found' });
        }

        // Check if user already voted
        if (character.votedBy.includes(req.user._id)) {
            return res.status(400).json({ success: false, message: 'You have already voted for this character' });
        }

        character.votes += 1;
        character.votedBy.push(req.user._id);
        await character.save();

        res.status(200).json({ success: true, data: character });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get discussions for a target
// @route   GET /api/social/discuss/:targetId
// @access  Public
exports.getDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.find({ targetId: req.params.targetId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: discussions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Post a discussion/message
// @route   POST /api/social/discuss
// @access  Private
exports.postDiscussion = async (req, res) => {
    try {
        const { targetId, targetType, content } = req.body;
        const discussion = await Discussion.create({
            targetId,
            targetType,
            content,
            user: req.user._id
        });

        const populated = await Discussion.findById(discussion._id).populate('user', 'name avatar');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
