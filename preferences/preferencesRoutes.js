const {createImageCarousel, upload, readAllImagesCarousel,readImageCarousel, updateImageCarousel,deleteImageCarousel} = require('./preferencesController')
const express = require('express');
const preferencesRoutes = express.Router();

preferencesRoutes.get('/carousel', readAllImagesCarousel);
preferencesRoutes.get('/carousel/:id', readImageCarousel)
preferencesRoutes.post('/carousel', upload.single('bannerImages') ,createImageCarousel);
preferencesRoutes.put('/carousel/:id', upload.single('newBannerImages') ,updateImageCarousel)
preferencesRoutes.delete('/carousel/:id', deleteImageCarousel);


module.exports = preferencesRoutes;