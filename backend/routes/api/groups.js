const express = require('express')
const { Group, Membership, GroupImage, User, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { requireAuth } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors, validateGroup, validateVenue, validateEvent } = require('../../utils/validation');
// const membership = require('../../db/models/membership');
// const user = require('../../db/models/user');

const router = express.Router();

// GET ALL GROUPS (come back and fix includes)
router.get('/', async (req, res) => {
    const groups = await Group.findAll()

    const members = await Membership.findAll()

    const groupImages = await GroupImage.findAll()

    groups.forEach(group => {
        let numMembers = members.filter(member => member.groupId === group.id).length
        group.dataValues.numMembers = numMembers

        // search all group images for a matching image that is the preview image
        let previewImage = groupImages.find(image => (image.groupId === group.id && image.preview))

        // if the preview image exists, set the url. Otherwise use a default
        if (previewImage) group.dataValues.previewImage = previewImage.url
        else group.dataValues.previewImage = 'default preview image url'
    })

    return res.json({
        Groups: groups
    })
})

// GET ALL GROUPS JOINED BY CURRENT USER (REFACTOR LATER)
router.get('/current', requireAuth, async (req, res) => {

    const userId = req.user.id

    // find all groupIds that the user is a member of
    const userMemberships = await Membership.findAll({
        where: { userId },
        attributes: ['groupId']
    })

    // create an array with all the groupIds
    const joinedGroupArr = []

    userMemberships.forEach(group => {
        joinedGroupArr.push(group.groupId)
    })

    // get all group objects that the user is a member of
    const joinedGroups = await Group.findAll({
        where: { Id: joinedGroupArr }
    })

    const groupImages = await GroupImage.findAll({
        where: { groupId: joinedGroupArr },
        attributes: ['groupId', 'url', 'preview']
    })

    // find all members of all groups the user is in
    const members = await Membership.findAll({
        where: { groupId: joinedGroupArr },
        attributes: ['userId', 'groupId']
    })


    // for each group, find all members that belong to that group and count them
    joinedGroups.forEach(group => {
        let numMembers = members.filter((member) => member.groupId === group.id).length
        group.dataValues.numMembers = numMembers

        // search all group images for a matching image that is the preview image
        let previewImage = groupImages.find((image) => (image.groupId === group.id && image.preview))

        // if the preview image exists, set the url. Otherwise use a default
        if (previewImage) {
            group.dataValues.previewImage = previewImage.url
        } else group.dataValues.previewImage = 'default preview image url'
    })

    return res.json({
        Groups: joinedGroups
    })
})

// GET DETAILS OF GROUP BY ID
router.get('/:groupId', async (req, res) => {
    const { groupId } = req.params

    const groups = await Group.findByPk(groupId, {
        include: [
            {
                model: GroupImage,
                attributes: ['id', 'url', 'preview']
            },
            {
                model: User,
                as: 'Organizer',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Venue
            }
        ]
    })

    if (groups) {

        const members = await Membership.findAll({
            where: { groupId: groups.id },
            attributes: ['userId', 'groupId']
        })

        groups.dataValues.numMembers = members.length

        return res.json(groups)

    } else return res.status(404).json({ message: "Group couldn't be found" })
})

// CREATE NEW GROUP
router.post('/', requireAuth, async (req, res) => {

    const newGroupErr = validateGroup(req.body)

    if (Object.keys(newGroupErr).length) {
        const err = new Error()
        err.message = "Bad Request"
        err.errors = newGroupErr
        return res.status(400).json(err)
    }

    const { name, about, type, private, city, state } = req.body
    const group = await Group.create({ name, about, type, private, city, state })
    const userId = req.user.id

    group.organizerId = userId
    group.save()

    return res.status(201).json(group)
})

