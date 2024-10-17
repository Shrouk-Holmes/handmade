const asyncHandler = require('express-async-handler');
const { Comment, validateCreateComment, validateUpdaeComment } = require('../models/commentsModel');
const { User } = require('../models/userModel');



/**---------------------------------
* @desc Create new comment
* @route api/comments
* @method POST
* @access private (only Logged in user)
-----------------------------------*/
module.exports.CreateCommentCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateComment(req.body);
    if (error) {
        return res.status(404).json({ message: error.details[0].message });
    }
    const profile = await User.findById(req.user.id);

    const comment = await Comment.create({
        postId: req.body.postId,
        text: req.body.text,
        user: req.user.id,
        username: profile.username

    })
    res.status(201).json(comment);
})


/**---------------------------------
* @desc get all comment
* @route api/comments
* @method Get
* @access private (only admin )
-----------------------------------*/
module.exports.getAllCommentCtrl = asyncHandler(async (req, res) => {
    const comments = await Comment.find({ user: req.user.id }).populate("user", "-password");
    res.status(200).json(comments);
}) 

/**---------------------------------
* @desc delete comment
* @route api/comments/:id
* @method Delete
* @access private (only admin or owner of the comment )
-----------------------------------*/
module.exports.deleteCommentCtrl = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
        return res.status(404).json({ message: "comment not found" })
    }
    if (req.user.isAdmin || req.user.id === comment.user.toString()) {
        await Comment.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: "Comment has been deleted" })
    } else {
        res.status(403).json({ message: "access denied" })
    }
})


/**---------------------------------
* @desc Update comment
* @route api/comments/:id
* @method Put
* @access private (only owner of the comment)
-----------------------------------*/
module.exports.UpdateCommentCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdaeComment(req.body);
    if (error) {
        return res.status(404).json({ message: error.details[0].message });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return res.status(404).json({ message: "comment not found" });
    }
    
    if (req.user.id !== comment.user.toString()) {
        return res.status(403).json({ message: "access denied only user himself can edit his comment " });
    }

    const updatedComment = await Comment.findByIdAndUpdate(req.params.id, {
        $set: {
            text: req.body.text,
        }
    }, { new: true });

res.status(200).json(updatedComment);

});