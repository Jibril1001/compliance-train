const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const trainingSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("Training", trainingSchema);