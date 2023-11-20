const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuid4 } = require("uuid");
const auth = require("../middleware/auth.js");
const xml2js = require("xml2js");
const Users = require("../models/user.js");
const validator = require("validator");

const userController = express.Router();

// user login
userController.post("/users/login", (req, res) => {
  let loginData = req.body;

  Users.getUserByEmail(loginData.email)
    .then((user) => {
      if (bcrypt.compareSync(loginData.password, user.password)) {
        user.authKey = uuid4().toString();

        Users.updateUser(user)
          .then((result) => {
            res.status(200).json({
              status: 200,
              message: "Successfully logged in!",
              authenticationKey: user.authKey,
            });
          })
          .catch((error) => console.log(error));
      } else {
        res.status(400).json({
          status: 400,
          message: "Invalid credentials",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        status: 500,
        message: `Login failed: ${error}`,
      });
    });
});

// user logout
userController.post("/users/logout", (req, res) => {
  const authenticationKey = req.get("X-AUTH-KEY");

  Users.getByAuthenticationKey(authenticationKey)
    .then((user) => {
      user.authKey = null;
      Users.updateUser(user)
        .then((user) => {
          res.status(200).json({
            status: 200,
            message: "Logged out",
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({
            status: 500,
            message: "Failed to logout",
          });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "Failed to logout",
      });
    });
});

// get all users
userController.get("/users", auth(["customer", "trainer"]), (req, res) => {
  Users.getAll().then((users) => {
    res.status(200).json({
      status: 200,
      message: "Found all users",
      users: users,
    });
  });
});

//get user by user ID // check use info and only check their personal information
//-> however I am using this endpoint in the booking page. it does not affect on the page?
// I can make another endpoint for booking only getting trainer ID

userController.get("/users/:id", auth(["customer", "trainer"]), (req, res) => {
  const userID = req.params.id;
  const authenticationKey = req.get("X-AUTH-KEY");
  Users.getByAuthenticationKey(authenticationKey).then((user) => {
    const loggedinUser = user.id;
    if (loggedinUser === userID) {
      Users.getUserByID(userID)
        .then((user) => {
          res.status(200).json({
            status: 200,
            message: "Found user by ID",
            user: user,
          });
        })
        .catch((error) => {
          res.status(500).json({
            status: 500,
            message: `Failed to user by ID/ ${error}`,
          });
        });
    }
  });

  Users.getUserByID(userID)
    .then((user) => {
      res.status(200).json({
        status: 200,
        message: "Found user by ID",
        user: user,
      });
    })
    .catch((error) => {
      res.status(500).json({
        status: 500,
        message: `Failed to user by ID/ ${error}`,
      });
    });
});

userController.get(
  "/users/trainers/:id",
  auth(["customer", "trainer"]),
  (req, res) => {
    const userID = req.params.id;
    Users.getTrainerNameByID(userID)
      .then((user) => {
        res.status(200).json({
          status: 200,
          message: "Found user by ID",
          user: user,
        });
      })
      .catch((error) => {
        res.status(500).json({
          status: 500,
          message: `Failed to user by ID/ ${error}`,
        });
      });
  }
);
//get user by role
userController.get("/users/role/:role", auth(["trainer"]), (req, res) => {
  const role = req.params.role;
  Users.getUserByrole(role)
    .then((user) => {
      res.status(200).json({
        status: 200,
        message: "Found user by role",
        user: user,
      });
    })
    .catch((error) => {
      res.status(500).json({
        stats: 500,
        message: `Failed to user by role/ ${error}`,
      });
    });
});

// get user by authkey
userController.get("/users/key/:authenticationKey", (req, res) => {
  const authenticationKey = req.params.authenticationKey;
  Users.getByAuthenticationKey(authenticationKey)
    .then((user) => {
      res.status(200).json({
        status: 200,
        messaage: "found user by authentication key",
        user: user,
      });
    })
    .catch((error) =>
      res.status(500).json({
        status: 500,
        message: `Failed to get user by authentication key / ${error}`,
      })
    );
});

//Register user
userController.post("/users/register", (req, res) => {
  const userData = req.body;
  if (!/[a-zA-Z-]{2,}/.test(userData.fname)) {
    res.status(400).json({
      status: 400,
      message: "Invalid first name",
    });
    return;
  }

  if (!/[a-zA-Z-]{2,}/.test(userData.lname)) {
    res.status(400).json({
      status: 400,
      message: "Invalid last name",
    });
    return;
  }

  if (!/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(userData.phone)) {
    res.status(400).json({
      status: 400,
      message: "Invalid phone name",
    });
    return;
  }

  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userData.email)) {
    res.status(400).json({
      status: 400,
      message: "Invalid email ",
    });
    return;
  }

  if (!userData.password) {
    res.status(400).json({
      status: 400,
      message: "Invalid password ",
    });
    return;
  } else {
    userData.password = bcrypt.hashSync(userData.password);
  }

  const validatedUser = Users.newUser(
    null,
    validator.escape(userData.email),
    userData.password,
    "customer",
    validator.escape(userData.phone),
    validator.escape(userData.fname),
    validator.escape(userData.lname),
    validator.escape(userData.address),
    null
  );

  Users.createUser(validatedUser)
    .then((createdUser) => {
      res.status(200).json({
        status: 200,
        message: "Created user",
        user: createdUser,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: `Failed to create user /${error}`,
        user: validatedUser,
      });
    });
});

// what is difference between regigster and create user?
userController.post("/users", auth(["trainer"]), (req, res) => {
  const userData = req.body.user;
  // console.log(userData);
  if (!userData.password.startsWith("$2a")) {
    userData.password = bcrypt.hashSync(userData.password);
  }

  const user = Users.newUser(
    null,
    userData.email,
    userData.password,
    userData.role,
    userData.phone,
    userData.fname,
    userData.lname,
    userData.address,
    null
  );

  Users.createUser(user)
    .then((createdUser) => {
      res.status(200).json({
        status: 200,
        message: "Created user",
        user: createdUser,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: `Failed to create user /${error}`,
        user: user,
      });
    });
});

// update user
userController.patch("/users", auth(["customer", "trainer"]), (req, res) => {
  const userData = req.body.user;

  if (!/[a-zA-Z-]{2,}/.test(userData.fname)) {
    res.status(400).json({
      status: 400,
      message: "Invalid first name",
    });
    return;
  }

  if (!/[a-zA-Z-]{2,}/.test(userData.lname)) {
    res.status(400).json({
      status: 400,
      message: "Invalid last name",
    });
    return;
  }

  if (!/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(userData.phone)) {
    res.status(400).json({
      status: 400,
      message: "Invalid phone name",
    });
    return;
  }

  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userData.email)) {
    res.status(400).json({
      status: 400,
      message: "Invalid email ",
    });
    return;
  }
  if (!userData.password.startsWith("$2a")) {
    userData.password = bcrypt.hashSync(userData.password);
  }

  const validatedUser = Users.newUser(
    userData.id,
    validator.escape(userData.email),
    userData.password,
    validator.escape(userData.role),
    validator.escape(userData.phone),
    validator.escape(userData.fname),
    validator.escape(userData.lname),
    userData.address,
    userData.authenticationKey
  );

  Users.updateUser(validatedUser)
    .then((user) => {
      res.status(200).json({
        status: 200,
        message: "Updated user",
        user: user,
      });
    })
    .catch((error) => {
      res.status(500).json({
        status: 500,
        message: `Failed to update user / ${error}`,
      });
    });
});

