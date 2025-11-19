const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema ({
    firstName : {
        type: String,
        required : true,
        trim: true,
        minLength: 2,
        maxLength: 50
    },
    lastName : {
        type: String,
        trim: true,
        maxLength: 40
    },
    emailId : {
        type: String,
        required : true,
        unique: true,
        lowercase: true,
        trim: true,
        minLength: 6,
        maxLength: 40,
        validate(value) {
            if ( !validator.isEmail(value) ){
                throw new Error("EmailId is not valid: " + value);
            }
        }
    },
    password : {
        type: String,
        required : true,
        minLength: 5,
        maxLength: 100,
        validate(value) {
            if ( !validator.isStrongPassword(value) ){
                throw new Error("Passowrd is not strong ! Enter a strong password: " + value);
            }
        }
    },
    age : {
        type: Number,
        min: 18,
        trim: true
    },
    gender : {
        type: String,
        lowercase: true,
        validate(value) {
            if (!["male","female","others"].includes(value)) {
                throw new Error("Gender is not valid");
            }
        }
    },
    photoURL : {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf1fiSQO7JfDw0uv1Ae_Ye-Bo9nhGNg27dwg&s",
        validate(value) {
            if ( !validator.isURL(value) ){
                throw new Error("PhotoURL is not valid: " + value);
            }
        }
    },
    about : {
        type: String,
        default: "Default web devoleper",
        trim: true,
        minLength: 10,
        maxLength: 500
    },
    skills : {
        type: [String],
        minLength: 15
    }
}, {timestamps : true});

userSchema.methods.getJWT = async function() {
    const user = this; 

    //creating token 

    const token = await jwt.sign({ _id:user._id },"Dev@tinder#132", {
        expiresIn: "7d"
    });

    return token;
}

userSchema.methods.validatePassword = async function(userGivenPassword) {
    const user = this; 

    const isPasswordValid = await bcrypt.compare(userGivenPassword , user.password);

    return isPasswordValid;
}

const User = mongoose.models.User || mongoose.model("User", userSchema); 

module.exports = User ;