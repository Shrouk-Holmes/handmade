const mongoose= require('mongoose');
const Joi = require ('joi');


const postSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true,
        minlenghth: 2,
        maxlenghth: 200

    },  description:{
        type: String,
        required: true,
        trim: true,
        minlenghth: 2,

    },user:{ 
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    }, job:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required: true,
    },
    image:{
       type: Object,
       default:{
        url :"",
        pubicId : null,
       }
    }
},{
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
  }
);

postSchema.virtual("comments",{
    ref:"Comment",
    foreignField:"postId",
    localField:"_id"
})
const Post = mongoose.model('Post',postSchema);

function validateCreatePost(obj){
    const schema = Joi.object({
        title : Joi.string().trim().min(2).max(200).required(),
        description : Joi.string().trim().min(2).required(),
        job: Joi.string().trim().required()
    })
    return schema.validate(obj)
}


function validateUpdatePost(obj){
    const schema = Joi.object({
        title : Joi.string().trim().min(2).max(200),
        description : Joi.string().trim().min(8),
        job: Joi.string().trim()
    })
    return schema.validate(obj)
}


module.exports ={
    Post,validateCreatePost,validateUpdatePost
}