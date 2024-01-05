const express = require('express')
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');
const { requireAuth } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors, validateVenue } = require('../../utils/validation');

const router = express.Router();


//EDIT VENUE BY ID (CHECK IF USER IS ORG OR HOST)
router.put('/:venueId', requireAuth, async (req, res) => {

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

    const groupId = venue.dataValues.groupId

    const group = await Group.findByPk(groupId,
        {
            include: [{
                model: User,
                as: 'Organizer',
                through: {
                    model: Membership,
                    attributes: ['id', 'status']
                },
                where: { id: userId }
            }]
        })
    if (!group) return res.status(404).json({ message: "You are not an organizer or member" })

    if (group.dataValues.organizerId !== userId && group.dataValues.Organizer[0].Membership.status !== 'co-host') {
        return res.status(404).json({ message: "You are not an organizer or co-host" })
    }


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
