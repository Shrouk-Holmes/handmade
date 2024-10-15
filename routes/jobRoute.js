const router = require('express').Router();
const { createJobCtrl, getAllJobsCtrl, updateJobCtrl, deleteJobCtrl } = require('../controllers/jobController');
const validateObjectId = require('../middlewares/validateObjectId');

router.route("/")
 .post(createJobCtrl)
 .get(getAllJobsCtrl);

 router.route("/:id")
 .put(validateObjectId,updateJobCtrl)
 .delete(validateObjectId,deleteJobCtrl);

 module.exports = router;