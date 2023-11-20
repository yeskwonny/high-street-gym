const express = require("express");
const xml2js = require("xml2js");
const Classes = require("../models/class.js");
const auth = require("../middleware/auth.js");

const classController = express.Router();

classController.get("/classes", async (req, res) => {
  try {
    const classes = await Classes.getAllClasses();
    if (!classes) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request: Invalid request or data",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Get all classes",
      classes: classes,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error: Something went wrong",
      error: error.message,
    });
  }
});

classController.get(
  "/classes/:day",
  auth(["customer", "trainer"]),
  async (req, res) => {
    try {
      const day = req.params.day;
      const classes = await Classes.getClassesByDay(day);

      if (!classes) {
        return res.status(400).json({
          status: 400,
          message: "Bad Request: Invalid request or data",
        });
      }
      res.status(200).json({
        status: 200,
        message: "Get all classes by day",
        classes: classes,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: `Could not get data by day ${error}`,
        error: error.message,
      });
    }
  }
);

classController.get(
  "/classes/id/:classID",
  auth(["customer", "trainer"]),
  async (req, res) => {
    try {
      const classID = req.params.classID;
      const classes = await Classes.getClassByID(classID);

      if (!classes) {
        return res.status(400).json({
          status: 400,
          message: "Bad Request: Invalid request or data",
        });
      }
      res.status(200).json({
        status: 200,
        message: "Get all classes by id",
        classes: classes,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: `Cannot get data by id ${error}`,
        error: error.message,
      });
    }
  }
);

classController.get(
  "/classes/:activityID/:day",
  auth(["customer", "trainer"]),
  async (req, res) => {
    try {
      const day = req.params.day;
      const activityID = req.params.activityID;
      const classes = await Classes.getClassesByDayandName(day, activityID);

      if (!classes) {
        return res.status(400).json({
          status: 400,
          message: "Bad Request: Invalid request or data",
        });
      }
      res.status(200).json({
        status: 200,
        message: "Get all classes by day",
        classes: classes,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error: Something went wrong",
        error: error.message,
      });
    }
  }
);

// XML
classController.post(
  "/classes/upload/xml",
  auth(["trainer"]),
  async (req, res) => {
    if (req.files && req.files["xml-file"]) {
      const XMLFile = req.files["xml-file"];
      const file_text = XMLFile.data.toString();

      const parser = new xml2js.Parser();
      try {
        const data = await parser.parseStringPromise(file_text);
        const classUpload = data["class-upload"];
        const classUploadAttributes = classUpload["$"];
        const operation = classUploadAttributes["operation"];
        const classesData = classUpload["classes"][0]["class"];
        const [keys] = Object.keys(data);

        if (operation === "insert") {
          Promise.all(
            classesData.map((classData) => {
              const classModel = Classes.newClasses(
                null,
                classData.time.toString(),
                classData.locationId.toString(),
                classData.activityId.toString(),
                classData.trainerId.toString(),
                classData.day.toString()
              );
              return Classes.createClass(classModel);
            })
          )
            .then((results) => {
              res.status(200).json({
                results: keys,
                status: 200,
                message: "Uploaded successfully",
              });
            })
            .catch((error) => {
              res.status(500).json({
                status: 500,
                message: "XML upload failed on database operation - " + error,
              });
            });
        } else {
          res.status(400).json({
            status: 400,
            message: "Invalid operation. Only 'insert' operation is supported.",
          });
        }
      } catch (error) {
        res.status(400).json({
          status: 400,
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

module.exports = classController;
