const express = require('express');
const auth = require('../../utils/middleware/auth');
const authAdmin = require('../../utils/middleware/authAdmin');
const router = new express.Router();
const User = require('../../models/user');

// Get users
// Get users' id and name of non admins: /users?drivers=true
router.get('/users', authAdmin, async (req, res) => {
    try {
        const driversOnly = req.query.drivers === 'true';
        let users;
        
        if (driversOnly) {
            users = await User.find({ administrator: false }).select('name'); // id is always present
        } else {
            users = await User.find();
        }

        if (!users) {
            return res.status(404).send();
        }
        res.send(users);
    } catch(e) {
        res.status(500).send();
    }
});

// Get user
router.get('/users/:id', auth, async (req, res) => {
    if (!req.user.administrator) {
        res.send(req.user);
    }
    try {
        const user = await User.findOne({ _id: req.params.id });

        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch(e) {
        res.status(500).send();
    }
});

// Create user
router.post('/users', authAdmin, async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch(e) {
        res.status(400).send(e);
    }
});

// Update user
router.patch('/users/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'cpf', 'birthday', 'phone', 'cnh', 'address', 'email', 'password', 'administrator'];
    const allowedUpdatesDrivers = ['phone', 'cnh', 'address', 'password'];
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
        const user = await User.findOne({ _id: req.params.id });

        if (!user) {
            return res.status(404).send();
        }
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();
        res.send(user);
    } catch(e) {
        res.status(500).send(e);
    }
});

// Delete user
router.delete('/users/:id', authAdmin, async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id });

        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch(e) {
        res.status(500).send();
    }
});

// Delete many users
router.delete('/users/many/:123', authAdmin, async (req, res) => {
    try {
        const user = await User.deleteMany({ _id: req.body.ids });

        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch(e) {
        res.status(500).send();
    }
});

// Loggin in
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch(e) {
        res.status(400).send();
    }
});

// Loggin out
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch(e) {
        res.status(500).send();
    }
});

// Loggin out of all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch(e) {
        res.status(500).send();
    }
});

module.exports = router;