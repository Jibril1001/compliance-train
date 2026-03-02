"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const userSchema = new Schema({
    name: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "employee"], required: true },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
}, { timestamps: true });
module.exports = model("User", userSchema);
//# sourceMappingURL=User.js.map