const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "user name required"],
    minlength: [3, "user name must be at least 3 character logn"],
    unique: [true, "user name must be unique"],
  },
  name: String,
  passwordHash: {
    type: String,
    required: [true, "password is required"],
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  ],
});
userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
