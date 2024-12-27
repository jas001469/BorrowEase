const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

// Ensure Mongoose is connected to your database before performing any operations
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB", err);
    });

async function setAdmin() {
    try {
        // Fetch the admin ID from environment variables
        const adminId = process.env.ADMIN_ID;
        if (!adminId) {
            throw new Error("Admin ID is not set in the environment variables.");
        }

        // Look for the user with the specified admin ID
        const user = await User.findById(adminId);
        if (!user) {
            throw new Error("User with the specified admin ID does not exist.");
        }

        // Set isAuthor to true to grant admin privileges
        user.isAuthor = true;
        await user.save();
        console.log(`User ${adminId} has been set as admin.`);
    } catch (error) {
        console.error(`Error setting admin: ${error.message}`);
    } finally {
        // Close the MongoDB connection after completing the operation
        mongoose.connection.close();
    }
}

module.exports = setAdmin;

