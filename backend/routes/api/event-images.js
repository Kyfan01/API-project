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

    if (!image) {
        return res.status(404).json({ message: "Event Image couldn't be found" })
    } else {
        await image.destroy()
        return res.json({ message: "Successfully deleted" })
    }
})

module.exports = router;
