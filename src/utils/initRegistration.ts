import RegistrationSettings from "../app/models/permission.model";



export async function initRegistrationSettings() {
    try {
        const existing = await RegistrationSettings.findOne();

        if (!existing) {
            // choose your default here: true = allow registrations on fresh app
            const created = await RegistrationSettings.create({
                allowRegistration: false, // or false if you want closed by default
            });

            console.log(
                `✅ RegistrationSettings created with allowRegistration=${created.allowRegistration}`
            );
        } else {
            console.log(
                `ℹ️ RegistrationSettings already exists (allowRegistration=${existing.allowRegistration})`
            );
        }
    } catch (err) {
        console.error("❌ Failed to initialize RegistrationSettings:", err);
        // don't exit the process here: you can still run without this, or you can choose to exit if it's critical
    }
}
