const userRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

userRouter.get("/", async (request, response, next) => {
  try {
    const users = await User.find().populate("blogs", {
      title: 1,
      url: 1,
      author: 1,
    });
    response.json(users);
  } catch (error) {
    next(error);
  }
});
userRouter.post("/", async (request, response, next) => {
  const { username, name, password } = request.body;
  if (!username || !password) {
    response.status(400).json({ error: " user name or password is required" });
  } else if (password.length < 3) {
    response
      .status(400)
      .json({ error: "Password must be at least 3 character" });
  } else {
    try {
      const saltRound = 10;
      const passwordHash = await bcrypt.hash(password, saltRound);
      const user = new User({
        username,
        name,
        passwordHash,
      });
      const result = await user.save();
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
});
module.exports = userRouter;
