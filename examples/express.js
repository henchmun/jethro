'use strict';

const express = require('express');
const app = express();

const Jethro = require('../lib/index.js');
const logger = new Jethro();
const expressLog = new Jethro.Express();
logger.addPlugin("express", expressLog);
app.use(expressLog.input());

app.get('/', (req, res) => {
    res.send('hello world');
});

app.listen(3000);

const path = require("path");
const jethroFile = new Jethro.File();
jethroFile.setFilePath(path.join(__dirname, 'logs'));
//jethroFile.setFilenameFormat("");
logger.addTransport("file", jethroFile);

//logger.fatal(new Error("Test"));
