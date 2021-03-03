const express = require('express');
const auth = require('../../utils/middleware/auth');
const authAdmin = require('../../utils/middleware/authAdmin');
const Clinic = require('../../models/clinic');
const router = new express.Router();

// Get clinics
router.get('/clinics', auth, async (req, res) => {
    try {
        const clinics = await Clinic.find();

        if (!clinics) {
            return res.status(404).send();
        }
        res.send(clinics);
    } catch(e) {
        res.status(500).send();
    }
});

// Get clinic
router.get('/clinics/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const clinic = await Clinic.findOne({ _id });

        if (!clinic) {
            return res.status(404).send();
        }
        res.send(clinic);
    } catch(e) {
        res.status(500).send();
    }
});

// Create clinic
router.post('/clinics', authAdmin, async (req, res) => {
    const clinic = new Clinic({ ...req.body });

    try {
        await clinic.save();
        res.status(201).send(clinic);
    } catch(e) {
        res.status(400).send(e);
    }
});

// Update clinic
router.patch('/clinics/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'cnpf', 'phone', 'contact', 'address'];
    const allowedUpdatesDrivers = ['phone', 'contact', 'address'];
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
        const clinic = await Clinic.findOne({ _id: req.params.id });

        if (!clinic) {
            return res.status(404).send();
        }
        updates.forEach(update => clinic[update] = req.body[update]);
        await clinic.save();
        res.send(clinic);
    } catch(e) {
        res.status(400).send(e);
    }
});

// Delete clinic
router.delete('/clinics/:id', authAdmin, async (req, res) => {
    try {
        const clinic = await Clinic.findOneAndDelete({ _id: req.params.id });

        if (!clinic) {
            return res.status(404).send();
        }
        res.send(clinic);
    } catch(e) {
        res.status(500).send();
    }
});

// Delete many clinics
router.delete('/clinics/many/:123', authAdmin, async (req, res) => {
    try {
        const clinic = await Clinic.deleteMany({ _id: req.body.ids });

        if (!clinic) {
            return res.status(404).send();
        }
        res.send(clinic);
    } catch(e) {
        res.status(500).send();
    }
});

module.exports = router;