const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        // Starting the server without a database means every request 500s with
        // no explanation. Fail loudly at boot instead.
        console.error('\n✖ MongoDB connection failed:', err.message);
        console.error('  Check MONGO_URI in backend/.env (and that your IP is allowed in Atlas).\n');
        process.exit(1);
    }
};

module.exports = connectDB;
