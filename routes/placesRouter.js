// External Module
const express = require("express");
const placeRouter = express.Router();

// Local Module
const placeController = require("../controllers/ocassionController");

// CREATE place (admin / seed only)
placeRouter.post("/places", placeController.createPlace);

// GET all places (filter by category, trending, etc.)
placeRouter.get("/home", placeController.getHome);
placeRouter.get("/places", placeController.getPlaces);
// wishlist endpoints must be declared before the param route
placeRouter.post('/places/wishlist', placeController.addWishlistPlace);
placeRouter.get('/places/wishlist', placeController.getWishlistPlaces);
placeRouter.delete('/places/wishlist/:placeId', placeController.removeWishlistPlace);
placeRouter.get("/places/:placeid", placeController.getPlaceById);
 
// // CREATE place (admin / seed only)
// placeRouter.post("/", placeController.createPlace);

// // UPDATE place (admin)
// placeRouter.put("/:id", placeController.updatePlace);

// // DELETE place (admin / soft delete later)
// placeRouter.delete("/:id", placeController.deletePlace);

module.exports = placeRouter;
