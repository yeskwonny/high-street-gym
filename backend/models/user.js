const { db } = require("../database/mysql.js");

function newUser(
  id,
  email,
  password,
  role,
  phone,
  fname,
  lname,
  address,
  authKey
) {
  return {
    id,
    email,
    password,
    role,
    phone,
    fname,
    lname,
    address,
    authKey,
  };
}

// check why user id should be in string
// get all users
async function getAll() {
  const [allUserResults] = await db.query("SELECT * FROM users");

  return await allUserResults.map((userResult) =>
    newUser(
      userResult.user_id.toString(),
      userResult.user_email,
      userResult.user_password,
      userResult.user_role,
      userResult.user_phone,
      userResult.user_firstname,
      userResult.user_lastname,
      userResult.user_address,
      userResult.user_authKey
    )
  );
}

// get user by trainers
async function getUserByrole(role) {
  const [userResults] = await db.query(
    "SELECT * FROM users WHERE user_role=?",
    role
  );

  if (userResults.length > 0) {
    return Promise.resolve(
      userResults.map((result) =>
        newUser(
          result.user_id.toString(),
          result.user_email,
          result.user_password,
          result.user_role,
          result.user_phone,
          result.user_firstname,
          result.user_lastname,
          result.user_address,
          result.user_authKey
        )
      )
    );
  } else {
    return Promise.reject(`no results found with ${userID}`);
  }
}

// get user by id
async function getUserByID(userID) {
  const [results] = await db.query(
    "SELECT * FROM users WHERE user_id=?",
    userID
  );

  if (results.length > 0) {
    const userResult = results[0];
    return Promise.resolve(
      newUser(
        userResult.user_id,
        userResult.user_email,
        userResult.user_password,
        userResult.user_role,
        userResult.user_phone,
        userResult.user_firstname,
        userResult.user_lastname,
        userResult.user_address,
        userResult.user_authKey
      )
    );
  } else {
    return Promise.reject(`no results found with ${userID}`);
  }
}
getUserByID(8).then((result) => console.log(result));
async function getTrainerNameByID(userID) {
  const [results] = await db.query(
    "SELECT * FROM users WHERE user_id=? AND user_role='trainer'",
    userID
  );

  if (results.length > 0) {
    const userResult = results[0];
    return Promise.resolve(
      newUser(
        userResult.user_id,
        null,
        null,
        null,
        null,
        userResult.user_firstname,
        userResult.user_lastname,
        null,
        null
      )
    );
  } else {
    return Promise.reject(`no results found with ${userID}`);
  }
}

// get user by authenticationkey
async function getByAuthenticationKey(authenticationKey) {
  const [results] = await db.query("SELECT * FROM users WHERE user_authKey=?", [
    authenticationKey,
  ]);
  if (results.length > 0) {
    const userResult = results[0];
    return Promise.resolve(
      newUser(
        userResult.user_id,
        userResult.user_email,
        userResult.user_password,
        userResult.user_role,
        userResult.user_phone,
        userResult.user_firstname,
        userResult.user_lastname,
        userResult.user_address,
        userResult.user_authKey
      )
    );
  } else {
    return Promise.reject(`no results found with ${authenticationKey}`);
  }
}

// get user by email
async function getUserByEmail(email) {
  const [results] = await db.query("SELECT *FROM users WHERE user_email=?", [
    email,
  ]);
  if (results.length > 0) {
    const [userResult] = results;
    return Promise.resolve(
      newUser(
        userResult.user_id,
        userResult.user_email,
        userResult.user_password,
        userResult.user_role,
        userResult.user_phone,
        userResult.user_firstname,
        userResult.user_lastname,
        userResult.user_address,
        userResult.user_authKey
      )
    );
  } else {
    return Promise.reject(`Check your email or password!`);
  }
}

// create user
async function createUser(user) {
  delete user.id;

  return db
    .query(
      "INSERT INTO users ( user_email, user_password, user_role, user_phone, user_firstname, user_lastname, user_address) " +
        "VALUES (?, ?, ?, ?,?,?,?)",
      [
        user.email,
        user.password,
        user.role,
        user.phone,
        user.fname,
        user.lname,
        user.address,
      ]
    )
    .then(([result]) => {
      return { ...user, id: result.insertId };
    })
    .catch((error) => {
      console.log(error);
    });
}

// update user
async function updateUser(user) {
  return db
    .query(
      "UPDATE users SET " +
        "user_email = ?, " +
        "user_password = ?, " +
        "user_role = ?, " +
        "user_phone=?, " +
        "user_firstname = ?, " +
        "user_lastname = ?, " +
        "user_address=?, " +
        "user_authKey = ? " +
        "WHERE user_id = ?",
      [
        user.email,
        user.password,
        user.role,
        user.phone,
        user.fname,
        user.lname,
        user.address,
        user.authKey,
        user.id,
      ]
    )
    .then(([result]) => {
      return { ...user, id: result.insertId };
    });
}

// delete user by id
async function deleteUserByID(userID) {
  return db.query("DELETE FROM users WHERE user_id=?", userID);
}

module.exports = {
  newUser,
  getAll,
  getUserByrole,
  getUserByID,
  getTrainerNameByID,
  getByAuthenticationKey,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUserByID,
};
