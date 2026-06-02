require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("✅ Mongo conectado"))
.catch(err => console.log(err));

const CancionSchema = new mongoose.Schema({
  nombre: String,
  artista: String,
  genero: String,
  album: String,
  imagen: String,
  url: String,
  favorito: { type: Boolean, default: false },
  reproducciones: { type: Number, default: 0 }
});

const Cancion = mongoose.model("Cancion", CancionSchema);

/* GUARDAR */
app.post("/guardar", async (req, res) => {
  await Cancion.create(req.body);
  res.json({ ok: true });
});

/* OBTENER */
app.get("/datos", async (req, res) => {
  res.json(await Cancion.find());
});

/* ELIMINAR */
app.delete("/eliminar/:id", async (req, res) => {
  await Cancion.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* FAVORITO */
app.put("/favorito/:id", async (req, res) => {
  const c = await Cancion.findById(req.params.id);
  c.favorito = !c.favorito;
  await c.save();
  res.json(c);
});

/* REPRODUCIR (contador real) */
app.put("/reproducir/:id", async (req, res) => {
  const c = await Cancion.findById(req.params.id);
  c.reproducciones += 1;
  await c.save();
  res.json(c);
});

/* ESTADÍSTICAS */
app.get("/stats", async (req, res) => {
  const canciones = await Cancion.find();

  const total = canciones.length;
  const escuchadas = canciones.reduce((acc, c) => acc + c.reproducciones, 0);

  res.json({ total, escuchadas });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Puerto ${PORT}`);
});