const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100,


    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
    },
    phoneNumber: {
        type: String,
        // required: true,
        trim: true,
        minlength: 11,
        maxlength: 11,
        unique: true
    },
    governorate: {
        type: String,
    },
    city: {
        type: String,
    },
    jobs: [],
    profilePhoto: {
        type: Object,
        default: {
            url: 'https://cdn.pixabay.com/photo/2017/02/25/22/04/user-icon-2098873_1280.png',
            publicId: null
        }

    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    otp: {
        type: Number,
        minlength: 4,
        maxlength: 4,
        required: false
    },
    otpExpires: {
        type: Date,
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
});



UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id, isAdmin: this.isAdmin }, process.env.JWT_SECRET);

}

const User = mongoose.model('User', UserSchema);


function validateRegisteredUser(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(6).required(),
        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({ 'any.only': 'Passwords must match' }),
        phoneNumber: Joi.string().trim().min(11).max(11).required(),
        governorate: Joi.string().min(3).max(50),
        city: Joi.string().min(3).max(50),
    });
    return schema.validate(obj);

}

function validateLoginUser(obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(6).required(),
    });
    return schema.validate(obj);
}
function validateResetPassword(obj) {
    const schema = Joi.object({
        email: Joi.string().trim().required().email(),
        newPassword: Joi.string().trim().min(6).required(),
    });
    return schema.validate(obj);
}

function validateUpdateUser(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        password: Joi.string().trim().min(6),
    });
    return schema.validate(obj);

}


module.exports = {
    User,
    validateRegisteredUser,
    validateLoginUser,
    validateUpdateUser,
    validateResetPassword,
    
}