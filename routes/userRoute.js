const router = require('express').Router();

const { UpdateUserProfileCtrl, deleteUserProfileCtrl, profilePhotoUploadCtrl, getAllUsersCtrl } = require('../controllers/userController');
const photoUpload = require('../middlewares/photoUpload');
const {vertifyToken} = require('../middlewares/vertifyToken');

router.route('/')
    .get(getAllUsersCtrl)


router.route('/:id')
    .put(vertifyToken,UpdateUserProfileCtrl)
    .delete(vertifyToken, deleteUserProfileCtrl);

// this controllers has a problem
router.route("/upload-photo")
      .post(vertifyToken ,photoUpload.single('profilePhoto'),profilePhotoUploadCtrl) ;

module.exports = router;