import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dayjs from 'dayjs';

const imageFilePath = process.env.IMAGE_FILE_PATH;
const timestampFilePath = process.env.TIMESTAMP_FILE_PATH; // Use a separate env var for timestamp
const TEN_MINUTES = 10 * 60 * 1000;

const ensureDirExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getLastFetchTimestamp = () => {
  if (fs.existsSync(timestampFilePath)) {
    const ts = fs.readFileSync(timestampFilePath, 'utf-8');
    return dayjs(ts);
  }
  return dayjs().add(11, 'minutes');
};

const setLastFetchTimestamp = (timestamp) => {
  ensureDirExists(timestampFilePath);
  const isoString = dayjs(timestamp).toISOString();
  fs.writeFileSync(timestampFilePath, isoString);
};

const imageCache = async () => {
  ensureDirExists(imageFilePath);

  const now = dayjs();
  const lastFetchTimestamp = getLastFetchTimestamp();
  const millisecondsSinceLastFetch = lastFetchTimestamp.diff(now)

  if (!lastFetchTimestamp || millisecondsSinceLastFetch > TEN_MINUTES || !fs.existsSync(imageFilePath)) {
    const writer = fs.createWriteStream(imageFilePath);

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

  return fs.promises.readFile(imageFilePath);
};

export default imageCache;
