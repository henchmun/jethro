'use strict';

const Jethro = require('../lib/index.js');
const path = require("path");
const logger = new Jethro();

console.log(logger.getSourceWhitelist("console"));
logger.clearSourceWhitelist();
