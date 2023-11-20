const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const port = process.env.PORT || 8000;
const app = express();

app.use(
  cors({
    // Allow all origins
    origin: true,
  })
);

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

app.use(express.json());

const userController = require("./controllers/users.js");
app.use(userController);

const classController = require("./controllers/class.js");
app.use(classController);

const bookingController = require("./controllers/booking.js");
app.use(bookingController);

const blogController = require("./controllers/blog.js");
app.use(blogController);

const locationController = require("./controllers/location.js");
app.use(locationController);

const activityController = require("./controllers/activity.js");
app.use(activityController);

app.listen(port, () => console.log(`Express started on http://localhost:8080`));
