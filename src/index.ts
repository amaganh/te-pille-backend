import "./lib/db";
import express from "express";
// import countryRoutes from "./routes/country";
import gamesRoutes from "./routes/games";
import usersRoutes from "./routes/users";

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.get("/", async (req, res) => {
  res.json({ message: "Welcome to Te Pille! api" });
});

// app.use("/countries", countryRoutes);
app.use("/games", gamesRoutes);
app.use("/users", usersRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
