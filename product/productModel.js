'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    category: {type: String, required: true},
    considerations: {type: String, required: true},
    thumbUrl: {type: String, required: true},
    publicPrice: {
        from: {type: String, required: false},
        to: {type: String, required: false},
    }, //price
    prixerPrice: {
        from: {type: String, required: false},
        to: {type: String, required: false},
    },//prixerPrice,
    attributes: { type: Array, required: false}, //activeAttributes
    active: { type: Boolean, required: true }, 
    variants: { type: Array, required: false },
    hasSpecialVar: { type: Boolean, required: true }
});


module.exports = mongoose.model('Product', ProductSchema, "products");