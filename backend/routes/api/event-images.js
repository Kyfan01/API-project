const express = require('express')
const { Group, Membership, GroupImage, User, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { requireAuth } = require('../../utils/auth')
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

//DELETE IMAGE FOR EVENT
router.delete('/:imageId', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { imageId } = req.params

    const image = await EventImage.findByPk(imageId)
    if (!image) return res.status(404).json({ message: "Event Image couldn't be found" })

    const eventId = image.eventId

    const event = await Event.findByPk(eventId)
    if (!event) return res.status(404).json({ message: "Event couldn't be found" })

    const groupId = event.groupId

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


    if (!image) {
        return res.status(404).json({ message: "Event Image couldn't be found" })
    } else {
        await image.destroy()
        return res.json({ message: "Successfully deleted" })
    }
})

module.exports = router;
