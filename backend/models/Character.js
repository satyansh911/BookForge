const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    mangaTitle: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    votes: {
        type: Number,
        default: 0
    },
    votedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.models.Character || mongoose.model('Character', characterSchema);
