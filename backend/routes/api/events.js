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

// ADD IMAGE TO EVENT BY ID (USER MUST BE AUTHORIZED)
router.post('/:eventId/images', requireAuth, async (req, res) => {

    const { eventId } = req.params
    const { url, preview } = req.body

    const event = await Event.findByPk(eventId)

    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const newImage = await EventImage.create({ url, preview })
    const confirmedImage = {
        id: newImage.id,
        url: newImage.url,
        preview: newImage.preview
    }
    return res.json(confirmedImage)
})

// EDIT EVENT BY ID (UPDATE AUTH)
router.put('/:eventId', requireAuth, async (req, res) => {
    const { eventId } = req.params
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body

    const event = await Event.findByPk(eventId)

    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    event.venueId = venueId,
        event.name = name,
        event.type = type,
        event.capacity = capacity,
        event.price = price,
        event.description = description,
        event.startDate = startDate,
        event.endDate = endDate

    await event.save()

    delete event.dataValues.updatedAt
    delete event.dataValues.createdAt

    return res.json(event)
})

// DELETE EVENT BY ID (NEED AUTH)
router.delete('/:eventId', requireAuth, async (req, res) => {
    const { eventId } = req.params

    const event = await Event.findByPk(eventId)

    if (event) {
        await event.destroy()
        return res.json({ "message": "Successfully deleted" })
    }
    else return res.status(404).json({ message: "Event couldn't be found" })
})

// GET ALL ATTENDEES OF EVENT BY ID (ADD AUTH)
router.get('/:eventId/attendees', async (req, res) => {
    const userId = req.user.id
    const { eventId } = req.params

    const event = Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const attendees = await User.findAll({
        include: [{
            model: Event,
            through: {
                model: Attendance,
                attributes: ['status']
            },
            where: { id: eventId }
        }]
    })

    attendees.forEach(attendee => {
        attendee.dataValues.Attendance = attendee.dataValues.Events[0].Attendance
        delete attendee.dataValues.Events
        delete attendee.dataValues.username
    })

    return res.json({ Attendees: attendees })

})

// REQUEST ATTENDANCE BY EVENT ID
router.post('/:eventId/attendance', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { eventId } = req.params

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const attendances = await Attendance.findAll({
        where: { eventId }
    })

    attendances.forEach(attendee => {
        if (attendee.userId === userId && attendee.status === "pending") {
            return res.status(400).json({ message: "Attendance has already been requested" })
        }
        else if (attendee.userId === userId) {
            return res.status(400).json({ message: "User is already an attendee of the event" })
        }
    })

    const newAtten = Attendance.build({
        userId, eventId, status: "pending"
    })

    newAtten.save()

    const newAttendRes = {
        userId,
        status: "pending"
    }

    return res.json(newAttendRes)

})

// CHANGE STATUS OF ATTENDANCE FOR EVENT BY ID (CHANGE AUTHS)
router.put('/:eventId/attendance', requireAuth, async (req, res) => {
    const { eventId } = req.params
    const { userId, status } = req.body

    if (status === "pending") return res.status(400).json({
        message: "Bad Request",
        errors: {
            status: "Cannot change an attendance status to pending"
        }
    })

    const user = await User.findByPk(userId)
    if (!user) return res.status(404).json({ message: "User couldn't be found" })

    const attendee = await Attendance.findOne({
        where: { userId, eventId },
        attributes: ['id', 'userId', 'eventId', 'status']
    })
    if (!attendee) return res.status(404).json({ message: "Event couldn't be found" })

    attendee.status = status
    attendee.save()

    delete attendee.dataValues.updatedAt
    delete attendee.dataValues.createdAt

    return res.json(attendee)

})

// DELETE ATTENDANCE TO EVENT BY ID (NEED AUTH)
router.delete('/:eventId/attendance/:userId', requireAuth, async (req, res) => {
    const reqUserId = req.user.id
    const { eventId, userId } = req.params

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const user = await User.findByPk(userId)
    if (!user) return res.status(404).json({ message: "User couldn't be found" })

    const attendance = await Attendance.findOne({
        where: { userId, eventId }
    })
    if (!attendance) {
        return res.status(404).json({ message: "Attendance does not exist for this user" })
    } else {
        await attendance.destroy()
        return res.json({ message: "Successfully deleted attendance from event" })
    }
})


module.exports = router;
