import { GameDocument, GameMission } from '../models/Game';
import MissionModel from '../models/Mission';

export async function assignMissions(game: GameDocument, toUser?: string): Promise<GameMission[]> {
  // Asignar misiones aleatorias únicas a cada jugador
  // const generalMissions = await MissionModel.find({ type: { $in: game.allowedMissionTypes } });
  const usedMissionIds = new Set();

  const size = toUser ? game.missionsToAssign : game.missionsToAssign * game.players.length
  const missions = await MissionModel.aggregate([
    {
      $match: {
        type: { $in: game.allowedMissionTypes }
      }
    },
    {
      $sample: { size: size }
    }
  ]);

  if (toUser) {
    const playerMissions = [];
    while (playerMissions.length < game.missionsToAssign) {
      const candidate = missions[Math.floor(Math.random() * missions.length)];
      if (!usedMissionIds.has(candidate._id.toString())) {
        playerMissions.push(preparePlayerMission(candidate._id, toUser));
        usedMissionIds.add(candidate._id.toString());
      }
    }
    game.missions.push(...playerMissions)
    return game.missions
  }

  for (const playerId of game.players) {
    const playerMissions = [];
    while (playerMissions.length < game.missionsToAssign) {
      const candidate = missions[Math.floor(Math.random() * missions.length)];
      if (!usedMissionIds.has(candidate._id.toString())) {
        playerMissions.push(preparePlayerMission(candidate._id, playerId.toString()));
        usedMissionIds.add(candidate._id.toString());
      }
    }

    game.missions.push(...playerMissions);
  }
  return game.missions
}


function preparePlayerMission(mid: string, uid: string) {
  return {
    mission: mid,
    assignedTo: uid,
    status: 'pending',
  } as unknown as GameMission
}