import cors from 'cors';
import express from 'express';
import router from './routes/chat';
import path from 'path';
import fs from 'fs';

const app: express.Application = express();

const options: cors.CorsOptions = {
  origin: '*'
};

app.use(express.json());
app.use(cors(options));

// Custom middleware to cache the data
app.use((req, res, next) => {
  const outputPath = path.join(__dirname, "output", "scraped_data.json");
  let cachedData = [];

  try {
    cachedData = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
  } catch (error) {
    console.error("Error reading scraped data:", error);
  }

  // Attach the cached data to the request object for later use
  (req as any).cachedData = cachedData;
  next();
});

app.use('/chat', router)

app.listen('8080', function() {
  console.log('listening on http://localhost:8080');
});

