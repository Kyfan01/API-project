const express = require('express')
const { Group, Membership, GroupImage, User, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { requireAuth, isCoHost, restoreUser } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors, validateEvent, validateQuery } = require('../../utils/validation');
const { Op } = require('sequelize');

const router = express.Router();

// GET ALL EVENTS
router.get('/', async (req, res) => {

    let { page, size, name, type, startDate } = req.query

    if (!Number.isNaN(page) || !Number.isNaN(size)) return res.status(400).json({ message: "column 'nan' does not exist" })

    const newQueryErr = validateQuery(req.query)

    if (Object.keys(newQueryErr).length) {
        const err = new Error()
        err.message = "Bad Request"
        err.errors = newQueryErr
        return res.status(400).json(err)
    }

    if (!page) page = 1
    if (!size) size = 20

    page = parseInt(page)
    size = parseInt(size)

    if (page > 10) page = 1
    if (size > 20) size = 20


    const searchObj = {}
    if (name) searchObj.name = { [Op.substring]: name }
    if (type) searchObj.type = type
    if (startDate) searchObj.startDate = startDate

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
                },
                {
                    model: User,
                    through: {
                        model: Attendance,
                        attributes: []
                    }
                },
                {
                    model: EventImage,
                    attributes: ['id', 'url', 'preview']
                }],
            attributes:
            {
                exclude: ['createdAt', 'updatedAt', 'capacity', 'price'] //change to api, including description for front end
            }
        })

    let eventArr = []
    events.forEach(async event => { eventArr.push(event.toJSON()) })

    eventArr.forEach(event => {
        event.numAttending = event.Users.length
        delete event.Users

        let previewImage = event.EventImages.filter(image => { return image.preview === true })
        if (!previewImage.length) event.previewImage = 'default preview image url'
        else event.previewImage = previewImage[0].url

        delete event.EventImages
    })
    return res.json({ Events: eventArr })
})

// GET DETAIL OF EVENT BY ID
router.get('/:eventId', async (req, res) => {
    const { eventId } = req.params

    let event = await Event.findByPk(eventId, {
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
            },
            {
                model: User,
                attributes: ['id']
            }],
        attributes:
        {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    event = event.toJSON()
    event.numAttending = event.Users.length
    delete event.Users

    return res.json(event)
})

// ADD IMAGE TO EVENT BY ID (USER MUST BE AUTHORIZED)
router.post('/:eventId/images', requireAuth, async (req, res) => {

    const userId = req.user.id
    const { eventId } = req.params
    const { url, preview } = req.body

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const groupId = event.groupId

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })


    //check if user is attendee, host or co-host
    const attendance = await Attendance.findOne({
        where: { userId, eventId, status: 'attending' }
    })

    if (attendance || await isCoHost(group, userId) || group.organizerId === userId) {
        const newImage = await EventImage.create({ eventId: parseInt(eventId), url, preview })
        await newImage.save()
        const confirmedImage = {
            id: newImage.id,
            url: newImage.url,
            preview: newImage.preview
        }
        return res.json(confirmedImage)

    }

    return res.status(403).json({ message: "Current User must be an attendee, host, or co-host of the event" })
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

    let event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const venue = await Venue.findByPk(venueId)
    if (!venue) return res.status(404).json({ message: "Venue couldn't be found" })

    const groupId = event.groupId

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    if (await isCoHost(group, userId) || group.organizerId === userId) {
        event.venueId = venueId,
            event.name = name,
            event.type = type,
            event.capacity = capacity,
            event.price = parseFloat(price),
            event.description = description,
            event.startDate = startDate,
            event.endDate = endDate

        await event.save()

        event = event.toJSON()

        delete event.updatedAt
        delete event.createdAt

        return res.json(event)
    }

    return res.status(403).json({ message: "You are not the organizer or co-host" })
})

