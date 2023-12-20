const router = require('express').Router();

// GET /api/restore-user
const { restoreUser } = require('../../utils/auth.js');
const { User } = require('../../db/models');

router.use(restoreUser);

module.exports = router;
