'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderLine = Schema({
    orderId: {type: String, required: true},
    createdOn: {type: Date, required: true},
    createdBy: {type: Object, required: true},
    product: {type: Object, required: true},
    art: {type: Object, required: false}, 
    quantity: {type: String, required: true},
});

module.exports = mongoose.model('OrderLine', OrderLine, "orderLine");