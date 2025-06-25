import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dayjs from 'dayjs';
import { IMAGE_FILE_PATH, TIMESTAMP_FILE_PATH } from '../utils/appConfig.js';

const TEN_MINUTES = 10 * 60 * 1000;

const ensureDirExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getLastFetchTimestamp = () => {
  if (fs.existsSync(TIMESTAMP_FILE_PATH)) {
    const ts = fs.readFileSync(TIMESTAMP_FILE_PATH, 'utf-8');
    return dayjs(ts);
  }
  return null;
};

const setLastFetchTimestamp = (timestamp) => {
  ensureDirExists(TIMESTAMP_FILE_PATH);
  const isoString = dayjs(timestamp).toISOString();
  fs.writeFileSync(TIMESTAMP_FILE_PATH, isoString);
};

const imageCache = async () => {
  ensureDirExists(IMAGE_FILE_PATH);

  const now = dayjs();
  const lastFetchTimestamp = getLastFetchTimestamp();
  const millisecondsSinceLastFetch = lastFetchTimestamp ? now.diff(lastFetchTimestamp) : Infinity;

  if (!lastFetchTimestamp || millisecondsSinceLastFetch > TEN_MINUTES || !fs.existsSync(IMAGE_FILE_PATH)) {
    const writer = fs.createWriteStream(IMAGE_FILE_PATH);

    try {
      const response = await axios({
        method: 'GET',
        url: 'https://picsum.photos/1200',
        responseType: 'stream',
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      setLastFetchTimestamp(now);
    } catch (error) {
      console.error(error);
    } finally {
      writer.destroy();
    }
  }

  return fs.promises.readFile(IMAGE_FILE_PATH);
};

export default imageCache;
