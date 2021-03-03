const mongoose = require('mongoose')
require('mongoose-long')(mongoose);
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Driver = require('./driver');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    cpf: {
        type: Number,
        required: true,
        unique: true
    },
    birthday: {
        type: Date,
        required: true
    },
    phone: {
        type: mongoose.Types.Long
    },
    cnh: {
        number: {
            type: Number,
            unique: true
        },
        expiringDate: {
            type: Date
        },
        category: [{
            type: String,
            maxlength: 1
        }]
    },
    address: {
        zipCode: {
            type: Number
        },
        street: {
            type: String,
            trim: true
        },
        number: {
            type: Number
        },
        neighborhood: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            maxlength: 2
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email inválido');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlenght: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('senha')) {
                throw new Error('Senha inválida, não utilize "senha"');
            }
        }
    },
    administrator: {
        type: Boolean,
        required: true,
        default: false
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    
    return userObject;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Não foi possível realizar o login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Não foi possível realizar o login');
    }

    return user;
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// Delete driver when its user is removed
userSchema.pre('remove', async function (next) {
    const user = this;
    await Driver.deleteOne({ user: user._id });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;