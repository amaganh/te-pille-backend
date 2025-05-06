import { GameDocument, GameMission } from '../models/Game';
import MissionModel from '../models/Mission';

export async function assignMissions(game: GameDocument):Promise<GameMission[]> {
  // Asignar misiones aleatorias únicas a cada jugador
  const generalMissions = await MissionModel.find({});
  const usedMissionIds = new Set();

  for (const playerId of game.players) {
    const playerMissions = [];

    while (playerMissions.length < game.missionsToAssign) {
      const candidate = generalMissions[Math.floor(Math.random() * generalMissions.length)];
      if (!usedMissionIds.has(candidate._id.toString())) {
        playerMissions.push({
          mission: candidate._id,
          assignedTo: playerId,
          status: 'pending',
        } as GameMission);
        usedMissionIds.add(candidate._id.toString());
      }
    }

    game.missions.push(...playerMissions);
  }
  return game.missions
}
