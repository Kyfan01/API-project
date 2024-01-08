const express = require('express')
const { Group, Membership, GroupImage, User, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { requireAuth, restoreUser, isCoHost } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors, validateGroup, validateVenue, validateEvent } = require('../../utils/validation');
const { Op } = require('sequelize');

const router = express.Router();

// GET ALL GROUPS (come back and fix includes)
router.get('/', async (req, res) => {
    const groups = await Group.findAll({
        include: [{
            model: GroupImage,
            attributes: ['id', 'url', 'preview']
        },
        {
            model: User,
            attributes: ['id']
        }]
    })



    let groupArr = []
    groups.forEach(async group => { groupArr.push(group.toJSON()) })

    groupArr.forEach(group => {

        group.numMembers = group.Users.length
        delete group.Users

        let previewImage = group.GroupImages.filter(image => { return image.preview === true })
        if (!previewImage.length) group.previewImage = 'default preview image url'
        else group.previewImage = previewImage[0].url

        delete group.GroupImages
    })

    return res.json({ Groups: groupArr })
})

// GET ALL GROUPS JOINED BY CURRENT USER
router.get('/current', [restoreUser, requireAuth], async (req, res) => {
    const userId = req.user.id

    const members = await Membership.findAll()

    //find all groups joined by user
    const groups = await Group.findAll({
        include: [{
            model: User,
            through: {
                model: Membership,
                where: { id: userId }
            },
            attributes: [],
        },
        {
            model: GroupImage,
            attributes: ['id', 'url', 'preview']
        }]
    })

    let groupArr = []
    groups.forEach(group => { groupArr.push(group.toJSON()) })

    groupArr.forEach(group => {
        // find the number of members for each group by searching array of all members
        let numMembers = members.filter(member => member.groupId === group.id).length
        group.numMembers = numMembers

        // find and set preview image if it exists for each group, set default if it does not exist
        let previewImage = group.GroupImages.filter(image => { return image.preview === true })
        if (!previewImage.length) group.previewImage = 'default preview image url'
        else group.previewImage = previewImage[0].url

        delete group.GroupImages
    })
    return res.json({ Groups: groupArr })
})

// GET DETAILS OF GROUP BY ID
router.get('/:groupId', async (req, res) => {
    const { groupId } = req.params

    let group = await Group.findByPk(groupId, {
        include: [
            {
                model: GroupImage,
                attributes: ['id', 'url', 'preview']
            },
            {
                model: User
            },
            {
                model: Venue
            }
        ]
    })

    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    // let groupMemberArr = await group.getUsers()
    // let numMembers = groupMemberArr.length

    let organizer = await group.getUser()

    group = group.toJSON()

    group.numMembers = group.Users.length
    group.Organizer = organizer

    delete group.Users

    return res.json(group)
})

// CREATE NEW GROUP
router.post('/', [restoreUser, requireAuth], async (req, res) => {
    const userId = req.user.id

    const newGroupErr = validateGroup(req.body)

    if (Object.keys(newGroupErr).length) {
        const err = new Error()
        err.message = "Bad Request"
        err.errors = newGroupErr
        return res.status(400).json(err)
    }

    const { name, about, type, private, city, state } = req.body
    const group = await Group.create({ organizerId: userId, name, about, type, private, city, state })

    return res.status(201).json(group)
})

// ADD IMAGE TO GROUP BY GROUP ID
router.post('/:groupId/images', [restoreUser, requireAuth], async (req, res) => {

    const userId = req.user.id
    const { groupId } = req.params
    const { url, preview } = req.body

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    else if (group.organizerId === userId) {

        const newImage = await GroupImage.create({ groupId: parseInt(groupId), url, preview })

        const confirmedImage = {
            id: newImage.id,
            url: newImage.url,
            preview: newImage.preview
        }

        return res.json(confirmedImage)
    } else return res.status(403).json({ message: "You are not the organizer for this group" })
})

