import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // usernames must be unique
  },
  password: {
    type: String,
    required: true,
  },
});

// Export model
const User = mongoose.model("User", userSchema);

export default User;
