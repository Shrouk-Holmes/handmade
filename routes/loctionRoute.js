const router = require('express').Router();

const { addLocationCtrl } = require('../controllers/locationController');
const { verifyTokenAndAdmin } = require('../middlewares/vertifyToken');


router.post('/' ,verifyTokenAndAdmin ,addLocationCtrl );

module.exports = router;