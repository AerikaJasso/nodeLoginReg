const mongoose = require('mongoose');
const config = require('../config/database');
let bcrypt = require('bcrypt');

// User Schema 
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String, 
        required: true, 
        bcrypt: true
    },
    email: {
        type: String
    },
    name: {
        type: String
    }

});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) return callback(err);
        callback(null, isMatch);
    });
}

// Functions User model will handle
module.exports.createUser = (newUser, callback) => {
    // Use Bcrypt gen salt && hash
    bcrypt.hash(newUser.password, 10, (err, hash) => {
        if(err) throw err;
        // Store hash as password in DB.
        newUser.password = hash;
        // Create User
        newUser.save(callback);
    });
}
