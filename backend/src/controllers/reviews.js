import mongoose from "mongoose";
import { Review } from "../models/reviews.js";
import { User } from "../models/user.js";

const reviewTargetTypes = ["destination", "hotel", "tour"];

const getMongoDbUserId = async (req) => {
  if (req.user?._id) {
    return req.user._id;
  }

  if (!req.user?.uid) {
    return null;
  }

  const user = await User.findOne({ firebaseUid: req.user.uid }).select("_id");
  return user?._id ?? null;
};

const isValidTarget = (targetType, targetId) => {
  return (
    reviewTargetTypes.includes(targetType) &&
    typeof targetId === "string" &&
    mongoose.Types.ObjectId.isValid(targetId)
  );
};

export const createReview = async (req, res, next) => {
  const { targetType, targetId, rating, comment } = req.body ?? {};

  if (
    !targetType ||
    !targetId ||
    rating === undefined ||
    rating === null ||
    typeof comment !== "string" ||
    comment.trim() === ""
  ) {
    return res.status(400).json({
      status: false,
      message: "targetType, targetId, rating, and comment are required.",
    });
  }

  if (!isValidTarget(targetType, targetId)) {
    return res.status(400).json({
      status: false,
      message: "targetType or targetId is invalid.",
    });
  }

  if (typeof rating !== "number" || !Number.isFinite(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      status: false,
      message: "rating must be a number between 1 and 5.",
    });
  }

  try {
    const userId = await getMongoDbUserId(req);
    if (!userId) {
      return res.status(404).json({
        status: false,
        message: "User profile not found. Sync your account before reviewing.",
      });
    }

    const review = await Review.create({
      user: userId,
      targetType,
      targetId,
      rating,
      comment,
    });

    return res.status(201).json({ status: true, review });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "You have already reviewed this item",
      });
    }

    return next(error);
  }
};

export const getReviewsForTarget = async (req, res, next) => {
  const targetType = req.params.targetType ?? req.query.targetType;
  const targetId = req.params.targetId ?? req.query.targetId;

  if (!targetType || !targetId) {
    return res.status(400).json({
      status: false,
      message: "targetType and targetId are required.",
    });
  };

  if (!isValidTarget(targetType, targetId)) {
    return res.status(400).json({
      status: false,
      message: "targetType or targetId is invalid.",
    });
  }

  try {
    const reviews = await Review.find({ targetType, targetId })
      .sort({ createdAt: -1 })
      .populate("user", "displayName email");

    return res.status(200).json({ status: true, reviews });
  } catch (error) {
    return next(error);
  }
}