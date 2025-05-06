import express from 'express';
import UserModel from '../models/User';

const router = express.Router();

// router.post('/', async (req, res) => {
//   try {
//     const user = await UserModel.find({});
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: 'Error creating user' });
//   }
// });

// Crear usuario
router.post('/new', async (req, res) => {
  const { username, pwd } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    if(user)
      return res.status(500).json({ error: 'Username already exist' });
  } catch (err) {
    res.status(500).json({ error: 'Error checkiing user' });
  }

  try {
    const user = new UserModel({ username, pwd });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// loging
router.post('/login', async (req, res) => {
  const { username, pwd } = req.body;
  try {
    const user = await UserModel.findOne({ username, pwd });
    if(!user){
      return res.status(500).json({ error: 'invalid username or password' });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
