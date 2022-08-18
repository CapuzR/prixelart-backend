'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    username: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    token: { type: String, default: '' }
});

module.exports = mongoose.model('Admin', AdminSchema, "admin");