// EDIT GROUP BY ID (REFACTOR LATER)
router.put('/:groupId', [restoreUser, requireAuth], async (req, res) => {

    const newGroupErr = validateGroup(req.body)

    if (Object.keys(newGroupErr).length) {
        const err = new Error()
        err.message = "Bad Request"
        err.errors = newGroupErr
        return res.status(400).json(err)
    }

    const userId = req.user.id
    const { groupId } = req.params
    const { name, about, type, private, city, state } = req.body

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    if (group.organizerId !== userId) return res.status(403).json({ message: "You are not the organizer of this group" })

    group.name = name,
        group.about = about,
        group.type = type,
        group.private = private,
        group.city = city,
        group.state = state

    await group.save()

    return res.json(group)
})

// DELETE GROUP (check what proper auth means)
router.delete('/:groupId', [restoreUser, requireAuth], async (req, res) => {

    const userId = req.user.id
    const { groupId } = req.params

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })
    if (group.organizerId !== userId) return res.status(403).json({ message: "You are not the organizer of this group" })


    await group.destroy()
    return res.json({ message: "Successfully deleted" })
})


// GET ALL VENUES FOR GROUP BY ID (check if user is org or host) REFACTOR TO JUST FIND ALL WHERE GROUPID
router.get('/:groupId/venues', [restoreUser, requireAuth], async (req, res) => {

    const userId = req.user.id
    const { groupId } = req.params

    // find specific group
    const group = await Group.findByPk(groupId, {
        include: {
            model: Venue,
            attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng']
        },
    })
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    if (await isCoHost(group, userId) || group.organizerId === userId) return res.json({ Venues: group.Venues })

    return res.status(403).json({ message: "You are not the organizer or co-host" })
})


// CREATE NEW VENUE FOR GROUP (check if user is org or host)
router.post('/:groupId/venues', requireAuth, async (req, res) => {

    // validate inputs
    const newVenueErr = validateVenue(req.body)

    if (Object.keys(newVenueErr).length) {
        const err = new Error()
        err.message = "Bad Request"
        err.errors = newVenueErr
        return res.status(400).json(err)
    }

    const userId = req.user.id
    const { groupId } = req.params

    const { address, city, state, lat, lng } = req.body

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    if (await isCoHost(group, userId) || group.organizerId === userId) {
        // create venue, add the group id
        const venue = await Venue.create({ groupId: parseInt(groupId), address, city, state, lat, lng })

        // remove updatedAt, createAt key/values
        delete venue.dataValues.updatedAt
        delete venue.dataValues.createdAt

        return res.status(201).json(venue)
    }

    return res.status(403).json({ message: "You are not the organizer or co-host" })
})

// GET ALL EVENTS OF GROUP BY ID
router.get('/:groupId/events', async (req, res) => {
    const { groupId } = req.params

    const groupTest = await Group.findByPk(groupId)
    if (!groupTest) return res.status(404).json({ message: "Group couldn't be found" })

    const events = await Event.findAll({
        where: { groupId },
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
            exclude: ['createdAt', 'updatedAt', 'description', 'capacity', 'price']
        }
    })

    if (!events.length) return res.status(404).json({ message: "There are no events for this group" })

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


// CREATE EVENT FOR GROUP BY ID (CHECK IF USER IS ORG OR HOST)
router.post('/:groupId/events', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const userId = req.user.id

    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body

    // Validate the event body
    const newEventErr = validateEvent(req.body)

    if (Object.keys(newEventErr).length) {
        const err = new Error()
        err.message = "Bad Request"
        err.errors = newEventErr
        return res.status(400).json(err)
    }

    const venue = await Venue.findByPk(venueId)
    if (!venue) return res.status(404).json({ message: "Venue couldn't be found" })


    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    if (await isCoHost(group, userId) || group.organizerId === userId) {
        const event = await Event.create({ groupId: parseInt(groupId), venueId, name, type, capacity, price, description, startDate, endDate })

        delete event.dataValues.updatedAt
        delete event.dataValues.createdAt

        return res.json(event)
    }

    return res.status(403).json({ message: "You are not the organizer or co-host" })
})