//delete user
userController.delete("/users/:id", auth(["traniner"]), (req, res) => {
  const userID = req.params.id;
  Users.deleteUserByID(userID)
    .then((user) => {
      res.status(200).json({
        status: 200,
        message: "Deleted User by ID",
      });
    })
    .catch((error) => {
      res.status(500).json({
        status: 500,
        message: "Failed to delete user by ID",
      });
    });
});

//xml
userController.post(
  "/users/upload/xml",
  auth(["trainer"]),
  async (req, res) => {
    if (req.files && req.files["xml-file"]) {
      const XMLFile = req.files["xml-file"];
      const file_text = XMLFile.data.toString();

      const parser = new xml2js.Parser();
      try {
        const data = await parser.parseStringPromise(file_text);
        const trainerUpload = data["trainer-upload"];
        const trainerUploadAttributes = trainerUpload["$"];
        const operation = trainerUploadAttributes["operation"];

        const trainersData = trainerUpload["trainers"][0]["trainer"];
        const [keys] = Object.keys(data);

        if (operation === "insert") {
          Promise.all(
            trainersData.map((trainerData) => {
              const trainerModel = Users.newUser(
                null,
                trainerData.email.toString(),
                bcrypt.hashSync(trainerData.password.toString()),
                "trainer",
                trainerData.phone.toString(),
                trainerData.firstname.toString(),
                trainerData.lastname.toString(),
                trainerData.address.toString()
              );
              return Users.createUser(trainerModel);
            })
          )
            .then((results) => {
              res.status(200).json({
                results: keys,
                status: 200,
                message: "uploaded successfully",
              });
            })
            .catch((error) => {
              res.status(500).json({
                status: 500,
                error: error,
                message: "XML upload failed on database operation",
              });
            });
        } else {
          res.status(400).json({
            status: 400,
            error: error,
            message: "Invalid operation. Only 'insert' operation is supported.",
          });
        }
      } catch (error) {
        res.status(400).json({
          status: 400,
          error: error,
          message: "Failed on uploading file. Please check the file Name",
        });
      }
    } else {
      res.status(400).json({
        status: 400,
        message: "XML file not provided.",
      });
    }
  }
);
module.exports = userController;

// const array = [1, 2, 3];
// array.map((num) => console.log(`map ${num}`));
