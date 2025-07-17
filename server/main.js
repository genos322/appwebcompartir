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
const io = new Server(server,{
    maxHttpBufferSize: 1e8, // 100 MB
});

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, '../public')));
// console.log(path.join(__dirname, 'public/src'));
io.on('connection', (socket) => {
  console.log('Cliente conectado', socket.id);

  socket.on('upload-video', (data, cb) => {
    const { buffer, type, name,extension } = data;
    if (!buffer || !type) return cb({ success: false, message: 'Datos incompletos' });

    console.log('Recibiendo archivo:', name, type);

    const fileType = type.split('/')[0];
    if (fileType !== 'video' && fileType !== 'image') {
      return cb({ success: false, message: 'Tipo de archivo no permitido' });
    }

    const id = Date.now();
    // const extension = type.split('/')[1];
    const fileName = `${fileType}-${id}.${extension}`;
    const filePath = path.join(__dirname, '../public/upload', fileName);

    fs.writeFile(filePath, Buffer.from(buffer), (err) => {
      if (err) {
        console.error('Error al guardar el archivo:', err);
        return cb({ success: false, error: 'Error al guardar el archivo' });
      }
      console.log(`Archivo ${fileName} guardado correctamente`);
      cb({ success: true, fileName, extension });
    });
});

  socket.on('updateFile', () => {
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

//routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/videos', (req, res) => {
  const uploadsDir = path.join(__dirname, '../public/upload');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Error leyendo carpeta' });

    const videoFiles = files.filter(file => file.endsWith('.mp4'));
    res.json(videoFiles);
  });
});
const port = 9998;
server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
