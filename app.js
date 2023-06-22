const express = require('express');
const v8Profiler = require('v8-profiler-next');
// const workerThreads = require('worker_threads');
// const path = require('path');
const fs = require('fs');

const app = express();

/* 
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
    { write: (chunk) => fs.appendFileSync(filePath, chunk) },
    () => {
      res.download(filePath, fileName, (error) => {
        if (error) {
          console.error(error);
        }
        snapshots.delete(name);
      });
    }
  );
});
*/

// Take CPU profile
const title = 'good-name';

// set generateType 1 to generate new format for cpuprofile
// to be compatible with cpuprofile parsing in vscode.
v8Profiler.setGenerateType(1);

// ex. 5 mins cpu profile
v8Profiler.startProfiling(title, true);
setTimeout(() => {
  const profile = v8Profiler.stopProfiling(title);
  profile.export(function (error, result) {
    // if it doesn't have the extension .cpuprofile then
    // chrome's profiler tool won't like it.
    // examine the profile:
    //   Navigate to chrome://inspect
    //   Click Open dedicated DevTools for Node
    //   Select the profiler tab
    //   Load your file
    fs.writeFileSync(`${title}.cpuprofile`, result);
    profile.delete();
  });
}, 5 * 60 * 1000);

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Access server on  http://localhost:${port}`);
});