// GET ALL MEMBERS OF GROUP BY ID
router.get('/:groupId/members', async (req, res) => {

    const { groupId } = req.params
    const userId = req.user.id

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })


    if (await isCoHost(group, userId) || group.organizerId === userId) {
        let members = await group.getUsers({
            attributes: {
                exclude: ['username']
            },
            joinTableAttributes: ['status']
        })
        return res.json({ Members: members })
    }

    let members = await group.getUsers({
        through: {
            model: Membership,
            where: {
                status: {
                    [Op.in]: ['co-host', 'member']
                }
            }
        },
        attributes: {
            exclude: ['username']
        },
        joinTableAttributes: ['status']
    })

    return res.json({ Members: members })
})

// REQUEST NEW MEMBERSHIP FOR GROUP BY ID
router.post('/:groupId/membership', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { groupId } = req.params

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    let membership = await Membership.findOne({
        where: { groupId, userId }
    })

    if (membership) {
        membership = membership.toJSON()
        if (membership.status === "pending") return res.status(400).json({ message: "Membership has already been requested" })
        else return res.status(400).json({ message: "User is already a member of the group" })
    }

    await Membership.create({ userId, groupId: parseInt(groupId), status: "pending" })

    const newMemberRes = {
        memberId: userId,
        status: "pending"
    }

    return res.json(newMemberRes)
})

// CHANGE STATUS OF MEMBER TO GROUP BY ID (MIGHT NEED TO CHANGE WHAT MEMBER MEANS)
router.put('/:groupId/membership', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const { memberId, status } = req.body
    const userId = req.user.id

    if (status === "pending") res.status(400).json({
        message: "Bad Request",
        errors: { status: "cannot change a membership status to pending" }
    })

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    const user = await User.findByPk(memberId)
    if (!user) return res.status(404).json({ message: "User couldn't be found" })

    let membership = await Membership.findOne({
        where: { userId: memberId, groupId }
    })
    if (!membership) { return res.status(404).json({ message: "Membership between the user and the group does not exist" }) }

    if ((await isCoHost(group, userId) || group.organizerId == userId) && status === 'member') {
        //membership = membership.toJSON()
        membership.status = status
        await membership.save()

        const membershipRes = {
            id: membership.id,
            groupId: parseInt(groupId),
            memberId,
            status
        }

        return res.json(membershipRes)
    } else if (group.organizerId == userId && status === 'co-host') {
        //membership = membership.toJSON()
        membership.status = status
        await membership.save()

        const membershipRes = {
            id: membership.id,
            groupId: parseInt(groupId),
            memberId,
            status
        }

        return res.json(membershipRes)
    } else return res.status(403).json({ message: "You do not have permission to make this change" })
})

// DELETE MEMBERSHIP TO GROUP BY ID (MIGHT NEED TO CHANGE WHAT MEMBER MEANS)
router.delete('/:groupId/membership/:memberId', requireAuth, async (req, res) => {
    const { groupId, memberId } = req.params
    const userId = req.user.id

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    const user = await User.findByPk(memberId)
    if (!user) return res.status(404).json({ message: "User couldn't be found" })

    const userMembership = await Membership.findOne({
        where: { userId, groupId }
    })

    const delMembership = await Membership.findOne({
        where: { userId: memberId, groupId }
    })
    if (!delMembership) return res.status(404).json({ message: "Membership does not exist for this User" })

    if (group.organizerId == userId || memberId == userId || userMembership.status === "co-host") {
        await delMembership.destroy()
        return res.json({ message: "Successfully deleted membership from group" })
    }

    return res.status(403).json({ message: "You do not have permission to delete this membership" })
})

module.exports = router;
