import mongoose, { Document, Model } from "mongoose";

export interface IRegistrationSettings extends Document {
    allowRegistration: boolean;
    updatedBy?: mongoose.Types.ObjectId; // admin user id (optional)
    updatedAt: Date;
}

const registrationSettingsSchema = new mongoose.Schema<IRegistrationSettings>(
    {
        allowRegistration: {
            type: Boolean,
            required: true,
            default: false, // default: registration is open
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: { createdAt: false, updatedAt: true }, // only care about updatedAt
    }
);



// Optional: ensure there is only one settings document
registrationSettingsSchema.index({}, { unique: true });

const RegistrationSettings: Model<IRegistrationSettings> =
    mongoose.model<IRegistrationSettings>("RegistrationSettings", registrationSettingsSchema);

export default RegistrationSettings;
