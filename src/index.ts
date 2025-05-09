import "./lib/db";
import cors from "cors";
import express from "express";
import gamesRoutes from "./routes/games";
import usersRoutes from "./routes/users";
import missionsRoutes from "./routes/missions";

const app = express();
const port = process.env.PORT || 3333;

// Configurar CORS para permitir solo tu frontend
app.use(cors({
  origin: "https://mesecrazy.netlify.app",
  credentials: true  // si usás cookies o headers de autenticación
}));

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.get("/", async (req, res) => {
  res.json({ message: "Welcome to Te Pille! api" });
});

// app.use("/countries", countryRoutes);
app.use("/games", gamesRoutes);
app.use("/users", usersRoutes);
app.use("/missions", missionsRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
