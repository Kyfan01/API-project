const express = require('express')
const { Group, Membership, GroupImage, User, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { requireAuth } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

//DELETE IMAGE FOR GROUP
router.delete('/:imageId', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { imageId } = req.params

    const image = await GroupImage.findByPk(imageId)
    if (!image) return res.status(404).json({ message: "Group Image couldn't be found" })

    const groupId = image.groupId
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

    await image.destroy()
    return res.json({ message: "Successfully deleted" })
})

module.exports = router;
