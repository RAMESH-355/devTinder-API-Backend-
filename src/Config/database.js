const mongoose = require("mongoose");

const connectDB = async () => {
    const uri = "mongodb+srv://rmshvalle_db_user:kw3EGoxrmruh7Gm9@cluster0.qlkk1qr.mongodb.net/devTinder";
    return mongoose.connect(uri);
};

module.exports = connectDB;