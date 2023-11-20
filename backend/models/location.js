const { db } = require("../database/mysql.js");

function newLocation(id, name) {
  return {
    id,
    name,
  };
}

async function getLocationByID(ID) {
  const [results] = await db.query(
    "SELECT * FROM location WHERE location_id=?",
    ID
  );

  if (results.length > 0) {
    const userResult = results[0];
    return Promise.resolve(
      newLocation(userResult.location_id, userResult.location_name)
    );
  } else {
    return Promise.reject(`no results found with ${userID}`);
  }
}

module.exports = {
  newLocation,
  getLocationByID,
};
