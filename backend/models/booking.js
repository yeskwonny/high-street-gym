const { db } = require("../database/mysql.js");

function newBookings(id, user_id, class_id, datetime, classDate) {
  return {
    id,
    user_id,
    class_id,
    datetime,
    classDate,
  };
}

//get booking by user ID
async function getBookingByUserID(userID) {
  const [bookingResults] = await db.query(
    `SELECT * FROM bookings 
     WHERE booking_user_id=?
     ORDER BY booking_class_date ASC`,
    userID
  );
  // console.log(bookingResults);
  if (bookingResults.length > 0) {
    return Promise.resolve(
      bookingResults.map((result) => {
        return newBookings(
          result.booking_id,
          result.booking_user_id,
          result.booking_class_id,
          result.booking_created_datetime,
          result.booking_class_date
        );
      })
    );
  } else {
    return Promise.reject(`no results found with ${userID}`);
  }
}
// getBookingByUserID(8).then((result) => console.log(result));

//Create booking
async function createBooking(booking) {
  delete booking.id;
  return db
    .query(
      "INSERT INTO bookings (booking_user_id,booking_class_id,booking_created_datetime,booking_class_date) " +
        "VALUES(?,?,?,?)",
      [booking.user_id, booking.class_id, booking.datetime, booking.classDate]
    )
    .then(([result]) => {
      return { ...booking, id: result.insertId };
    });
}

//delete booking
async function deleteBooking(bookingId) {
  return db
    .query("DELETE FROM bookings WHERE booking_id=? ", bookingId)
    .then((result) => console.log(result));
}

module.exports = {
  newBookings,
  getBookingByUserID,
  createBooking,
  deleteBooking,
};