// DELETE EVENT BY ID (NEED AUTH)
router.delete('/:eventId', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { eventId } = req.params

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const groupId = event.groupId

    const group = await Group.findByPk(groupId)

    if (await isCoHost(group, userId) || group.organizerId === userId) {
        await event.destroy()
        return res.json({ "message": "Successfully deleted" })
    }

    return res.status(403).json({ message: "You are not the organizer or co-host" })
})

// GET ALL ATTENDEES OF EVENT BY ID (ADD AUTH)
router.get('/:eventId/attendees', async (req, res) => {
    const userId = req.user.id
    const { eventId } = req.params

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const groupId = event.groupId
    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    if (await isCoHost(group, userId) || group.organizerId == userId) {
        let attendees = await event.getUsers({
            through: {
                model: Attendance
            },
            joinTableAttributes: ['status'],
            attributes: {
                exclude: ['username']
            }
        })

        return res.json({ Attendees: attendees })
    }

    let attendees = await event.getUsers({
        through: {
            model: Attendance,
            where: {
                status: { [Op.in]: ['attending', 'waitlist'] }
            }
        },
        joinTableAttributes: ['status'],
        attributes: {
            exclude: ['username']
        }
    })

    return res.json({ Attendees: attendees })
})

// REQUEST ATTENDANCE BY EVENT ID
router.post('/:eventId/attendance', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { eventId } = req.params

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const groupId = event.groupId
    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })


    const member = await Membership.findOne({
        where: { userId, groupId },
    })
    if (!member) return res.status(404).json({ message: "User is not a member of the group" })
    if (member.status === 'pending') return res.status(403).json({ message: "Forbidden" })

    if (member.groupId !== event.groupId) return res.status(403).json({ message: "Forbidden" })

    let attendance = await Attendance.findOne({
        where: { eventId, userId }
    })

    if (attendance) {
        attendance = attendance.toJSON()
        if (attendance.status === 'attending') return res.status(403).json({ message: "User is already an attendee of the event" })
        else return res.status(403).json({ message: "Attendance has already been requested" })
    }

    await Attendance.create({ userId, eventId: parseInt(eventId), status: "pending" })

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
    const reqUserId = req.user.id

    if (status === "pending") return res.status(400).json({
        message: "Bad Request",
        errors: { status: "Cannot change an attendance status to pending" }
    })

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const user = await User.findByPk(userId)
    if (!user) return res.status(404).json({ message: "User couldn't be found" })


    const groupId = event.groupId
    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })


    let attendance = await Attendance.findOne({
        where: { userId, eventId },
        attributes: ['id', 'userId', 'eventId', 'status']
    })
    if (!attendance) return res.status(404).json({ message: "Attendance between the user and the event does not exist" })

    if (await isCoHost(group, reqUserId) || group.organizerId == reqUserId) {
        attendance.status = status
        await attendance.save()

        attendance = attendance.toJSON()

        delete attendance.updatedAt
        delete attendance.createdAt

        return res.json(attendance)
    }

    return res.status(403).json({ message: "You do not have permission to make this change" })
})

// DELETE ATTENDANCE TO EVENT BY ID (NEED AUTH)
router.delete('/:eventId/attendance/:userId', requireAuth, async (req, res) => {
    const reqUserId = req.user.id
    const { eventId, userId } = req.params

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const user = await User.findByPk(userId)
    if (!user) return res.status(404).json({ message: "User couldn't be found" })

    const groupId = event.groupId
    const group = await Group.findByPk(groupId)

    const attendance = await Attendance.findOne({
        where: { userId, eventId }
    })
    if (!attendance) return res.status(404).json({ message: "Attendance does not exist for this user" })


    if (group.organizerId == reqUserId || reqUserId == userId) {
        await attendance.destroy()
        return res.json({ message: "Successfully deleted attendance from event" })
    }

    return res.status(403).json({ message: "You do not have permission to delete this attendance" })
})


module.exports = router;
