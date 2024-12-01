    const express = require('express');
    const cors = require('cors');
    const bodyparser = require('body-parser');
    const app = express();
    const Port = process.env.PORT || 3306;
    const Route = require("./routes.js");
    const multer = require("multer");

    app.use(cors()); // This should be placed at the top before routes
    // Set up storage for Multer
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "uploads/");  // Store files in the 'uploads' folder
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);  // Rename the file to avoid conflicts
        }
    });
    
    // Initialize multer with the storage configuration
    const upload = multer({ storage: storage });
    


    app.use(bodyparser.json());
    app.use("/",Route);

    app.listen(Port,'0.0.0.0', () => {
        console.log(`Example app listening on port ${Port}`);
    });
