import User from "../models/auth.models.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../utils/stream.js";

export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(404).json({
        success: false,
        message: "password must be at least 6 character",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email formate",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exist in the database",
      });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar-placeholder.iran.liara.run/${idx}.png`;

    const newUser = await User.create({
      fullname,
      email,
      password,
      profilePic: randomAvatar,
    });

    try {
      // stream client
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullname,
        image: newUser.profilePic || "",
      });

      console.log(`Stream user created for ${newUser.fullname}`);
    } catch (error) {
      console.log("Error creating stram user", error);
    }

    const token = jwt.sign(
      {
        userId: newUser._id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "user registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "Signup failed",
    });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(404).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "Login successfully",
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: "Login failed",
    });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "Logout failed",
    });
  }
};

export const me = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const onboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullname, bio, nativeLanguage, learningLanguage, location } =
      req.body;

    if (
      !fullname ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
        missingFields: [
          !fullname && fullname,
          !bio && bio,
          !nativeLanguage && nativeLanguage,
          !learningLanguage && learningLanguage,
          !location && location,
        ].filter(Boolean),
      });
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updateUser) {
      return res.status(401).json({
        success: false,
        message: "Use not updated",
      });
    }

    // update the user into the stream
    try {
      await upsertStreamUser({
        id: updateUser._id.toString(),
        name: updateUser.fullname,
        image: updateUser.profilePic || "",
      });
      console.log(
        `Stream user updated after onboarding for ${updateUser.fullname}`
      );
    } catch (streamError) {
      console.log(
        "Error updating Stream user during onboarding: ",
        streamError.message
      );
    }

    res.status(200).json({
      success: true,
      message: "user updated",
      user: updateUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: "Onbarding failed",
    });
  }
};
