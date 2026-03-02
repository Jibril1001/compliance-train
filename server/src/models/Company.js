"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const companySchema = new Schema({
    name: { type: String, required: true },
}, { timestamps: true });
module.exports = model("Company", companySchema);
//# sourceMappingURL=Company.js.map