const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, validateRegisteredUser, validateLoginUser, validateResetPassword } = require('../models/userModel');
const nodemailer = require('nodemailer');
const { Location } = require('../models/locationModel');
// const {Job} = require('../models/jobModel');
/**-------------------------------
 * @desc Register
 * @route api/auth/register
 * @method post
 * @access public
---------------------------------*/
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {

    const { error } = validateRegisteredUser(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ message: ' This User Already registered' });
    }

    const location = await Location.findOne({
        governorate: req.body.governorate,
        city: req.body.city
    });
    if (!location) {
        return res.status(400).json({ message: 'Invalid governorate or city' });
    }
   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        phoneNumber: req.body.phoneNumber,
        governorate: req.body.governorate,
        city: req.body.city
    });
    await user.save();
    res.status(201).json({ message: 'Registered done Successfully , please Log In' });

});


/**-------------------------------
 * @desc login
 * @route api/auth/login
 * @method post
 * @access public
---------------------------------*/
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateLoginUser(req.body);
    if (error) {
        return res.status(400).json({ msg: error.details[0].message });
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        res.status(400).json({ message: "Invalid Email or Password" });
    }
    const isPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isPassword) {
        res.status(400).json({ message: "Invalid Password" });
    }
    const token = user.generateAuthToken();
    res.json({
        message: "Logged In Successfully",
        data: {
            _id: user._id,
            isAdmin: user.isAdmin,
            token
        }
    });
});

/**-------------------------------
 * @desc forget password
 * @route api/auth/forgot-password
 * @method post
 * @access public
---------------------------------*/
module.exports.forgetPasswordCtrl = asyncHandler(async (req, res) => {
    try {

        const email = req.body.email;
        if (!email) {
            return res.status(400).json({
                message: "Please provide an email"
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "No account found with this email"
            });
        }
        const otp = crypto.randomInt(1000, 9000);
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            auth: {
                user: process.env.MY_GMAIL,
                pass: process.env.MY_PASSWORD
            }
        });
        const receiver = {
            from: process.env.MY_GMAIL,
            to: email,
            subject: "Password Reset Request",
            text: `Your OTP is ${otp}. This OTP will expire in 10 minutes.`,
        }
        await transporter.sendMail(receiver);
        return res.status(200).json({
            message: "OTP sent to your registered email. Please check your inbox."
        });

    } catch (error) {
        console.error("Something went Wrong in forgetPassCtrl ", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
});

/**-------------------------------
 * @desc verify OTP
 * @route api/auth/verify-otp
 * @method post
 * @access public
---------------------------------*/
module.exports.VerifyOTPCtrl = asyncHandler(async (req, res) => {
    try {
        const { otp, email } = req.body;
        if (!otp || !email) {
            return res.status(400).json({
                message: "Please provide OTP and email"
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "No account found with this email"
            });
        }
        if (user.otp !== parseInt(otp)) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({
                message: "OTP expired. Please request a new one"
            });
        }
        user.otpVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "OTP verified successfully. now reset password"
        });

    } catch (error) {

        console.error("Something went Wrong in VerifyOTPCtrl ", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

/**-------------------------------
 * @desc reset password
 * @route api/auth/reset-password
 * @method post
 * @access public
 ---------------------------------*/
module.exports.resetPasswordCtrl = asyncHandler(async (req, res) => {
    const { error } = validateResetPassword(req.body);
    if (error) {
        return res.status(400).json({ msg: error.details[0].message });
    }
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Please provide email and new password' });
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'No account found with this email' });
    }
    if (!user.otpVerified) {
        return res.status(400).json({ message: 'Please verify OTP first ' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.otpVerified = false;
    await user.save();
    res.status(200).json({
        message: 'Password reset successfully'
    });

});
