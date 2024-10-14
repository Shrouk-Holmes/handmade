const router = require('express').Router();
const {createPostCtrl, getAllPostCtrl, getSinglePostCtrl, DeletePostCtrl, updatePostCtrl, updatePostImageCtrl } = require('../controllers/postController');
const photoUpload = require("../middlewares/photoUpload");
const validateObjectId = require('../middlewares/validateObjectId');
const { vertifyToken } = require('../middlewares/vertifyToken');




router.route('/')
 .post(vertifyToken,photoUpload.single("image"),createPostCtrl)
 .get(getAllPostCtrl)


 router.route('/:id')
 .get(validateObjectId,getSinglePostCtrl)
 .delete(validateObjectId,vertifyToken,DeletePostCtrl)
 .put(validateObjectId,vertifyToken,updatePostCtrl)


 router.route("/update-image/:id")
 .put(validateObjectId,vertifyToken, photoUpload.single("image"),updatePostImageCtrl) 
 
  module.exports = router;