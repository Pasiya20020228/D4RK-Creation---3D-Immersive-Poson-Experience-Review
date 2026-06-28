import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({ dest: 'uploads/' });
const DATA_FILE = path.join(__dirname, 'data.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    upperPanels: Array(8).fill(null),
    lowerPanels: Array(8).fill(null)
  }, null, 2));
}

// Ensure uploads dir exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Login API
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === 'Mihintale2026') {
    res.json({ success: true, token: 'secret-token' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// Get Config
app.get('/api/config', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  res.json(data);
});

// Upload API
app.post('/api/upload', upload.single('image'), (req, res) => {
  const { panelType, index, token } = req.body;
  if (token !== 'secret-token') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const filePath = `/uploads/${req.file.filename}`;

  if (panelType === 'upper') {
    data.upperPanels[index] = filePath;
  } else {
    data.lowerPanels[index] = filePath;
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true, filePath });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
