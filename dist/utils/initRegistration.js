"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRegistrationSettings = initRegistrationSettings;
const permission_model_1 = __importDefault(require("../app/models/permission.model"));
async function initRegistrationSettings() {
    try {
        const existing = await permission_model_1.default.findOne();
        if (!existing) {
            // choose your default here: true = allow registrations on fresh app
            const created = await permission_model_1.default.create({
                allowRegistration: false, // or false if you want closed by default
            });
            console.log(`✅ RegistrationSettings created with allowRegistration=${created.allowRegistration}`);
        }
        else {
            console.log(`ℹ️ RegistrationSettings already exists (allowRegistration=${existing.allowRegistration})`);
        }
    }
    catch (err) {
        console.error("❌ Failed to initialize RegistrationSettings:", err);
        // don't exit the process here: you can still run without this, or you can choose to exit if it's critical
    }
}
