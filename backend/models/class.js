const { db } = require("../database/mysql.js");

function newClasses(id, time, locationID, activityID, trainerID, day) {
  return {
    id,
    time,
    locationID,
    activityID,
    trainerID,
    day,
  };
}

// create class
async function createClass(newcreatedClass) {
  delete newcreatedClass.id;
  const createClasses = await db
    .query(
      `INSERT INTO classes
      ( class_time, class_location_id, class_activity_id, class_trainer_user_id, class_day)
      VALUES(?,?,?,?,?)`,
      [
        newcreatedClass.time,
        newcreatedClass.locationID,
        newcreatedClass.activityID,
        newcreatedClass.trainerID,
        newcreatedClass.day,
      ]
    )
    .then(([result]) => {
      return { ...newcreatedClass, id: result.insertId };
    })
    .catch((error) => console.log(error));
}

// get all classes
async function getAllClasses() {
  const [allClassesResults] = await db.query("SELECT * FROM classes");
  return await allClassesResults.map((classResult) =>
    newClasses(
      classResult.class_id,
      classResult.class_time,
      classResult.class_location_id,
      classResult.class_activity_id,
      classResult.class_trainer_user_id,
      classResult.class_day
    )
  );
}

// get classes by day
async function getClassesByDay(day) {
  const [allClassesResults] = await db.query(
    `SELECT
    classes.class_activity_id,
    activities.activity_id,
    classes.class_day,
    activities.activity_name,
    activities.activity_description,
    activities.activity_duration,
    MIN(classes.class_time) AS min_class_time,
    MIN(classes.class_id) AS min_class_id
    FROM classes
    LEFT JOIN activities
    ON classes.class_activity_id = activities.activity_id
    WHERE classes.class_day = ?
    GROUP BY
    classes.class_activity_id,
    activities.activity_id,
    classes.class_day,
    activities.activity_name,
    activities.activity_description,
    activities.activity_duration`,
    day
  );

  if (allClassesResults.length > 0) {
    const result = allClassesResults;
    return result;
  } else {
    return Promise.reject(`no results found with ${day}`);
  }
}

// get class by day and classname
async function getClassesByDayandName(day, activityID) {
  const [allClassesResults] = await db.query(
    `SELECT classes.class_activity_id, activities.activity_id, classes.class_day, activities.activity_name, 
      classes.class_time ,classes.class_id,classes.class_location_id,classes.class_trainer_user_id
      FROM classes
      LEFT JOIN activities
      ON classes.class_activity_id = activities.activity_id
      WHERE classes.class_day = ? AND activities.activity_id=?`,
    [day, activityID]
  );

  if (allClassesResults.length > 0) {
    const result = allClassesResults;
    return result;
  } else {
    return Promise.reject(
      `no results found with ${day} and activityIdD:'${activityID}`
    );
  }
}

// get Class by ID
async function getClassByID(classID) {
  const [classResult] = await db.query(
    "SELECT * FROM classes WHERE classes.class_id=?",
    classID
  );
  return classResult[0];
}

module.exports = {
  newClasses,
  createClass,
  getAllClasses,
  getClassesByDay,
  getClassesByDayandName,
  getClassByID,
};
