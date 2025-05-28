import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    acceptFriendRequest,
  getFriendRequest,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecomendedUsers,
  sendFriendRequest,
} from "../controllers/user.controller.js";

const router = express.Router();

//apply auth middleware to all the routes
router.use(protectRoute);

router.get("/", getRecomendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequest);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
// router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

export default router;
