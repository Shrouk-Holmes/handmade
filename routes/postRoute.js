const router = require('express').Router();
const {createPostCtrl, getAllPostCtrl, getSinglePostCtrl, DeletePostCtrl, updatePostCtrl, updatePostImageCtrl } = require('../controllers/postController');
const photoUpload = require("../middlewares/photoUpload");
const validateObjectId = require('../middlewares/validateObjectId');
const { vertifyToken, verifyTokenAndAuth } = require('../middlewares/vertifyToken');




router.route('/')
 .post(vertifyToken,photoUpload.single("image"),createPostCtrl)
 .get(vertifyToken,getAllPostCtrl)


 router.route('/:id')
 .get(vertifyToken,validateObjectId,getSinglePostCtrl)
 .delete(validateObjectId,verifyTokenAndAuth,DeletePostCtrl)
 .put(validateObjectId,vertifyToken,updatePostCtrl)


 router.route("/update-image/:id")
 .put(validateObjectId,vertifyToken, photoUpload.single("image"),updatePostImageCtrl) 
 
  module.exports = router;