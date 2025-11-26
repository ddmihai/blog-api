"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app/app"));
const db_1 = require("./app/config/db");
const initRegistration_1 = require("./utils/initRegistration");
const PORT = process.env.PORT || 3000;
app_1.default.listen(PORT, async () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    await (0, db_1.connectDB)();
    await (0, initRegistration_1.initRegistrationSettings)();
});
