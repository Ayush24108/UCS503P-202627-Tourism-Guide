const express = require("express");
const connectDB = require("./config/database");

const app = express();

const authRouter = require("./routes/auth");
const placeRouter = require("./routes/place");
const guideRouter = require("./routes/guide");
const bookingRouter = require("./routes/booking");
const reviewRouter = require("./routes/review");

app.use("/api", authRouter);
app.use("/api", placeRouter);
app.use("/api", guideRouter);
app.use("/api", bookingRouter);
app.use("/api", reviewRouter);

connectDB()
  .then(() => {
    console.log("Database Connected Successfully");

    app.listen(7777, () => {
      console.log("Server is running on port 7777");
    });
  })
  .catch((err) => {
    console.log("Database Connection Failed");
    console.error(err);
  });