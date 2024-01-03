const express = require('express')
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');
const { requireAuth } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


const router = express.Router();

const validateGroup = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 60 })
        .withMessage('Name must be 60 characters or less'),
    check('about')
        .exists({ checkFalsy: true })
        .isLength({ min: 50 })
        .withMessage('About must be 50 characters or more'),
    check('type')
        .exists({ checkFalsy: true })
        .withMessage("Type must be 'Online' or 'In person'"),
    handleValidationErrors
]

const validateMembership = []


// GET ALL GROUPS (come back and fix includes)
router.get('/', async (req, res) => {
    const groups = await Group.findAll({
        // include: {
        //     model: Membership,
        //     attributes: ['userId', 'groupId']
        // }
    })

    const members = await Membership.findAll()

    const groupImages = await GroupImage.findAll()

    groups.forEach(group => {
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
        Groups: groups
    })
})

// GET ALL GROUPS JOINED BY CURRENT USER
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

        // CHANGE FORMAT OF PAYLOAD
        return res.json(groups)

    } else return res.status(404).json({ message: "Group couldn't be found" })
})

// CREATE NEW GROUP (check error-handling)
router.post('/', requireAuth, async (req, res) => {

    const { name, about, type, private, city, state } = req.body
    const group = await Group.create({ name, about, type, private, city, state })
    const userId = req.user.id

    group.dataValues.organizerId = userId
    console.log(group)

    return res.status(201).json(group)

})

// ADD IMAGE TO GROUP
router.post('/:groupId/images', requireAuth, async (req, res) => {

    const userId = req.user.id
    const { groupId } = req.params
    const { url, preview } = req.body

    const group = await Group.findByPk(groupId)

    if (group.organizerId === userId) {

        const newImage = await GroupImage.create({ url, preview })

        const confirmedImage = {
            id: newImage.id,
            url: newImage.url,
            preview: newImage.preview
        }

        return res.json(confirmedImage)
    } else return res.status(404).json({ message: "Group couldn't be found" })
})

// EDIT GROUP (check error-handling)
router.put('/:groupId', requireAuth, async (req, res) => {

    const userId = req.user.id
    const { groupId } = req.params

    const { name, about, type, private, city, state } = req.body

    // find specific group
    const group = await Group.findByPk(groupId)

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

    if (!isMember) return res.json({ message: "Group couldn't be found" })

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
        return res.json({ "message": "Successfully deleted" })
    }
    else return res.status(404).json({ message: "Group couldn't be found" })
})

module.exports = router;
