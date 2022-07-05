const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const blogRouter = require("./controllers/blogs");
const config = require("./utils/config");

mongoose.connect(config.DB_URI).then(() => {
  console.log("connected to MongoDb");
});

app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogRouter);
module.exports = app;
