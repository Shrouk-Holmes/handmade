const asyncHandler = require('express-async-handler');
const { User, validateUpdateUser } = require('../models/userModel');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Post } = require('../models/postModel')
const { Comment } = require('../models/commentsModel')
const { Job } = require('../models/jobModel')




/**-------------------------------
 * @desc GET ALL Users
 * @route api/users
 * @method GET
 * @access private
---------------------------------*/
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    const { job, governorate, city } = req.query;


    const filter = {
        jobs: { $exists: true, $ne: [] },
        governorate: { $exists: true, $ne: '' },
        city: { $exists: true, $ne: '' }
    };


    if (job) {
        filter.jobs = job
    }

    if (governorate) {
        filter.governorate = governorate;
    }

    if (city) {
        filter.city = city
    }


    console.log(filter)
    const users = await User.find(filter)
        .populate({
            path: 'posts',
            select: 'image',
        })
        .select('-password')
        .skip(skip)
        .limit(limit);

    //  @TODO.populate('posts.title');

    const usersCount = await User.countDocuments(filter);


    res.status(200).json({ data: users, usersCount });
});

/**-------------------------------
 * @desc GET User Profile
 * @route api/users/:id
 * @method GET
 * @access private
---------------------------------*/
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json(user)
});

/**-------------------------------
 * @desc Update User Profile
 * @route api/users/:id
 * @method PUT
 * @access private
---------------------------------*/
module.exports.UpdateUserProfileCtrl = asyncHandler(async (req, res) => {

    const { error } = validateUpdateUser(req.body);
    if (error) {
        return res.status(404).json({ message: error.details[0].message });
    }

    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);

    }
    const updateUser = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username,
            password: req.body.password,
        }
    }, { new: true }).select("-password");

    return res.status(201).json({ message: 'User Updated Successfully', data: { user: updateUser } });

});


/**-------------------------------
 * @desc UploadProfilePhoto
 * @route api/users/:id
 * @method PUT
 * @access private
---------------------------------*/
module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No Image Uploaded!" });
        }
        const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
        const user = await User.findById(req.user.id);

        user.profilePhoto = {
            url: imagePath,
            publicId: req.file.public_id,
        };

        await user.save();

        res.status(200).json({
            message: "Profile Photo Updated Successfully!",
            data: { imagePath: user.profilePhoto }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating profile photo!" });
    }
});


/**-------------------------------
 * @desc Delete User Profile
 * @route api/users/:id
 * @method Delete
 * @access private
---------------------------------*/
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found!' });
    }


    //  delete user posts and comments
    await Post.deleteMany({ user: user._id });
    await Comment.deleteMany({ user: user._id });
    await Job.deleteMany({ user: user._id });

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User profile has been deleted successfully" });

})