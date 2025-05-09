import express from 'express';
import Mission from '../models/Mission';
import { seedDefaultMissions } from '../utils/seedDefaultMissions';

const router = express.Router();

// GET /missions - List all missions
router.get('/types', async (req, res) => {
  await seedDefaultMissions()
  try {
    const types = await Mission.aggregate([
      {
        $group: {
          _id: '$type', // Agrupa los documentos por el valor del campo 'type'
          count: { $sum: 1 } // Cuenta el número de documentos en cada grupo
        }
      },
      {
        $project: {
          _id: 0, // Oculta el campo _id generado por $group
          type: '$_id', // Renombra el campo _id a 'type' para mayor claridad
          count: 1 // Muestra el campo 'count'
        }
      }
    ]);
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const resultado = await Mission.deleteMany({});
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

// // GET /missions/:id - Get mission by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const mission = await Mission.findById(req.params.id);
//     if (!mission) return res.status(404).json({ error: 'Mission not found' });
//     res.json(mission);
//   } catch (err) {
//     res.status(500).json({ error: 'Error retrieving mission' });
//   }
// });

// // POST /missions - Create new mission
// router.post('/', async (req, res) => {
//   try {
//     const mission = new Mission({ name: req.body.name });
//     await mission.save();
//     res.status(201).json(mission);
//   } catch (err) {
//     res.status(400).json({ error: 'Error creating mission' });
//   }
// });

// // PUT /missions/:id - Update mission text
// router.put('/:id', async (req, res) => {
//   try {
//     const mission = await Mission.findByIdAndUpdate(
//       req.params.id,
//       { name: req.body.name },
//       { new: true }
//     );
//     if (!mission) return res.status(404).json({ error: 'Mission not found' });
//     res.json(mission);
//   } catch (err) {
//     res.status(400).json({ error: 'Error updating mission' });
//   }
// });

// // DELETE /missions/:id - Remove a mission
// router.delete('/:id', async (req, res) => {
//   try {
//     const mission = await Mission.findByIdAndDelete(req.params.id);
//     if (!mission) return res.status(404).json({ error: 'Mission not found' });
//     res.json({ message: 'Mission deleted' });
//   } catch (err) {
//     res.status(500).json({ error: 'Error deleting mission' });
//   }
// });

export default router;
