const express = require('express')
const { Group, Membership, GroupImage, User, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { requireAuth, isCoHost } = require('../../utils/auth')
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
    const group = await Group.findByPk(groupId)
    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    if (await isCoHost(group, userId) || group.organizerId == userId) {
        await image.destroy()
        return res.json({ message: "Successfully deleted" })
    }

    return res.status(403).json({ message: "You do not have permission to delete this image" })
})

module.exports = router;
