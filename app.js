const express = require('express');
const v8Profiler = require('v8-profiler-next');
const path = require('path');
const fs = require('fs');

const app = express();

const snapshots = new Map();

// API endpoint for taking a heap snapshot
app.get('/api/heap-snapshot', (req, res) => {
  const snapshot = v8Profiler.takeSnapshot();
  const name = snapshot.getHeader().title;
  snapshots.set(name, snapshot);

  res.send({ name });
});

// API endpoint for downloading a heap snapshot by name
app.get('/api/heap-snapshot/:name', (req, res) => {
  const name = req.params.name;
  const snapshot = snapshots.get(name);
  if (!snapshot) {
    return res.status(404).send({ error: 'Snapshot not found' });
  }

  const fileName = `${name}.heapsnapshot`;
  const filePath = path.resolve(__dirname, 'snapshots', fileName);
  snapshot.serialize(
    { write: chunk => fs.appendFileSync(filePath, chunk) },
    () => {
      res.download(filePath, fileName, error => {
        if (error) {
          console.error(error);
        }
        snapshots.delete(name);
      });
    }
  );
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Access server on  http://localhost:${port}`);
});
