'use strict';

const Transport = require('./../index.js');

const util = require('util');
const fs = require("fs");
const moment = require("moment");

/**
 * Constructor for saving to file
 * @constructor
 * @example
 * var Jethro = require('jethro');
 * var path = require("path");
 * var logger = new Jethro();
 * var jethroFile = new Jethro.File();
 * jethroFile.setFilePath(path.join(__dirname, 'logs'));
 * logger.addTransport("file", jethroFile);
 * @augments Transport
 * @returns {File} returns an instance of File
 */
function File() {
    Transport.call(this);

    /**
     * Path to log to
     * @type {String}
     */
    this.path = __dirname;

    /**
     * File name to use for log file
     * @type {string}
     */
    this.fileNameFormat = "YYYY-MM-DD";

    /**
     * File extension to use for log file
     * @type {string}
     */
    this.fileExtension = ".txt";

    return this;
}

util.inherits(File, Transport);

/**
 * Output function, logs to file
 * @param {object} data - log object
 */
File.prototype.output = function(data) {
    this.disableColour(); //Enforcing disable colour for this transport
    const output = this.formatString(data);
    const name = moment(data.timestamp).format(this.fileNameFormat) + this.fileExtension;
    const path = `${this.path}/${name}`;
    fs.appendFileSync(path, `${output}\r\n`);
};

/**
 * Returns the set file path
 * @returns {null|string} File path
 */
File.prototype.getFilePath = function() {
    return this.path;
};

/**
 * Sets the file path for
 * @param {string} str - File path to log to
 * @returns {File} returns an instance of File
 */
File.prototype.setFilePath = function(str) {
    if (typeof str === "string") {
        this.path = str;
        return this;
    }
    throw new Error("Not a string");

};

module.exports = File;