// ADD IMAGE TO GROUP BY GROUP ID
router.post('/:groupId/images', requireAuth, async (req, res) => {

    const userId = req.user.id
    const { groupId } = req.params
    const { url, preview } = req.body

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    else if (group.organizerId === userId) {

        const newImage = await GroupImage.create({ url, preview })
        newImage.save()

        const confirmedImage = {
            id: newImage.id,
            url: newImage.url,
            preview: newImage.preview
        }

        return res.json(confirmedImage)
    } else return res.status(404).json({ message: "You are not the organizer for this group" })
})

// EDIT GROUP BY ID (REFACTOR LATER)
router.put('/:groupId', requireAuth, async (req, res) => {

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

    // find specific group
    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    // find all members of that group
    const members = await Membership.findAll({
        where: { groupId },
        attributes: ['userId']
    })

    // create array of members' userIds
    let memberList = []
    for (let member of members) {
        memberList.push(member.userId)
    }

    //check if user is a member of the group
    let isMember = memberList.includes(userId)

    if (!isMember) return res.json({ message: "Bad Request" })

    else if (isMember) {
        group.name = name,
            group.about = about,
            group.type = type,
            group.private = private,
            group.city = city,
            group.state = state

        await group.save()
    }

    return res.json(group)
})

// DELETE GROUP (check what proper auth means)
router.delete('/:groupId', requireAuth, async (req, res) => {

    const userId = req.user.id
    const { groupId } = req.params

    const group = await Group.findByPk(groupId)

    if (group) {
        await group.destroy()
        return res.json({ message: "Successfully deleted" })
    }
    else return res.status(404).json({ message: "Group couldn't be found" })
})


// GET ALL VENUES FOR GROUP BY ID (check if user is org or host) REFACTOR TO JUST FIND ALL WHERE GROUPID
router.get('/:groupId/venues', requireAuth, async (req, res) => {

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

    return res.json({ Venues: group.Venues })
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


    // check if user is organizer of group or co-host member
    const userId = req.user.id
    const { groupId } = req.params

    const { address, city, state, lat, lng } = req.body

    const groupTest = await Group.findByPk(groupId)
    if (!groupTest) return res.status(404).json({ message: "Group couldn't be found" })

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


    // create venue, add the group id
    const venue = await Venue.create({ address, city, state, lat, lng })
    venue.groupId = groupId
    venue.save()

    // remove updatedAt, createAt key/values
    delete venue.dataValues.updatedAt
    delete venue.dataValues.createdAt

    return res.status(201).json(venue)
})

// GET ALL EVENTS OF GROUP BY ID
router.get('/:groupId/events', async (req, res) => {
    const { groupId } = req.params

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
            }],
        attributes:
        {
            exclude: ['createdAt', 'updatedAt', 'description', 'capacity', 'price']
        }
    })

    if (!events.length) return res.status(404).json({ message: "Group couldn't be found" })


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


// CREATE EVENT FOR GROUP BY ID (CHECK IF USER IS ORG OR HOST)
router.post('/:groupId/events', requireAuth, async (req, res) => {
    const { groupId } = req.params

    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body

    // Validate the event body
    const newEventErr = validateEvent(req.body)

    if (Object.keys(newEventErr).length) {
        const err = new Error()
        err.message = "Bad Request"
        err.errors = newEventErr
        return res.status(400).json(err)
    }

    // Validate the venue
    const venue = await Venue.findByPk(venueId)
    if (!venue) return res.status(404).json({ message: "Venue couldn't be found" })

    // check if user is organizer or co-host
    const userId = req.user.id
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
                where: { id: userId }
            }]
        })
    if (!group) return res.status(404).json({ message: "You are not an organizer or member" })

    if (group.dataValues.organizerId !== userId && group.dataValues.Organizer[0].Membership.status !== 'co-host') {
        return res.status(404).json({ message: "You are not an organizer or co-host" })
    }


    //create the new event
    const event = await Event.create({ venueId, name, type, capacity, price, description, startDate, endDate })

    event.groupId = groupId
    event.save()

    delete event.dataValues.updatedAt
    delete event.dataValues.createdAt

    return res.json(event)
})

