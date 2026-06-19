const Place = require("../models/places");
const User = require("../models/user");

/**
 * CREATE PLACE (admin / seed only)
 */
exports.createPlace = async (req, res, next) => {
  console.log("Request Body:", req.body);
  try {
    const {
      name,
      category,
      description,
      images,
      address,
      rating,
      tags,
      isTrending,
    } = req.body;

    const place = new Place({
      name,
      category,
      description,
      images,
      address,
      rating,
      tags,
      isTrending,
    });

    await place.save();
    res.status(201).json(place);
  } catch (error) {
    next(error);
  }
};

/**
 * GET HOME CATEGORIES
 */
exports.getHome = async (req, res, next) => {
  try {
    res.json({
      categories: [
        {
          type: "cafe",
          title: "Cafes",
          description: "Quiet corners, coffee & conversations",
          image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=400&fit=crop",
          count: 42
        },
        {
          type: "tourist",
          title: "Tourist Spots",
          description: "Lakes, history & timeless views",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop",
          count: 18
        },
        {
          type: "event",
          title: "Events",
          description: "Live gatherings, local culture, seasonal highlights",
          image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=400&fit=crop",
          count: 12
        }
      ]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL PLACES (filters supported)
 * /api/places?category=cafe&isTrending=true
 */
exports.getPlaces = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = category ? { category } : {};
    const places = await Place.find(filter);

    res.status(200).json(places);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch places" });
  } 
};



/**
 * GET SINGLE PLACE (overview page)
 */
exports.getPlaceById = async (req, res, next) => {
  try {
    const { placeid } = req.params;
    const place = await Place.findById(placeid);
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }
    res.json(place);
  } catch (error) {
    next(error);
  }
};


// add to wishlist
exports.addWishlistPlace = async (req, res, next) => {
  try {
    const { placeId } = req.body;
    const sessionUser = req.session && req.session.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = sessionUser._id || sessionUser.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log("Adding to wishlist:", placeId);
    console.log("For user:", userId);

    // Add place to wishlist if not already present
    if (!user.wishlist) user.wishlist = [];
    if (!user.wishlist.includes(placeId)) {
      user.wishlist.push(placeId);
      await user.save();
    }

    res.status(200).json({ message: `Place with ID ${placeId} added to wishlist.`, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// get wishlist places
exports.getWishlistPlaces = async (req, res, next) => {
  try {
    const sessionUser = req.session && req.session.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = sessionUser._id || sessionUser.id;
    const user = await User.findById(userId).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// remove from wishlist
exports.removeWishlistPlace = async (req, res, next) => {
  try {
    const sessionUser = req.session && req.session.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { placeId } = req.params;
    const userId = sessionUser._id || sessionUser.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Ensure array exists
    if (!Array.isArray(user.wishlist)) user.wishlist = [];

    const beforeCount = user.wishlist.length;
    // Remove the placeId from wishlist
    user.wishlist = user.wishlist.filter((pid) => String(pid) !== String(placeId));
    const afterCount = user.wishlist.length;

    await user.save();

    // Return populated wishlist so frontend keys remain consistent
    const populatedUser = await User.findById(userId).populate('wishlist');
    const removed = beforeCount !== afterCount;
    res.status(200).json({
      message: removed
        ? `Place with ID ${placeId} removed from wishlist.`
        : `Place with ID ${placeId} was not in wishlist.`,
      wishlist: populatedUser.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE PLACE (admin)
 */
// exports.updatePlace = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const updatedPlace = await Place.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });

//     if (!updatedPlace) {
//       return res.status(404).json({ message: "Place not found" });
//     }

//     res.json(updatedPlace);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * DELETE PLACE (admin)
//  */
// exports.deletePlace = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const deletedPlace = await Place.findByIdAndDelete(id);

//     if (!deletedPlace) {
//       return res.status(404).json({ message: "Place not found" });
//     }

//     res.status(204).json({ id });
//   } catch (error) {
//     next(error);
//   }
// };
