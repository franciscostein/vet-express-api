const mongoose = require('mongoose')
require('mongoose-long')(mongoose);

const clinicSchema = new mongoose.Schema({
    cnpj: {
        type: mongoose.Types.Long,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
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
    phone: {
        type: mongoose.Types.Long
    },
    contact: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Clinic = mongoose.model('Clinic', clinicSchema);

module.exports = Clinic;