const router = require('express').Router();
const { CreateCommentCtrl, getAllCommentCtrl, deleteCommentCtrl, UpdateCommentCtrl } = require('../controllers/commentController');
const {vertifyToken, verifyTokenAndAdmin} = require('../middlewares/vertifyToken')
const validateObjectId = require('../middlewares/validateObjectId');



router.route("/")
 .post(vertifyToken,CreateCommentCtrl)
 .get (verifyTokenAndAdmin , getAllCommentCtrl);

 router.route("/:id")
  .delete(validateObjectId,vertifyToken,deleteCommentCtrl)
  .put(validateObjectId,vertifyToken,UpdateCommentCtrl)


module.exports = router;