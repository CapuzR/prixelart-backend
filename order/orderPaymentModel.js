'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderPaymentSchema = Schema({
    orderId: {type: String, required: true},
    createdOn: {type: Date, required: true},
    createdBy: {type: Object, required: true},
    total: {type: Number, required: true},
    paymentMethodID: {type: String, required: false}, 
});

module.exports = mongoose.model('OrderPayment', OrderPaymentSchema, "orderPayment");