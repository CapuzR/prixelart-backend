'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrixerSchema = Schema({
    specialty: {type: String, required: true},
    instagram: {type: String, required: true},
    dateOfBirth: {type: String, required: true},
    phone: {type: String, required: true},
    country: {type: String, required: true},
    city: {type: String, required: true},
    userId: {type: String, required: true, index: true },
    shortShot: {type: String},
    username: {type: String, required: true, index: true },
    avatar: {type: String, required: false}
});

module.exports = mongoose.model('Prixer', PrixerSchema, "prixers");