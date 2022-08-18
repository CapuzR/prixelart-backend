'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrixerSchema = Schema({
    entityName: {type: String, required: true},
    officialDoc: {type: String, required: true},
    foundationDate: {type: String, required: true},
    //los emails probablemente deben englobarse en un arreglo
    deliveryEmail: {type: String, required: true},
    salesEmail: {type: String, required: true},
    workshopEmail: {type: String, required: true},
    mainPhone: {type: String, required: true},
    country: {type: String, required: true},
    city: {type: String, required: true},
    description: {type: String},
    //los siguientes probablemente deben englobarse en un arreglo de statements
    mision: {type: String, required: true, index: true },
    vision: {type: String, required: true, index: true },
    values: {type: String, required: true, index: true },
    why: {type: String, required: true, index: true },
    //los siguientes deben agruparse en un arreglo de brand.
    logo: {type: String, required: false}, //debe haber logo vertical, logo horizontal, etc.
    brandPrimaryColor: {type: String, required: true, index: true },
    brandSecondaryColor: {type: String, required: true, index: true },
    //Se debe agregar un arreglo con la dirección de retiro y la dirección de admin.
    //Se debe agregar un arreglo con los datos de pago.
});

module.exports = mongoose.model('Prixer', PrixerSchema, "prixers");