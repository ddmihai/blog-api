"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const registrationSettingsSchema = new mongoose_1.default.Schema({
    allowRegistration: {
        type: Boolean,
        required: true,
        default: false, // default: registration is open
    },
    updatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: { createdAt: false, updatedAt: true }, // only care about updatedAt
});
// Optional: ensure there is only one settings document
registrationSettingsSchema.index({}, { unique: true });
const RegistrationSettings = mongoose_1.default.model("RegistrationSettings", registrationSettingsSchema);
exports.default = RegistrationSettings;
