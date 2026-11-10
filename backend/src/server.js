require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const store = require('./db/store');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    mongoConnected: store.isMongoConnected,
    mode: store.isMongoConnected ? 'MongoDB Live' : 'High-Performance Local Cache'
  });
});

// Serve frontend build in production
const clientDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

async function startServer() {
  if (process.env.MONGODB_URI) {
    await store.connectMongo(process.env.MONGODB_URI);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Smart Roster Engine API running at http://localhost:${PORT}`);
    console.log(`📡 Storage Mode: ${store.isMongoConnected ? 'MongoDB Atlas' : 'Local Fast Cache'}`);
  });
}

startServer();
