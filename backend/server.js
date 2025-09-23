const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware para JSON
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/mi_base", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.error("❌ Error de conexión:", err));

// Rutas
app.use('/api/clientes', require('./routes/clienteRoute'))
app.use('/api/alimentacion', require('./routes/alimentacionRoutes'))
app.use('/api/porcinos', require('./routes/porcinoRoutes'))

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
