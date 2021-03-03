const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    region: {
        monday: {
            cities: [{
                type: String,
                trim: true
            }]
        },
        tuesday: {
            cities: [{
                type: String,
                trim: true
            }]
        },
        wednesday: {
            cities: [{
                type: String,
                trim: true
            }]
        },
        thursday: {
            cities: [{
                type: String,
                trim: true
            }]
        },
        friday: {
            cities: [{
                type: String,
                trim: true
            }]
        },
        saturday: {
            cities: [{
                type: String,
                trim: true
            }]
        },
        sunday: {
            cities: [{
                type: String,
                trim: true
            }]
        }
    }
}, {
    timestamps: true
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;