const express = require('express')
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');
const { requireAuth } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();


//EDIT VENUE BY ID (CHECK IF USER IS ORG OR HOST)
router.put('/:venueId', requireAuth, async (req, res) => {

    const { address, city, state, lat, lng } = req.body
    const { venueId } = req.params

    const venue = await Venue.findByPk(venueId)

    if (!venue) return res.status(404).json({ message: "Venue couldn't be found" })

    venue.address = address,
        venue.city = city,
        venue.state = state,
        venue.lat = lat,
        venue.lng = lng

    await venue.save()

    delete venue.dataValues.updatedAt
    delete venue.dataValues.createdAt

    return res.json(venue)
})


module.exports = router;
