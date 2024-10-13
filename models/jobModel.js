const mongoose= require('mongoose');
const Joi = require ('joi');

const jobSchema = new mongoose.Schema({
    title :{
        type:String,
        required:true,
        trim:true
    },    
},{timestamps:true})

const Job = mongoose.model('Job', jobSchema);
