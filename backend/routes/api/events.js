const express = require('express')
const { Group, Membership, GroupImage, User, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { requireAuth } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors, validateEvent, validateQuery } = require('../../utils/validation');

const router = express.Router();

// GET ALL EVENTS (REFACTOR LATER)
router.get('/', async (req, res) => {

    const newQueryErr = validateQuery(req.body)

    if (Object.keys(newQueryErr).length) {
        const err = new Error()
        err.message = "Bad Request"
        err.errors = newQueryErr
        return res.status(400).json(err)
    }

    let { page, size, name, type, startDate } = req.query
    page = parseInt(page)
    size = parseInt(size)

    if (Number.isNaN(page) || page > 10) page = 1
    if (Number.isNaN(size) || size > 20) size = 20

    const searchObj = {}
    if (name) searchObj.name = { [Op.substring]: name }
    if (type) searchObj.type = { [Op.in]: ['Online', 'In Person'] }
    if (startDate) searchObj.startDate = { startDate }


    const events = await Event.findAll(
        {
            where: searchObj,
            limit: size,
            offset: size * (page - 1),
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

    return res.json({ Events: events })
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

    console.log(event)

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

    const userId = req.user.id
    const { eventId } = req.params
    const { url, preview } = req.body

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    //check if user is attendee, host or co-host
    const attendance = await Attendance.findOne({
        where: { userId, eventId }
    })
    if (!attendance) return res.status(400).json({ message: "User is not attending this event" })
    const allowedAttArr = ['attendee', 'host', 'co-host']

    if (!allowedAttArr.includes(attendance.dataValues.status)) return res.status(400).json({ message: "Current User must be an attendee, host, or co-host of the event" })


    // create the new Image
    const newImage = await EventImage.create({ url, preview })
    newImage.save()
    const confirmedImage = {
        id: newImage.id,
        url: newImage.url,
        preview: newImage.preview
    }
    return res.json(confirmedImage)
})

// EDIT EVENT BY ID (UPDATE AUTH)
router.put('/:eventId', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { eventId } = req.params
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body

    const newEventErr = validateEvent(req.body)

    if (Object.keys(newEventErr).length) {
        const err = new Error()
        err.message = "Bad Request"
        err.errors = newEventErr
        return res.status(400).json(err)
    }

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const venue = await Venue.findByPk(venueId)
    if (!venue) return res.status(404).json({ message: "Venue couldn't be found" })


    // check if user is organizer or co-host
    const groupId = event.dataValues.groupId

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
    if (!group) return res.status(400).json({ message: "You are not an organizer or member" })

    if (group.dataValues.organizerId !== userId && group.dataValues.Organizer[0].Membership.status !== 'co-host') {
        return res.status(400).json({ message: "You are not an organizer or co-host" })
    }

    // const event = await Event.findByPk(eventId,
    //     {
    //         include: [{
    //             model: User,
    //             through: {
    //                 model: Attendance,
    //                 attributes: ['id', 'status']
    //             },
    //             where: { id: userId }
    //         }]
    //     })
    // if (!event) return res.status(400).json({ message: "You are not an organizer or member" })

    // console.log(event)
    // // if (event.dataValues.userId !== userId && event.dataValues.Users[0].Attendance.status !== 'co-host') {
    // //     return res.status(400).json({ message: "You are not an organizer or co-host" })
    // // }

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
    const userId = req.user.id
    const { eventId } = req.params

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    // check if user is organizer or co-host
    const groupId = event.dataValues.groupId
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
    if (!group) return res.status(400).json({ message: "You are not an organizer or member" })

    if (group.dataValues.organizerId !== userId && group.dataValues.Organizer[0].Membership.status !== 'co-host') {
        return res.status(400).json({ message: "You are not an organizer or co-host" })
    }

    await event.destroy()
    return res.json({ "message": "Successfully deleted" })
})

// GET ALL ATTENDEES OF EVENT BY ID (ADD AUTH)
router.get('/:eventId/attendees', async (req, res) => {
    const userId = req.user.id
    const { eventId } = req.params
    let organizer = false

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const groupId = event.dataValues.groupId
    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })
    if (group.dataValues.organizerId === userId) organizer = true

    const member = await Membership.findOne({
        where: { userId, groupId },
    })
    if (member.dataValues.status === "co-host") organizer = true

    let attendees = await User.findAll({
        include: [{
            model: Event,
            through: {
                model: Attendance,
                attributes: ['status']
            },
            where: { id: eventId }
        }]
    })

    if (organizer) {
        attendees.forEach(attendee => {
            attendee.dataValues.Attendance = attendee.dataValues.Events[0].Attendance
            delete attendee.dataValues.Events
            delete attendee.dataValues.username
        })
    } else {
        attendees.forEach(attendee => {
            attendee.dataValues.Attendance = attendee.dataValues.Events[0].Attendance
            delete attendee.dataValues.Events
            delete attendee.dataValues.username
        })
        attendees = attendees.filter(attendee => { return attendee.dataValues.Attendance.dataValues.status !== "pending" })
    }

    return res.json({ Attendees: attendees })

})

// REQUEST ATTENDANCE BY EVENT ID
router.post('/:eventId/attendance', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { eventId } = req.params

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const groupId = event.dataValues.groupId
    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })
    const member = await Membership.findOne({
        where: { userId, groupId },
    })
    if (!member) return res.status(404).json({ message: "User is not a member of the group" })

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

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const reqUserId = req.user.id
    const grouptest = await Group.findByPk(groupId)
    if (!grouptest) return res.status(404).json({ message: "Group couldn't be found" })

    const group = await Group.findByPk(groupId,
        {
            include: [{
                model: User,
                as: 'Organizer',
                through: {
                    model: Membership,
                    attributes: ['id', 'status']
                },
                where: { id: reqUserId }
            }]
        })
    if (!group) return res.status(404).json({ message: "You are not an organizer or member" })

    if (group.dataValues.organizerId !== reqUserId && group.dataValues.Organizer[0].Membership.status !== 'co-host') {
        return res.status(404).json({ message: "You are not an organizer or co-host" })
    }


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
    if (!attendee) return res.status(404).json({ message: "ttendance between the user and the event does not exist" })

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
