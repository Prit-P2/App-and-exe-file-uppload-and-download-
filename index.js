const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;

// Serve static files from the public directory
app.use(express.static('public'));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.android.package-archive',
            'application/x-msdownload'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only .exe and .apk files are allowed'));
        }
    }
});

// In-memory storage for files
const files = new Map();
let currentId = 1;

// API Routes
app.get('/api/files', (req, res) => {
    const fileList = Array.from(files.values());
    res.json(fileList);
});

app.get('/api/files/:id', (req, res) => {
    const file = files.get(parseInt(req.params.id));
    if (!file) {
        return res.status(404).json({ message: 'File not found' });
    }
    res.json(file);
});

app.post('/api/files', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = {
            id: currentId++,
            name: req.file.originalname,
            type: req.file.mimetype,
            size: req.file.size,
            data: req.file.buffer.toString('base64'),
            uploadedAt: Date.now()
        };

        files.set(file.id, file);
        res.json(file);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(400).json({ message: err.message });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
