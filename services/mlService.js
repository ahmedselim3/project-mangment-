const { exec } = require('child_process');
const path = require('path');
const asyncHandler = require('express-async-handler')


exports.runModel =  asyncHandler(async (req, res , next) => {

    const scriptPath = path.join(__dirname, 'model.py');
    const dataPath = req.body.dataPath; // Expecting the path to the CSV file from the client
    exec(`python ${scriptPath} ${dataPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${error}`);
          return res.status(500).json({ error: error.message });
        }
        if (stderr) {
          console.error(`Script error: ${stderr}`);
          return res.status(500).json({ error: stderr });
        }
        res.json({ output: stdout });
      });
})