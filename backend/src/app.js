const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");

const app = express();

const authRouter = require("./routes/auth");
const placeRouter = require("./routes/place");
const guideRouter = require("./routes/guide");
const bookingRouter = require("./routes/booking");
const reviewRouter = require("./routes/review");

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", placeRouter);
app.use("/", guideRouter);
app.use("/", bookingRouter);
app.use("/", reviewRouter);

connectDB()
  .then(() => {
    app.listen(7777, () => {
      console.log("Server is running on port 7777");
    });
  })
  .catch((err) => {
    console.log("Database Connection Failed");
    console.error(err);
  });