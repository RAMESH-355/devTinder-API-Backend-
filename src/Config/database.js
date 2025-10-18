const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://rmshvalle_db_user:kw3EGoxrmruh7Gm9@cluster0.qlkk1qr.mongodb.net/devTinder", { useNewUrlParser: true, useUnifiedTopology: true }
    );
};

module.exports = connectDB;