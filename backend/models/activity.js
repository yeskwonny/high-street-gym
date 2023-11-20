const { db } = require("../database/mysql.js");

function newActivity(id, name, description, duration) {
  return {
    id,
    name,
    description,
    duration,
  };
}

async function getActivityByID(actID) {
  const [results] = await db.query(
    "SELECT * FROM activities WHERE activity_id=?",
    actID
  );

  if (results.length > 0) {
    const activityResult = results[0];
    return Promise.resolve(
      newActivity(
        activityResult.activity_id,
        activityResult.activity_name,
        activityResult.activity_description,
        activityResult.activity_duration
      )
    );
  } else {
    return Promise.reject(`no results found with ${actID}`);
  }
}

module.exports = {
  newActivity,
  getActivityByID,
};
