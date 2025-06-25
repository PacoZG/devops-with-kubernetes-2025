import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { PORT } from './utils/appConfig.js';

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