// GET ALL MEMBERS OF GROUP BY ID (CHECK AUTHS)
router.get('/:groupId/members', async (req, res) => {

    const { groupId } = req.params
    const userId = req.user.id
    let organizer = false

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })
    if (group.dataValues.organizerId === userId) organizer = true

    const member = await Membership.findOne({
        where: { userId, groupId },
    })
    if (member.dataValues.status === "co-host") organizer = true

    let members = await User.findAll({
        //where: {id: userIds}
        include: [{
            model: Group,
            through: {
                model: Membership,
                attributes: ['status']
            },
            where: { id: groupId }
        }]
    })

    if (organizer) {
        members.forEach(member => {
            member.dataValues.Membership = member.dataValues.Groups[0].Membership
            delete member.dataValues.Groups
            delete member.dataValues.username
        })
        return res.json({ Members: members })
    } else {
        members.forEach(member => {
            member.dataValues.Membership = member.dataValues.Groups[0].Membership
            delete member.dataValues.Groups
            delete member.dataValues.username
        })
        console.log(members)
        members = members.filter(member => { return member.dataValues.Membership.status !== "pending" })
        return res.json({ Members: members })
    }

})

// REQUEST NEW MEMBERSHIP FOR GROUP BY ID
router.post('/:groupId/membership', requireAuth, async (req, res) => {

    const userId = req.user.id

    const { groupId } = req.params

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    const memberships = await Membership.findAll({
        where: { groupId }
    })

    memberships.forEach(member => {
        if (member.userId === userId && member.status === "pending") {
            return res.status(400).json({ message: "Membership has already been requested" })
        }
        else if (member.userId === userId) {
            return res.status(400).json({ message: "User is already a member of the group" })
        }
    })

    const newMember = Membership.build({
        userId, groupId, status: "pending"
    })

    newMember.save()

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
    let userPerm = ""
    let permArr = ['organizer', 'co-host']

    if (status === "pending") res.json({
        message: "Bad Request",
        errors: { status: "cannot change a membership status to pending" }
    })

    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })


    const user = await User.findByPk(memberId)
    if (!user) return res.status(404).json({ message: "User couldn't be found" })

    const membership = await Membership.findOne({
        where: { userId: memberId, groupId }
    })
    if (!membership) {
        return res.status(404).json({ message: "Membership between the user and the group does not exist" })
    }

    if (group.dataValues.organizerId === userId) userPerm = "organizer"
    else if (membership.dataValues.status === "co-host") userPerm = "co-host"

    if (status === "co-host" && userPerm !== "organizer") {
        return res.status(400).json({ message: "You do not have permission to change to co-host" })
    }

    if (status === "member" && !permArr.includes(userPerm)) {
        return res.status(400).json({ message: "You do not have permission to change to member" })
    }

    const member = await Membership.findOne({
        where: { userId: memberId, groupId },
        attributes: ['id', 'userId', 'groupId', 'status']
    })

    member.status = status
    member.save()

    delete member.dataValues.updatedAt
    delete member.dataValues.createdAt

    return res.json(member)

})

// DELETE MEMBERSHIP TO GROUP BY ID (MIGHT NEED TO CHANGE WHAT MEMBER MEANS)
router.delete('/:groupId/membership/:memberId', requireAuth, async (req, res) => {
    const { groupId, memberId } = req.params
    const userId = req.user.id
    let userPerm = false


    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })
    if (group.dataValues.organizerId === userId) userPerm = true

    const user = await User.findByPk(memberId)
    if (!user) return res.status(404).json({ message: "User couldn't be found" })

    const membership = await Membership.findOne({
        where: { userId: memberId, groupId }
    })
    if (!membership) return res.status(404).json({ message: "Membership between the user and the group does not exist" })

    if (userId === memberId) userPerm = true

    if (userPerm) {
        await membership.destroy()
        return res.json({ message: "Successfully deleted membership from group" })
    }

})

module.exports = router;
