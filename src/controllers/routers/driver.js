const express = require('express');
const Driver = require('../../models/driver');
const auth = require('../../utils/middleware/auth');
const authAdmin = require('../../utils/middleware/authAdmin');
const router = express.Router();

// Get drivers
// Get drivers' user only: /drivers?userOnly=true
router.get('/drivers', authAdmin, async (req, res) => {
    try {
        const userOnly = req.query.userOnly === 'true';
        let drivers = [];

        if (userOnly) {
            drivers = await Driver.find(null, 'user').populate('user', 'name').exec();
        } else {
            drivers = await Driver.find().populate('user', 'name').exec();
        }

        if (!drivers) {
            return res.status(404).send();
        }
        res.send(drivers);
    } catch(e) {
        res.status(500).send();
    }
});

// Get driver
router.get('/drivers/:id', authAdmin, async (req, res) => {
    const _id = req.params.id;

    try {
        const driver = await Driver.findOne({ _id }).populate('user', 'name').exec();

        if (!driver) {
            return res.status(404).send();
        }
        res.send(driver);
    } catch(e) {
        res.status(500).send();
    }
});

// Get driver by user id
router.get('/drivers/user/:userId', auth, async (req, res) => {
    let _userId = null;

    if (req.user.administrator) {
        _userId = req.params.userId;
    } else {
        _userId = req.user._id;
    }
    try {
        const driver = await Driver.findOne({ user: _userId }).populate('user', 'name').exec();

        if (!driver) {
            return res.status(404).send();
        }
        res.send(driver);
    } catch(e) {
        res.status(500).send();
    }
});

// Create driver
router.post('/drivers', authAdmin, async (req, res) => {
    const driver = new Driver({ ...req.body });

    try {
        await driver.save();
        res.status(201).send(driver);
    } catch(e) {
        res.status(400).send(e);
    }
});

// Update driver
router.patch('/drivers/:id', authAdmin, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['region'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Atualização não permitida!' });
    }
    try {
        const driver = await Driver.findOne({ _id: req.params.id });

        if (!driver) {
            return res.status(404).send();
        }
        updates.forEach(update => driver[update] = req.body[update]);
        await driver.save();
        res.send(driver);
    } catch(e) {
        res.status(500).send(e);
    }
});

// Delete driver
router.delete('/drivers/:id', authAdmin, async (req, res) => {
    try {
        const driver = await Driver.findOneAndDelete({ _id: req.params.id });

        if (!driver) {
            return res.status(404).send();
        }
        res.send(driver);
    } catch(e) {
        res.status(500).send();
    }
});

// Delete many drivers
router.delete('/drivers/many/:123', authAdmin, async (req, res) => {
    try {
        const driver = await Driver.deleteMany({ _id: req.body.ids });

        if (!driver) {
            return res.status(404).send();
        }
        res.send(driver);
    } catch(e) {
        res.status(500).send();
    }
});

module.exports = router;