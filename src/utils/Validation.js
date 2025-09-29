const validator = require("validator");

const signupValidation = (req) => {
    const { firstName, lastName, emailId, password } = req.body; 

    if ( !firstName || !lastName) {
        throw new Error("Name is not valid");
    }
    else if ( !validator.isEmail(emailId) ) {
        throw new Error("EmailId is not valid");
    }
    else if (!validator.isStrongPassword(password) ){
        throw new Error(" Password is not strong ");
    }
};

const validateEditProfile = (req) => {
    const allowedEditFields = [
        "firstName", "lastName", "photoURL", "about", "skills", "gender", "age"
    ];
    const isEditAllowed = Object.keys(req.body).every((field) => allowedEditFields.includes(field));

    return isEditAllowed;

}

module.exports = {signupValidation,validateEditProfile};