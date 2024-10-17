const router = require('express').Router();
const { createJobCtrl, getAllJobsCtrl, updateJobCtrl, deleteJobCtrl } = require('../controllers/jobController');
const validateObjectId = require('../middlewares/validateObjectId');
const { verifyTokenAndAdmin } = require('../middlewares/vertifyToken');

router.route("/")
 .post(verifyTokenAndAdmin,createJobCtrl)
 .get(getAllJobsCtrl);

 router.route("/:id")
 .put(verifyTokenAndAdmin,validateObjectId,updateJobCtrl)
 .delete(verifyTokenAndAdmin,validateObjectId,deleteJobCtrl);

 module.exports = router;