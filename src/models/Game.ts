// src/models/Game.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface GameMission extends Document {
  mission: Types.ObjectId;
  assignedTo: Types.ObjectId;
  status: 'pending' | 'success' | 'fail';
}

export interface GameDocument extends Document {
  name: string;
  code: string;
  owner?: Types.ObjectId;
  players: Types.ObjectId[];
  maxPlayers: number;
  status: 'pending' | 'active' | 'finished' | 'deleted';
  missions: GameMission[];
  missionsToAssign: number;
  missionsToWin: number;
  winners: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const GameMissionSchema = new Schema<GameMission>({
  mission: { type: Schema.Types.ObjectId, ref: 'Mission', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'success', 'fail'], default: 'pending' },
});

const GameSchema = new Schema<GameDocument>(
  {
    name: { type: String },
    code: { type: String, unique: true, required: true },
    maxPlayers: { type: Number, default: 10 },
    players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['pending', 'active', 'finished', 'deleted'],
      default: 'pending',
    },
    missions: [GameMissionSchema],
    missionsToAssign: { type: Number, default: 6 },
    missionsToWin: { type: Number, default: 3 },
    winners: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

const GameModel = mongoose.model<GameDocument>('Game', GameSchema);
export default GameModel;
