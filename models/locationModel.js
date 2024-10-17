const Joi = require('joi');
const mongoose = require('mongoose');

const LocationSchema =  mongoose.Schema ({
    governorate :{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    city: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    }
});
 const Location = mongoose.model('Location', LocationSchema);

function validateLocation(obj){
    const schema = Joi.object({
        governorate: Joi.string().min(3).max(50).required(),
        city: Joi.string().min(3).max(50).required(),
        
    });
    return schema.validate(obj);
}

module.exports = {
    Location,
    validateLocation,
 };

