const express = require('express')
const { Group } = require('../../db/models');

const router = express.Router();


router.get('/', async (req, res) => {
    const groups = await Group.findAll()

    return res.json({
        groups: groups
    })
})

module.exports = router;
