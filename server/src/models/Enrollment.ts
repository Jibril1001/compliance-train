const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const enrollmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainingId: {
      type: Schema.Types.ObjectId,
      ref: "Training",
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "completed"],
      default: "assigned",
    },
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = model("Enrollment", enrollmentSchema);