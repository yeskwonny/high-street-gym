const express = require("express");
const Bookings = require("../models/booking.js");
const auth = require("../middleware/auth.js");

const bookingController = express.Router();

bookingController.get(
  "/bookinglist/:userID",
  auth(["trainer", "customer"]),
  async (req, res) => {
    const userID = req.params.userID;

    try {
      const bookingListByUserId = await Bookings.getBookingByUserID(userID);

      if (!bookingListByUserId) {
        return res.status(400).json({
          status: 400,
          message: "Bad Request: Invalid request or data",
        });
      }
      res.status(200).json({
        status: 200,
        message: "Successfully get bookings",
        bookings: bookingListByUserId,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error,
        error: error.message,
      });
    }
  }
);

bookingController.post(
  "/bookinglist",
  auth(["trainer", "customer"]),
  (req, res) => {
    const bookingData = req.body;

    const booking = Bookings.newBookings(
      null,
      bookingData.userID,
      bookingData.classID,
      bookingData.createdTime,
      bookingData.classDate
    );

    Bookings.createBooking(booking)
      .then((createdBooking) => {
        res.status(200).json({
          status: 200,
          message: "Yay! Your class has been booked!",
          booking: createdBooking,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: "Please select all options for your booking",
        });
      });
  }
);

bookingController.delete(
  "/bookinglist/cancellations/:bookingId",
  auth(["trainer", "customer"]),
  async (req, res) => {
    try {
      const bookingID = req.params.bookingId;
      const deletedBookingList = await Bookings.deleteBooking(bookingID);

      if (!deletedBookingList) {
        return res.status(400).json({
          status: 400,
          message: "Bad Request: Invalid request or data",
        });
      }
      res.status(200).json({
        status: 200,
        message: "Successfully deleted the booking",
        bookings: deletedBookingList,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error,
        error: error.message,
      });
    }
  }
);

module.exports = bookingController;
