const asyncHandler =  require('express-async-handler');
const {Job, validateCreateJob} = require("../models/jobModel")


/**---------------------------------
* @desc Create new job
* @route api/job
* @method POST
* @access private (only admin)
-----------------------------------*/

module.exports.createJobCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateJob(req.body);
    if (error) {
        return res.status(404).json({ message: error.details[0].message });
    }

    let job = await Job.findOne({ title: req.body.title });
    if (job) {
        return res.status(400).json({ message: 'This job already exists' });
    }

    job = await Job.create({
        title: req.body.title,
    });

    res.status(200).json(job);
});
/**---------------------------------
* @desc get all jobs
* @route api/job
* @method Get
* @access private (only admin )
-----------------------------------*/

module.exports.getAllJobsCtrl = asyncHandler (async (req,res) => {
    const jobs = await Job.find();
    res.status(200).json(jobs)
})

/**---------------------------------
* @desc delete job
* @route api/job/:id
* @method Delete
* @access private (only admin )
----------------------------------*/
module.exports.deleteJobCtrl = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id)
   
    if (!job) {
        return res.status(404).json({ message: "job not found" })
    }

    await Job.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: "job has been deleted succesfully", })

})

/**---------------------------------
* @desc Update job
* @route api/job/:id
* @method Put
* @access private (only admin)
-----------------------------------*/
module.exports.updateJobCtrl = asyncHandler (async(req,res)=>{
    const {error} = validateCreateJob (req.body) 
    if (error) {
        return res.status(404).json({ message: error.details[0].message });
    }

    const job = await Job.findById(req.params.id)
    if (!job) {
        return res.status(404).json({ message: "job not found" });
    }

    const updatedJob = await Job.findByIdAndUpdate (req.params.id, {
        $set: {
            text: req.body.text,
        }
    }, { new: true })
   res.status(200).json({ updatedJob})
})