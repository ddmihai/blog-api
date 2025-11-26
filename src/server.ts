import dotenv from "dotenv";
dotenv.config();

import app from "./app/app";
import { connectDB } from "./app/config/db";
import { initRegistrationSettings } from "./utils/initRegistration";

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    await connectDB();
    await initRegistrationSettings();
});
