import mongoose, { Schema, Document } from 'mongoose';

export interface Mission extends Document {
  name: string;
  type: string;
  package: string;
}

const missionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true, default: 'general' },
    package: { type: String, required: true, default: 'initial' },
  },
  { timestamps: true }
);

const MissionModel = mongoose.model<Mission>('Mission', missionSchema);

export default MissionModel;