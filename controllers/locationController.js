const asyncHandler = require('express-async-handler');
const { Location, validateLocation } = require('../models/locationModel');
// const { User } = require('../models/userModel');

/**-------------------------------
 * @desc Add a new location
 * @route api/locations/add-location
 * @method post
 * @access private
 ---------------------------------*/
module.exports.addLocationCtrl = asyncHandler(async (req, res) => {
    const { error } = validateLocation(req.body);
    if (error) {
        return res.status(400).json({ msg: error.details[0].message });
    }

    // let governorate  = await Location.findOne({ governorate: req.body.governorate });
    // if (governorate) {
    //     return res.status(400).json({ message: ' This governorate Already Exists' });
    // }
    // let city  = await Location.findOne({ city: req.body.city });
    // if (city) {
    //     return res.status(400).json({ message: ' This city Already Exists' });
    // }

   const  location = new Location(req.body);


    await location.save();

    res.status(201).json({ data: { location } });
});


/**-------------------------------
 * @desc get All locations
 * @route api/locations/
 * @method GET
 * @access private
 ---------------------------------*/
module.exports.getAllLocationsCtrl = asyncHandler(async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const locations = await Location.find({
        $or: [
            { city: { $exists: true, $ne: '' } },
            { governorate: { $exists: true, $ne: '' } },
        ]
    }).skip(skip).limit(limit);

    res.status(200).json({ data: { locations } });
});

/**-------------------------------
 * @desc get a location
 * @route api/locations/:id
 * @method GET
 * @access private
 ---------------------------------*/
module.exports.getSingleLocationCtrl = asyncHandler(async (req, res) => {
    const Location = await Location.findById({ id: req.params.id });
    if (!location) {
        return res.status(404).json({ msg: 'Location not found' });
    }
    res.status(200).json({ data: { location } });


});

/**-------------------------------
* @desc update a location
* @route api/locations/:id
* @method PUT
* @access private
*  ---------------------------------*/
module.exports.updateSingleLocationCtrl = asyncHandler(async (req, res) => {
    const { error } = validateLocation(req.body);
    if (error) {
        return res.status(400).json({ msg: error.details[0].message });
    }

    // let location = await Location.findOne({ location: req.body.location });
    // if (location) {
    //     return res.status(400).json({ message: ' This location Already Exists' });
    // }

     location = await Location.findByIdAndUpdate(req.params.id, {
        $set: {
            governorate: req.body.governorate,
            city: req.body.city
        }
    }, { new: true });

    res.status(200).json({ message: "Location Updated Successfully ", data: { location } });


});


/**-------------------------------
* @desc Delete a location
* @route api/locations/:id
* @method DELETE
* @access private
*  ---------------------------------*/
module.exports.deleteLocationCtrl = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.id);
    if (!location) {
        res.status(404).json({ message: "Location Deleted Successfully" });
    }
    await Location.findByIdAndDelete(req.params.id);

    res.status(404).json({ message: "Location Deleted Successfully" });
})
