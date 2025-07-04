import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));
// console.log(path.join(__dirname, 'public/src'));
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('solicitarImagen', () => {
    const rutaImagen = path.join(__dirname, 'public', 'imagen.jpg');
    fs.readFile(rutaImagen, (err, data) => {
      if (err) {
        console.error('Error al leer la imagen:', err);
        return;
      }
      socket.emit('imagen', data);
    });
  });

  socket.on('solicitarVideo', () => {
    const rutaVideo = path.join(__dirname, 'public', 'video.mp4');
    fs.readFile(rutaVideo, (err, data) => {
      if (err) {
        console.error('Error al leer el video:', err);
        return;
      }
      socket.emit('video', data);
    });
  });
});

server.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
