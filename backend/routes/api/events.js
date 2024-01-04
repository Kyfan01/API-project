const express = require('express')
const { Group, Membership, GroupImage, User, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { requireAuth } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// GET ALL EVENTS (might need to change attending based on status)
router.get('/', async (req, res) => {
    const events = await Event.findAll(
        {
            include: [
                {
                    model: Group,
                    attributes: ['id', 'name', 'city', 'state']
                },
                {
                    model: Venue,
                    attributes: ['id', 'city', 'state']
                }],
            attributes:
            {
                exclude: ['createdAt', 'updatedAt']
            }
        })

    const eventImages = await EventImage.findAll({
        attributes: ['eventId', 'preview', 'url']
    })

    const attendances = await Attendance.findAll({
        attributes: ['userId', 'eventId', 'status']
    })

    events.forEach(event => {
        let previewImage = eventImages.find(image => (image.eventId === event.id && image.preview))

        if (previewImage) event.dataValues.previewImage = previewImage.url
        else event.dataValues.previewImage = "default event image url"


        let numAttending = attendances.filter(attendee => attendee.eventId === event.id).length
        event.dataValues.numAttending = numAttending
    })

    return res.json(events)
})

// GET DETAIL OF EVENT BY ID
router.get('/:eventId', async (req, res) => {
    const { eventId } = req.params

    const event = await Event.findByPk(eventId, {
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'private', 'city', 'state']
            },
            {
                model: Venue,
                attributes: ['id', 'address', 'city', 'state', 'lat', 'lng']
            },
            {
                model: EventImage,
                attributes: ['id', 'url', 'preview']
            }],
        attributes:
        {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const attendances = await Attendance.findAll({
        where: { eventId },
        attributes: ['userId', 'eventId', 'status']
    })

    let numAttending = attendances.filter(attendee => attendee.eventId === event.id).length
    event.dataValues.numAttending = numAttending

    return res.json(event)


})


module.exports = router;
