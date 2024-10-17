const router = require('express').Router();
const { CreateCommentCtrl, getAllCommentCtrl, deleteCommentCtrl, UpdateCommentCtrl } = require('../controllers/commentController');
const {vertifyToken, verifyTokenOnlyUser, verifyTokenAndAuth} = require('../middlewares/vertifyToken')
const validateObjectId = require('../middlewares/validateObjectId');



router.route("/")
 .post(vertifyToken,CreateCommentCtrl)
 .get (verifyTokenAndAuth , getAllCommentCtrl);

 router.route("/:id")
  .delete(validateObjectId,verifyTokenAndAuth,deleteCommentCtrl)
  .put(validateObjectId,verifyTokenOnlyUser,UpdateCommentCtrl)


module.exports = router;