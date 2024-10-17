const router = require('express').Router();

const { registerUserCtrl, loginUserCtrl, forgetPasswordCtrl, resetPasswordCtrl, VerifyOTPCtrl } = require('../controllers/authController');
const { vertifyToken } = require('../middlewares/vertifyToken');


router.route('/register')
    .post(registerUserCtrl);

router.route('/login')
    .post(loginUserCtrl);

router.route('/forget-password')
    .post(vertifyToken, forgetPasswordCtrl);

router.route('/verify-otp')
    .post(vertifyToken, VerifyOTPCtrl);

router.route('/reset-password')
    .post(vertifyToken, resetPasswordCtrl);

module.exports = router;