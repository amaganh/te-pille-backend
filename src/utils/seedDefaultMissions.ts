// import fs from 'fs';
// import path from 'path';
import MissionModel from '../models/Mission';
import { missions } from './missions';

export const seedDefaultMissions = async () => {
  const count = await MissionModel.countDocuments();

  if (count === 0) {
    // const filePath = path.join(__dirname, './defaultMissions.json');
    // const raw = fs.readFileSync(filePath, 'utf-8');
    // const missions = JSON.parse(raw);
    console.log(`[ℹ] ${missions.length} can be inserted.`);
    try{
      await MissionModel.insertMany(missions);
      console.log(`[✔] ${missions.length} default missions inserted.`);
    }
    catch(err){
      console.error(err)
    }
  } else {
    console.log(`[ℹ] ${count} missions already exist, skipping seed.`);
  }
};
