import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import gameRoutes from './routes/games';
import userRoutes from './routes/users';
import missionRoutes from './routes/missions';
const app = express();
const port = process.env.PORT || 4000;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/game';

app.use(cors());
app.use(express.json());

// Rutas separadas
app.use('/games', gameRoutes);
app.use('/users', userRoutes);
app.use('/missions', missionRoutes);

// Conexión y arranque
mongoose
  .connect(mongoUrl)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });
