const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function userRegisterController(req, res) {
  const { email, password, name } = req.body;
  console.log("req", email);

  const isEmailExists = await userModel.findOne({ email });

  console.log("isEmailExists", isEmailExists);

  if (isEmailExists) {
    return res.status(422).json({
      message: "User already exists with email",
      status: "failed",
    });
  }

  const user = await userModel.create({
    email,
    name,
    password,
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token);

  res.status(201).json({
    message: "User created successfully",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
  });
}

async function userLoginController(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    res.status(401).json({ message: "Email or password is invalid !" });
  }

  const isValidPassword =await user.comparePassword(password);

  if (!isValidPassword) {
    res.status(401).json({ message: "Email or password is invalid !" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token);

  res.status(200).json({
    message: "User logged in successfully",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
  });
}

module.exports = { userRegisterController,userLoginController };
