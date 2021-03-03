const express = require('express');
const auth = require('../../utils/middleware/auth');
const authAdmin = require('../../utils/middleware/authAdmin');
const PickUp = require('../../models/pickUp');
const multer = require('multer');
const sharp = require('sharp');
const router = new express.Router();

// Get pick ups
router.get('/pickUps', authAdmin, async (req, res) => {
    try {
        const pickUps = await PickUp.find().select('-photo').populate('clinic', 'name').populate({ path: 'driver', select: 'user', populate: { path: 'user', select: 'name' }}).exec();

        if (!pickUps) {
            return res.status(404).send();
        }
        res.send(pickUps);
    } catch(e) {
        res.status(500).send();
    }
});

// Get driver's pick ups
router.get('/pickUps/driver', auth, async (req, res) => {
    try {
        let pickUps = await PickUp.find().select('-photo').populate('clinic', 'name').populate({ path: 'driver', select: 'user', populate: { path: 'user', select: 'name' }}).exec();

        pickUps = pickUps.filter(pickUp => JSON.stringify(pickUp.driver.user._id) === JSON.stringify(req.user.id));

        if (!pickUps) {
            return res.status(404).send();
        }
        res.send(pickUps);
    } catch(e) {
        res.status(500).send();
    }
});

// Get pick up
router.get('/pickUps/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const pickUp = await PickUp.findOne({ _id }).populate('clinic', 'name').populate({ path: 'driver', select: 'user', populate: { path: 'user', select: 'name' }}).exec();

        if (!pickUp) {
            return res.status(404).send();
        }
        if (!req.user.administrator) {
            if (JSON.stringify(pickUp.driver.user._id) !== JSON.stringify(req.user._id)) {
                return res.status(403).send();
            }
        }
        res.send(pickUp);
    } catch(e) {
        res.status(500).send();
    }
});

// Create pick up
router.post('/pickUps', authAdmin, async (req, res) => {
    const pickUp = new PickUp({ ...req.body });

    try {
        await pickUp.save();
        res.status(201).send(pickUp);
    } catch(e) {
        res.status(400).send(e);
    }
});

// Update pick up
router.patch('/pickUps/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['clinic', 'driver', 'note', 'date', 'done'];
    const allowedUpdatesDrivers = ['note', 'done'];
    let isValidOperation = false;

    if (req.user.administrator) {
        isValidOperation = updates.every(update => allowedUpdates.includes(update));
    } else {
        isValidOperation = updates.every(update => allowedUpdatesDrivers.includes(update));
    }

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Atualização não permitida!' });
    }
    try {
        const pickUp = await PickUp.findOne({ _id: req.params.id });

        if (!pickUp) {
            return res.status(404).send();
        }
        updates.forEach(update => pickUp[update] = req.body[update]);
        await pickUp.save();
        res.send(pickUp);
    } catch(e) {
        res.status(400).send(e);
    }
});

// Delete pick up
router.delete('/pickUps/:id', authAdmin, async (req, res) => {
    try {
        const pickUp = await PickUp.findOneAndDelete({ _id: req.params.id });

        if (!pickUp) {
            return res.status(404).send();
        }
        res.send(pickUp);
    } catch(e) {
        res.status(500).send();
    }
});

// Delete many pick ups
router.delete('/pickUps/many/:123', authAdmin, async (req, res) => {
    try {
        const pickUp = await PickUp.deleteMany({ _id: req.body.ids });

        if (!pickUp) {
            return res.status(404).send();
        }
        res.send(pickUp);
    } catch(e) {
        res.status(500).send();
    }
});

const upload = multer({
    limits: {
        fileSize: 16777216, // 16MB in bytes, MongoDB's Buffer limit
        files: 1
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) { // regular expression for file extentions
            return callback(new Error('Formatos permitidos: .jpg, .jpeg, .png'));
        }
        callback(undefined, true);
    }
});

// Create pick up photo
router.post('/pickUps/:id/photo', auth, upload.single('photo'), async (req, res) => {
    try {
        let pickUp = await PickUp.findById(req.params.id).select('photo');
        const buffer = await sharp(req.file.buffer).resize({ width: undefined, height: 350 }).toFormat('png').toBuffer();

        pickUp.photo = buffer;
        await pickUp.save();
        res.send(buffer);
    } catch(e) {
        res.status(500).send();
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

// Get pick up photo
router.get('/pickUps/:id/photo', auth, async (req, res) => {
    try {
        const pickUp = await PickUp.findById(req.params.id).select('photo');

        if (!pickUp || !pickUp.photo) {
            throw new Error();
        }
        res.set('Content-Type', 'image/png');
        res.send(pickUp.photo);
    } catch(e) {
        res.status(404).send();
    }
});

// Delete pick up photo
router.delete('/pickUps/:id/photo', auth, async (req, res) => {
    try {
        const pickUp = await PickUp.findById(req.params.id).select('photo');

        if (!pickUp || !pickUp.photo) {
            throw new Error();
        }
        pickUp.photo = undefined;
        await pickUp.save();
        res.send();
    } catch(e) {
        res.status(404).send();
    }
});

module.exports = router;