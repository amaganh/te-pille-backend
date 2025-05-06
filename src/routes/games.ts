import express from 'express';
import GameModel, { GameDocument } from '../models/Game';
import { checkUser } from '../utils/checkUser';
import { seedDefaultMissions } from '../utils/seedDefaultMissions';
import MissionModel, { Mission } from '../models/Mission';
import { assignMissions } from '../utils/assignMissions';
import { User } from '../models/User';
import { mongoGameToApiFormat } from '../utils/mongoGameToApiFormat';

const router = express.Router();

// Crear juego nuevo
router.post('/new', async (req, res) => {
  const { name, userId } = req.body;

  const user = await checkUser(userId);
  if (!user) return res.status(500).json({ error: 'User not allowed', data: req.body });

  try {
    const gameCode = Math.random().toString(36).substr(2, 6); // Generamos un código aleatorio de 6 caracteres

    const game = new GameModel({
      owner: user,
      name,
      code: gameCode,
      players: [user], // Asumiendo que jugadores son un array de nombres
      missions: [],
      status: 'pending',
    });

    await game.save();
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// router.post('/start/:id', async (req, res) => {
//   const gameId = req.params.id;
//   const { userId } = req.body;

//   const user = await checkUser(userId);
//   if (!user) return res.status(500).json({ error: 'User not allowed', data: req.body });

//   try {
//     const game = await GameModel.findById(gameId);
//     if (!game || game?.owner?.toString() !== user._id.toString())
//       return res.status(404).json({ error: 'Game not found or user not authorized' });

//     // Verificamos si el juego ya está activo
//     if (game.status !== 'pending') {
//       return res.status(400).json({ error: 'Game already started or finished' });
//     }

//     const all_missions = await MissionModel.find();
//     if (!all_missions.length) {
//       await seedDefaultMissions();
//     }

//     if (game.status === 'pending') {
//       // Asignar misiones aleatorias únicas a cada jugador
//       const generalMissions = await MissionModel.find({});
//       const usedMissionIds = new Set();

//       for (const playerId of game.players) {
//         const playerMissions = [];

//         while (playerMissions.length < game.missionsToAssign) {
//           const candidate = generalMissions[Math.floor(Math.random() * generalMissions.length)];
//           if (!usedMissionIds.has(candidate._id.toString())) {
//             playerMissions.push({
//               mission: candidate._id,
//               assignedTo: playerId,
//               status: 'pending',
//             } as GameMission);
//             usedMissionIds.add(candidate._id.toString());
//           }
//         }

//         game.missions.push(...playerMissions);
//       }

//       game.status = 'active';
//       await game.save();
//     }

//     res.json(game);
//   } catch (err) {
//     res.status(500).json({ error: 'Error starting the game' });
//   }
// });
router.post('/status/:id', async (req, res) => {
  const gameId = req.params.id;
  const { userId, status } = req.body;

  if (!['pending', 'active', 'finished', 'deleted'].includes(status))
    return res.status(400).json({ error: 'Status not allowed: ' + status });

  try {
    const user = await checkUser(userId);
    if (!user) return res.status(500).json({ error: 'User not allowed' });

    const game = await GameModel.findById(gameId);
    if (!game || game?.owner?.toString() !== user._id.toString())
      return res.status(404).json({ error: 'Game not found or user not authorized' });

    // Verificamos si el juego ya está en ese esado
    if (game.status === status) {
      return res.status(400).json({ error: 'Game already ' + status });
    }

    if (status === 'active') {
      const all_missions = await MissionModel.find();
      if (!all_missions.length) await seedDefaultMissions();
      if (!game.missions.length) {
        const missions = await assignMissions(game);
        game.missions = missions
      }
    }

    game.status = status;

    await game.save();

    res.json(game);
  } catch (err) {
    res.status(500).json({ error: 'Error starting the game' });
  }
});

// Obtener juegos
// router.get('/', async (req, res) => {
//   const games = await GameModel.find({ status: { $ne: 'deleted' } });
//   res.json(games);
// });

// Obtener juego por ID
router.post('/:id', async (req, res) => {
  const { userId } = req.body;
  const game = await GameModel.findById(req.params.id).populate('winners').populate('players').populate({
    path: 'missions', // Popula el array de misiones
    populate: {
      path: 'mission', // Dentro de cada GameMission, popula la referencia a la Mission
      model: 'Mission', // Especifica el modelo de la referencia
    },
  });
  if (!game) return res.status(404).json({ error: 'Not found' });


  res.json(mongoGameToApiFormat(game as unknown as GameDocument, userId));
});

// cambiar estado misión
router.put('/:gameId/mission', async (req, res) => {
  const { gameId } = req.params;
  const { status, userId, missionId } = req.body;

  if (!['pending', 'success', 'fail'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const game = await GameModel.findById(gameId)
    if (!game) return res.status(404).json({ error: 'Game not found' });

    if (game.status !== 'active')
      return res.status(404).json({ error: 'El juego no esta activo' });


    const missionEntry = game.missions.find(
      (m) => m.mission._id.toString() === missionId && m.assignedTo?.toString() === userId
    );

    if (!missionEntry) {
      return res.status(404).json({ error: 'Mission not found for this player in this game' });
    }

    missionEntry.status = status;

    // Verificamos si el jugador alcanza el número necesario de misiones exitosas
    const playerSuccessCount = game.missions.filter(
      (m) => m.assignedTo?.toString() === userId && m.status === 'success'
    ).length;

    // add or remove from winner list
    const hasWon = game.winners.map(String).includes(userId);
    if (playerSuccessCount >= game.missionsToWin) {
      if (!hasWon) game.winners.push(userId);
    } else if (hasWon) game.winners = game.winners.filter((w) => w._id !== userId);

    await game.save();
    res.json({ message: 'Mission status updated', updatedMission: missionEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user missions from specific game
// router.get('/:gameId/missions', async (req, res) => {
//   const { gameId } = req.params;
//   const { userId } = req.body;

//   try {
//     const game = await GameModel.findById(gameId);
//     if (!game) return res.status(404).json({ error: 'Game not found' });

//     const missions = game.missions.filter((m) => m.assignedTo?.toString() === userId);

//     res.json({ missions });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Soft delete
// router.delete('/:id', async (req, res) => {
//   try {
//     const game = await GameModel.findById(req.params.id);
//     if (!game) return res.status(404).json({ error: 'Game not found' });

//     game.status = 'deleted';
//     await game.save();
//     res.json({ message: 'Game marked as deleted' });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// });

// unirse a la partida
router.post('/join/:code', async (req, res) => {
  const { code } = req.params;
  const { userId } = req.body;
  const user = await checkUser(userId);
  if (!user) return res.status(500).json({ error: 'User not allowed', data: req.body });

  try {
    const game = await GameModel.findOne({ code });
    if (!game) return res.status(404).json({ error: 'Game not found' });

    if (!game.players.includes(user.id)) {
      game.players.push(user.id);
      await game.save();
    } else {
      res.status(500).json({ error: 'User already joined' });
    }

    res.json(game);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtener juegos del usuario
router.get('/user/:id', async (req, res) => {
  const id = req.params.id
  try {
    const games = await GameModel.find({ players: id, status: { $ne: 'deleted' } }).populate('winners').populate('players').populate({
      path: 'missions', // Popula el array de misiones
      populate: {
        path: 'mission', // Dentro de cada GameMission, popula la referencia a la Mission
        model: 'Mission', // Especifica el modelo de la referencia
      },
    })

    const _games = games.map(g => mongoGameToApiFormat(g, id));

    res.json({
      games: _games,
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
