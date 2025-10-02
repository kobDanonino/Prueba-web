import express from "express";
import { WebSocketServer } from "ws";
import { spawn } from "child_process";
import path from "path";

const app = express();
const PORT = 3000;

// Servir archivos estáticos
app.use(express.static(path.resolve("./")));

// Servidor HTTP
const server = app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:" + PORT);
});

// WebSocket
const wss = new WebSocketServer({ server });

// Aquí arrancamos el bot que el usuario haya subido
let botProcess = spawn("node", ["./bot/index.js"]); // <--- Tu bot va en /bot/index.js

wss.on("connection", (ws) => {
  console.log("Cliente conectado a la consola");

  // Enviar salida del bot
  botProcess.stdout.on("data", (data) => {
    ws.send(data.toString());
  });

  botProcess.stderr.on("data", (data) => {
    ws.send("ERROR: " + data.toString());
  });

  // Ejecutar comandos que el usuario envíe
  ws.on("message", (msg) => {
    if (botProcess) {
      botProcess.stdin.write(msg.toString() + "\n");
    }
  });
});
