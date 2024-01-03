const express = require('express')
const { Group, Membership, GroupImage } = require('../../db/models');
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
    check('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
]


router.get('/', async (req, res) => {
    const groups = await Group.findAll()

    return res.json({
        groups
    })
})

router.get('/current', requireAuth, async (req, res) => {

    const userId = req.user.id

    const memberGroups = await Membership.findAll({
        where: { userId },
        attributes: ['groupId']
    })

    // only needed if organizers arent always members

    // const organizerGroups = await Group.findAll({
    //     where: { organizerId: userId }
    // })

    const groupImages = await GroupImage.findAll({
        where: {}
    })


    const groupIds = []

    // eager load images



    return res.json({
        memberGroups,

    })
})

router.get('/:groupId', async (req, res) => {
    const { groupId } = req.params

    const groups = await Group.findByPk(groupId)
    if (groups) {
        return res.json({
            groups
        })

    } else return res.json({ message: "Group couldn't be found" })
})

router.post('/', [requireAuth], async (req, res) => {

    const { name, about, type, private, city, state } = req.body
    const group = await Group.create({ name, about, type, private, city, state })
    const userId = req.user.id


    const safeGroup = {
        organizerId: userId,
        name: group.name,
        about: group.about,
        type: group.type,
        private: group.private,
        city: group.city,
        state: group.state
    }

    return res.json({
        group: safeGroup
    })

})

module.exports = router;
