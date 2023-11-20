const express = require("express");
const Location = require("../models/location.js");
const auth = require("../middleware/auth.js");

const locationController = express.Router();

locationController.get(
  "/location/:locationID",
  auth(["customer", "trainer"]),
  (req, res) => {
    const locationID = req.params.locationID;
    Location.getLocationByID(locationID)
      .then((location) => {
        res.status(200).json({
          status: 200,
          message: "Get location by ID",
          location: location,
        });
      })
      .catch((error) => {
        res.status(500).json({
          status: 500,
          message: `Failed to get location /${error}`,
        });
      });
  }
);

module.exports = locationController;
