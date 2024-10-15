const asyncHandler = require("express-async-handler");
const { Post, validateCreatePost, validateUpdatePost } = require("../models/postModel");
const path = require("path");
const fs = require("fs");
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloudinary");
const {Job} = require("../models/jobModel")
const {User} = require("../models/userModel")
const {Comment} = require("../models/commentsModel")

/**---------------------------------
 * @desc Create new Post
 * @route api/post
 * @method POST
 * @access private (only Logged in user)
 -----------------------------------*/

module.exports.createPostCtrl=asyncHandler (async(req,res)=>{
    // Validation
    if (!req.file) {
        return res.status(404).json({ message: "no image provided" });
    }
    const { error } = validateCreatePost(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    const job = await Job.findOne({ title: req.body.job });
    if (!job) {
        return res.status(404).json({ message: 'Job not found. Please select a valid job.' });
    }
//   post creation
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)
    
    const post = await Post.create({
        title: req.body.title,
        description: req.body.description,
        job: job._id,
        // ***check wessam 3amla id wla _id***
        user: req.user.id,
        image: {
            url: result.secure_url,
            publicId: result.public_id
        }

    });
    const user = await User.findById(req.user.id);
    if (!user.jobs.includes(job.title)) {
        user.jobs.push(job.title);  // Add job title to user's jobs array
        await user.save();
    }
    res.status(200).json(post);
    fs.unlinkSync(imagePath);
})

/**---------------------------------
 * @desc Get All Post
 * @route api/post
 * @method GET
 * @access public
 -----------------------------------*/


 module.exports.getAllPostCtrl = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const { job } = req.query;
    let posts;
    if (job) {
        const foundJob = await Job.findOne({ title: job });
        if (!foundJob) {
            return res.status(404).json({ message: "Job not found" });
        }
        // Filter posts by job ID
        posts = await Post.find({ job: foundJob._id })
            .sort({ createdAt: -1 })
            .populate("user", ["-password"]);

    } else {
        posts = await Post.find({}, { "__v": false }).limit(limit).skip(skip) .sort({ createdAt: -1 })
        .populate("user", ["-password"]);

    }

    const formattedPosts = posts.map(post => ({
        _id: post._id,
        title: post.title,
        description: post.description,
        job: post.job.title,
        user: post.user,
        image: post.image ? post.image.url : null,
        createdAt: post.createdAt
    }));

    res.status(200).json(formattedPosts)});

/**---------------------------------
 * @desc Get single Post
 * @route api/post/:id
 * @method GET
 * @access public
 -----------------------------------*/


 module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");
    if (!post) {
        return res.status(404).json({ message: "post not found" })
    }
    res.status(200).json(post);
})



/**---------------------------------
* @desc Update Post
* @route api/post/:id
* @method PUT
* @access private (only owner of the post)
-----------------------------------*/

module.exports.updatePostCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdatePost(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }


    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: "post not found" });
    }

    if (req.user.id !== post.user.toString()) {
        return res.status(404).json({ message: "access denied" });
    }



    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            job: req.body.job
        }
    }, { new: true }).populate("user", ["-password"])


    res.status(200).json(updatedPost);

})





/**---------------------------------
* @desc Update Post image
* @route api/post/upload-image/:id
* @method PUT
* @access private (only owner of the post)
-----------------------------------*/

module.exports.updatePostImageCtrl = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "no image provided" });
    }


    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: "post not found" });
    }

    if (req.user.id !== post.user.toString()) {
        return res.status(404).json({ message: "access denied" });
    }



    // await cloudinaryRemoveImage(post.image.publicId)

    if (post.image && post.image.publicId) {
        try {
            await cloudinaryRemoveImage(post.image.publicId);
        } catch (error) {
            return res.status(500).json({ message: "Failed to remove old image from Cloudinary", error: error.message });
        }
    }
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            image: {
                url: result.secure_url,
                publicId: result.public_id
            }
        }
    }, { new: true })

    res.status(200).json(updatedPost);

    fs.unlinkSync(imagePath);
})

/**---------------------------------
 * @desc Delete Post
 * @route api/post/:id
 * @method Delete
 * @access private (only Admin or owner of the post)
 -----------------------------------*/


 module.exports.DeletePostCtrl = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: "post not found" })
    }

    if (req.user.IsAdmin || req.user.id === post.user.toString()) {
        await Post.findByIdAndDelete(req.params.id);
        await cloudinaryRemoveImage(post.image.publicId);

        await Comment.deleteMany({postId:post._id})
       
        res.status(200).json({ message: "post deleted successfully", postId: post._id });

    }
    else {
        res.status(404).json({ message: "access denied" });

    }
})