const express = require("express");
const Activities = require("../models/activity.js");
const auth = require("../middleware/auth.js");

const activityController = express.Router();
activityController.get(
  "/activity/:id",
  auth(["trainer", "customer"]),
  (req, res) => {
    const activityID = req.params.id;
    Activities.getActivityByID(activityID)
      .then((activity) => {
        res.status(200).json({
          status: 200,
          message: "Get activity by ID",
          activity: activity,
        });
      })
      .catch((error) => {
        res.status(500).json({
          status: 500,
          message: `Failed to get activity /${error}`,
        });
      });
  }
);
module.exports = activityController;
