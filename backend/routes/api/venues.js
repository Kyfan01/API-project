const express = require('express')
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');
const { requireAuth, restoreUser, isCoHost } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors, validateVenue } = require('../../utils/validation');

const router = express.Router();


//EDIT VENUE BY ID (CHECK IF USER IS ORG OR HOST)
router.put('/:venueId', [restoreUser, requireAuth], async (req, res) => {

    // validate inputs
    const newVenueErr = validateVenue(req.body)

    if (Object.keys(newVenueErr).length) {
        const err = new Error()
        err.message = "Bad Request"
        err.errors = newVenueErr
        return res.status(400).json(err)
    }

    const { address, city, state, lat, lng } = req.body
    const { venueId } = req.params
    const userId = req.user.id

    const venue = await Venue.findByPk(venueId)
    if (!venue) return res.status(404).json({ message: "Venue couldn't be found" })

    const groupId = venue.groupId

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    if (await isCoHost(group, userId) || group.organizerId === userId) {
        venue.address = address,
            venue.city = city,
            venue.state = state,
            venue.lat = lat,
            venue.lng = lng

        await venue.save()

        delete venue.dataValues.updatedAt
        delete venue.dataValues.createdAt

        return res.json(venue)
    }

    return res.status(403).json({ message: "You are not the organizer or co-host" })
})


module.exports = router;
