const { validationResult } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        const errors = {};
        validationErrors
            .array()
            .forEach(error => errors[error.path] = error.msg);

        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request.";
        next(err);
    }
    next();
};

const validateGroup = body => {
    const { name, about, type, private, city, state } = body
    const errObj = {}
    const typeArr = ['Online', 'In person']

    if (name && name.length > 60) errObj.name = "Name must be 60 characters or less"
    if (about && about.length < 50) errObj.about = "About must be 50 characters or more"
    if (type && !typeArr.includes(type)) errObj.type = "Type must be 'Online' or 'In person'"
    if (private && typeof private !== 'boolean') errObj.private = "Private must be a boolean"
    if (!city) errObj.city = "City is required"
    if (!state) errObj.state = "State is required"

    return errObj
}

const validateVenue = body => {
    const { address, city, state, lat, lng } = body
    const errObj = {}

    if (!address) errObj.address = "Street address is required"
    if (!city) errObj.city = "City is required"
    if (!state) errObj.state = "State is required"
    if (lat && lat < -90 || lat > 90) errObj.lat = "Latitude must be within -90 and 90"
    if (lng && lng < -180 || lng > 180) errObj.lng = "Longitude must be within -180 and 180"

    return errObj
}

const validateEvent = body => {
    const { name, type, capacity, price, description, startDate, endDate } = body
    const errObj = {}
    const typeArr = ['Online', 'In person']
    const currentTime = new Date().getTime()

    const startTime = new Date(startDate).getTime()
    const endTime = new Date(endDate).getTime()

    if (name && name.length < 4) errObj.name = "Name must be at least 5 characters"
    if (type && !typeArr.includes(type)) errObj.type = "Type must be 'Online' or 'In person'"
    if (capacity && typeof capacity !== 'number' || capacity < 1) errObj.capacity = "Capacty must be an integer greater than 0"
    if (price && typeof price !== 'number' || price < 0) errObj.price = "Price is invalid"
    if (!description) errObj.description = "Description is required"
    if (startDate && startTime < currentTime) errObj.startDate = "Start date must be in the future"
    if (endDate && endTime < startTime) errObj.endDate = "End date is less than start date"

    return errObj
}

const validateQuery = query => {

    //console.log(query)
    const { page, size, name, type, startDate } = query
    const errObj = {}
    const typeArr = ['Online', 'In person']
    const currentTime = new Date().getTime()

    const startTime = new Date(startDate).getTime()

    if (page != null && page < 1) errObj.page = "Page must be greater than or equal to 1"
    if (size != null && size < 1) errObj.size = "Size must be greater than or equal to 1"
    if (name && typeof name !== 'string') errObj.name = "Name must be a string"
    if (type && !typeArr.includes(type)) errObj.type = "Type must be 'Online' or 'In person'"
    if (startDate && startTime < currentTime) errObj.startDate = "Start date must be in the future"

    return errObj
}

module.exports = {
    handleValidationErrors,
    validateGroup,
    validateVenue,
    validateEvent,
    validateQuery
};
