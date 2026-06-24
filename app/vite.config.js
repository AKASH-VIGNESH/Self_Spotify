import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import * as mm from 'music-metadata'

const SONGS_DIR = 'D:/songs';

const musicPlugin = () => ({
  name: 'music-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // API to get all movies and their songs
      if (req.url === '/api/library') {
        try {
          const library = [];
          if (fs.existsSync(SONGS_DIR)) {
            const movies = fs.readdirSync(SONGS_DIR, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory());

            for (const movie of movies) {
              const moviePath = path.join(SONGS_DIR, movie.name);
              const files = fs.readdirSync(moviePath).filter(f => f.toLowerCase().endsWith('.flac') || f.toLowerCase().endsWith('.mp3'));
              
              const songs = [];
              for (const file of files) {
                const filePath = path.join(moviePath, file);
                try {
                  const metadata = await mm.parseFile(filePath);
                  songs.push({
                    title: metadata.common.title || file.replace(/\.(flac|mp3)$/i, ''),
                    artist: metadata.common.artist || 'Unknown Artist',
                    duration: metadata.format.duration,
                    fileName: file,
                    movie: movie.name
                  });
                } catch (err) {
                  console.error(`Error parsing ${filePath}`, err);
                }
              }
              library.push({ name: movie.name, songs });
            }
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(library));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
        return;
      }

      // API to get album art
      if (req.url.startsWith('/api/art?')) {
        try {
          const urlParams = new URLSearchParams(req.url.split('?')[1]);
          const movie = urlParams.get('movie');
          const file = urlParams.get('file');
          if (!movie || !file) {
            res.statusCode = 400;
            res.end('Missing params');
            return;
          }

          const filePath = path.join(SONGS_DIR, movie, file);
          if (fs.existsSync(filePath)) {
            const metadata = await mm.parseFile(filePath);
            const picture = metadata.common.picture && metadata.common.picture[0];
            if (picture) {
              res.setHeader('Content-Type', picture.format);
              res.end(picture.data);
              return;
            }
          }
          res.statusCode = 404;
          res.end('No art found');
        } catch (error) {
          res.statusCode = 500;
          res.end('Error parsing art');
        }
        return;
      }

      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), musicPlugin()],
  server: {
    fs: {
      allow: ['.', SONGS_DIR]
    }
  }
})
