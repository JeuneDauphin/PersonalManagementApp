import mongoose from 'mongoose';

const { Schema } = mongoose;

const recurrenceSchema = new Schema(
  {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
    interval: { type: Number, required: true, min: 1 },
    endDate: { type: Date },
    count: { type: Number, min: 1 },
  },
  { _id: false }
);

const calendarEventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isAllDay: { type: Boolean, default: false },
    type: { type: String, enum: ['meeting', 'deadline', 'appointment', 'reminder', 'personal'], required: true },
    location: { type: String, trim: true },
    attendees: { type: [String], default: [] }, // Contact IDs
    reminders: { type: [Number], default: [] }, // minutes
    recurrence: recurrenceSchema,
  },
  { timestamps: true, versionKey: false }
);

calendarEventSchema.index({ startDate: 1, endDate: 1 });
calendarEventSchema.index({ type: 1 });

export default mongoose.model('CalendarEvent', calendarEventSchema);
