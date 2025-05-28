import User from "../models/auth.models.js";
import FriendRequest from "../models/friendRequest.model.js";

export const getRecomendedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
      ],
    });

    res.status(200).json({
      success: true,
      recommendedUsers,
    });
  } catch (error) {
    console.log("Error in getRecommendedUser controllers", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullname profilePic nativeLanguage learningLanguage"
      );

    res.status(200).json({
      success: true,
      user: user.friends,
    });
  } catch (error) {
    console.log("Error in getMyFriends controllers", error.message);
    res.status(500).json({
      message: "Interval server error",
      success: false,
    });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // prevent sending request to yourself
    if (myId === recipientId) {
      return res.status(400).json({
        message: "You cannot send a friend request to yourself",
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        message: "Recipient not found",
      });
    }

    // check if user is already friends
    if (recipient.friends.includes(myId)) {
      return res.status(400).json({
        message: "You are already friends with this user",
      });
    }

    // check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        {
          sender: myId,
          recipient: recipientId,
        },
        {
          sender: recipientId,
          recipient: myId,
        },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exist between you and this user",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(200).json(friendRequest);
  } catch (error) {
    console.log("Error in sendFriendRequest controller", error.message);
    res.status(404).josn({
      success: false,
      message: "Internal server error",
    });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return req
        .status(403)
        .json({ message: "you are not authorized to accept the request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the others friend array
    // $addToSet => adds elements to an array only if they do not already exist
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    return res.status(200).json({
      message: "Friend request accepted",
    });
  } catch (error) {
    console.log("Error in acceptFriendRequest controllers", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getFriendRequest = async (req, res) => {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullname profilePic nativeLanguage learningLanguage "
    );

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullname profilePic");

    res.status(200).json({
      incomingReqs,
      acceptedReqs,
    });
  } catch (error) {
    console.log("Error in getPendingReqests controllers", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOutgoingFriendReqs = async (req, res) => {
  try {
    const outgoingReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullname profilePic nativeLanguage learningLanguage"
    );

    res.status(200).json({ users: outgoingReqs });
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
