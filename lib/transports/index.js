'use strict';

const uuid = require("uuid/v4");
const util = require('util');

/**
 * @private
 * @type {Utilities}
 */
const Utilities = require('../utils.js');

/**
 * @private
 * @type {Chalk}
 */
const chalk = require('chalk');

/**
 * @private
 */
const stripAnsi = require('strip-ansi');

/**
 * @private
 */
const moment = require("moment");

/**
 * @private
 * @type {Settings}
 */
const Settings = require("./settings.js");

/**
 * @private
 * @type {chalk.constructor}
 */
const forceChalk = new chalk.constructor({
    enabled: true,
    level: chalk.supportsColor && chalk.supportsColor.level > 0 ? chalk.supportsColor.level : 1
});

/**
 * Transport constructor for output modules
 * @constructor
 * @augments {Utilities}
 * @returns {Transport} Self
 */
function Transport() {

    /**
     * ID for identifying transport
     * @private
     * @type {uuid|string}
     */
    this.id = uuid();

    /**
     * Error Handler callback placeholder
     * @private
     * @type {Array}
     */
    this.errorHandlers = [];

    /**
     * Array for namespaces to listen to
     * @type {Array}
     */
    this.namespaces = [];

    /**
     * Settings object
     * @private
     * @type {Settings}
     */
    this.settings = new Settings();

    return this;
}

util.inherits(Transport, Utilities);

/**
 * Import new settings object for this transport
 * @param {Settings|object} settings An instance of settings or an object representing the settings to import
 * @returns {Transport} Self
 */
Transport.prototype.importSettings = function(settings) {
    if (settings instanceof Settings) {
        if (settings.isValid() === true) {
            this.settings = settings;
            return this;
        }
        throw new Error("Setting class failed validity check");

    } else if (typeof settings !== "undefined") {
        this.settings.importSettings(settings);
        return this;
    } else {
        throw new Error("Imported setting is not an instance of Setting class");
    }
};

/**
 * Returns whether the settings object variables are intact
 * @returns {boolean} A boolean representing whether the settings are valid
 */
Transport.prototype.isValid = function() {
    return this.settings.isValid();
};

/**
 * Reverts setting variables to default values if they are incorrect
 * @returns {Transport} Self
 */
Transport.prototype.clean = function() {
    this.settings.clean();
    return this;
};

// Enable/Disable transport
/**
 * Disables the current transport
 * @returns {Transport} Self
 */
Transport.prototype.disable = function() {
    this.settings.disable();
    return this;
};

/**
 * Enables the current Transport
 * @returns {Transport} Self
 */
Transport.prototype.enable = function() {
    this.settings.enable();
    return this;
};

/**
 * Returns whether this transport is enabled
 * @returns {boolean} Boolean of the transport's enabled state
 */
Transport.prototype.enabled = function() {
    return this.settings.enabled();
};

/**
 * Returns whether this transport is disabled
 * @returns {boolean} Boolean of the transport's disabled state
 */
Transport.prototype.disabled = function() {
    return this.settings.disabled();
};

// Colour
/**
 * Disables the colour setting for this transport
 * @returns {Transport} Self
 */
Transport.prototype.disableColor = Transport.prototype.disableColour = function() {
    this.settings.disableColour();
    return this;
};

/**
 * Enables the colour setting for this transport
 * @returns {Transport} Self
 */
Transport.prototype.enableColor = Transport.prototype.enableColour = function() {
    this.settings.enableColour();
    return this;
};

/**
 * Returns the colour setting object for this transport
 * @returns {object} Colour settings object
 */
Transport.prototype.getColorSettings = Transport.prototype.getColourSettings = function() {
    return this.settings.getColourSettings();
};

/**
 * Disables the force colour option for this transport
 * @returns {Transport} Self
 */
Transport.prototype.disableForceColor = Transport.prototype.disableForceColour = function() {
    this.settings.disableForceColour();
    return this;
};

/**
 * Enables the force colour option for this transport
 * @returns {Transport} Self
 */
Transport.prototype.enableForceColor = Transport.prototype.enableForceColour = function() {
    this.settings.enableForceColour();
    return this;
};

/**
 * Disables the bold colour option for this transport
 * @returns {Transport} Self
 */
Transport.prototype.disableBoldColor = Transport.prototype.disableBoldColour = function() {
    this.settings.disableBoldColour();
    return this;
};

/**
 * Enables the bold colour option for this transport
 * @returns {Transport} Self
 */
Transport.prototype.enableBoldColor = Transport.prototype.enableBoldColour = function() {
    this.settings.enableBoldColour();
    return this;
};

// Whitelist
/**
 * Adds the specified string to the source whitelist for this transport
 * @param {string} str - Value to add to whitelist
 * @returns {Transport} Self
 */
Transport.prototype.addToSourceWhitelist = function(str) {
    this.settings.addToSourceWhitelist(str);
    return this;
};

/**
 * Removes the specified string from the source whitelist for this transport
 * @param {string} str - Value remove from whitelist
 * @returns {Transport} Self
 */
Transport.prototype.removeFromSourceWhitelist = function(str) {
    this.settings.removeFromSourceWhitelist(str);
    return this;
};

/**
 * Returns the whitelist array for this transport
 * @returns {Array} Whitelist
 */
Transport.prototype.getSourceWhitelist = function() {
    return this.settings.getSourceWhitelist();
};

/**
 * Clears the whitelist for this transport
 * @returns {Transport} Self
 */
Transport.prototype.clearSourceWhitelist = function() {
    this.settings.clearSourceWhitelist();
    return this;
};

// Blacklist
/**
 * Adds the specified string to the source blacklist for this transport
 * @param {string} str - Value to add to blacklist
 * @returns {Transport} Self
 */
Transport.prototype.addToSourceBlacklist = function(str) {
    this.settings.addToSourceBlacklist(str);
    return this;
};

/**
 * Removes the specified string from the source blacklist for this transport
 * @param {string} str - Value to remove from blacklist
 * @returns {Transport} Self
 */
Transport.prototype.removeFromSourceBlacklist = function(str) {
    this.settings.removeFromSourceBlacklist(str);
    return this;
};

/**
 * Returns the blacklist array for this transport
 * @returns {Array} Whitelist
 */
Transport.prototype.getSourceBlacklist = function() {
    return this.settings.getSourceBlacklist();
};

/**
 * Clears the blacklist for this transport
 * @returns {Transport} Self
 */
Transport.prototype.clearSourceBlacklist = function() {
    this.settings.clearSourceBlacklist();
    return this;
};

//Source Control
/**
 * Set the source control variable
 * @param {string} str - String to set
 * @returns {Transport} Self
 */
Transport.prototype.setSourceControlSetting = function(str) {
    this.settings.setSourceControlSetting(str);
    return this;
};

/**
 * Returns the state of the source conrol variable
 * @returns {String} Source control setting
 */
Transport.prototype.getSourceControlSetting = function() {
    return this.settings.getSourceControlSetting();
};

/**
 * Resets source whitelist, blacklist and enabled boolean
 * @returns {Transport} Self
 */
Transport.prototype.resetSourceControl = function() {
    this.settings.resetSourceControl();
    return this;
};

/**
 * Disables source control setting
 * @returns {Transport} Self
 */
Transport.prototype.disableSourceControlSetting = function() {
    this.settings.disableSourceControlSetting();
    return this;
};

// Log Level
/**
 * Sets the log level, or allow/ignore value of a specific level for this transport
 * @param {string} str - Name of the severity to be acted upon
 * @param {boolean} value - Value of the severity to be set to
 * @returns {Transport} Self
 */
Transport.prototype.setLogLevel = function(str, value) {
    this.settings.setLogLevel(str, value);
    return this;
};

// Timestamp
/**
 * Enables the timestamp setting for this transport
 * @returns {Transport} Self
 */
Transport.prototype.enableTimestamp = function() {
    this.settings.enableTimestamp();
    return this;
};

/**
 * Disables the timestamp setting for this transport
 * @returns {Transport} Self
 */
Transport.prototype.disableTimestamp = function() {
    this.settings.disableTimestamp();
    return this;
};

/**
 * Enables the brackets on the timestamp for this transport
 * @returns {Transport} - Returning self for chaining purposes
 */
Transport.prototype.enableBrackets = function() {
    this.settings.enableBrackets();
    return this;
};

/**
 * Disables the brackets on the timestamp for this transport
 * @returns {Transport} Self
 */
Transport.prototype.disableBrackets = function() {
    this.settings.disableBrackets();
    return this;
};

/**
 * Sets the format for moment.js timestamp string for this transport
 * @param {string} str - The new format value of the timestamp
 * @returns {Transport} Self
 */
Transport.prototype.setTimestampFormat = function(str) {
    this.settings.setTimestampFormat(str);
    return this;
};

/**
 * Resets the timestamp format to the default value for this transport
 * @returns {Transport} Self
 */
Transport.prototype.resetTimestampFormat = function() {
    this.settings.resetTimestampFormat();
    return this;
};

/**
 * Enables the UTC setting for this transport
 * @returns {Transport} Self
 */
Transport.prototype.enableUTC = function() {
    this.settings.enableUTC();
    return this;
};

/**
 * Disables the UTC setting ofor this transport
 * @returns {Transport} Self
 */
Transport.prototype.disableUTC = function() {
    this.settings.disableUTC();
    return this;
};

// Location

/**
 * Enables the location for this transport
 * @returns {Transport} Self
 */
Transport.prototype.enableLocation = function() {
    this.settings.enableLocation();
    return this;
};

/**
 * Disables the location for this transport
 * @returns {Transport} Self
 */
Transport.prototype.disableLocation = function() {
    this.settings.disableLocation();
    return this;
};

/**
 * Function to capitalise the first letter of a string
 * @private
 * @param {string} str The string to capitalize
 * @returns {string} Returns a string with the first letter capitalised
 */
Transport.prototype.capitalise = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format location string
 * @private
 * @param {object} data The data to grab the location from
 * @returns {string} Returns a string in the format of [location]
 */
Transport.prototype.getLocation = function(data) {
    return `[${data.location}]`;
};

/**
 * Formats the message variable
 * @private
 * @param {Object} data The data to grab the message from
 * @returns {string} Returns the message from data.
 */
Transport.prototype.getMessage = function(data) {
    if (data && typeof data.message === "string") {
        return data.message;
    }
    return util.inspect(data.message);

};

/**
 * Formats the severity string
 * @private
 * @param {Object} data The data to grab the severity from
 * @returns {string} Returns a string formatted as [severity]
 */
Transport.prototype.getSeverity = function(data) {
    let severity;
    if (data && typeof data.severity !== "undefined") {
        severity = this.settings.colour.enabled === true
            ? `[${this.getSeverityColour(this.capitalise(data.severity))}]`
            : `[${this.capitalise(data.severity)}]`;
    } else {
        severity = "[undefined]";
    }
    return severity;
};

/**
 * Colourises the severity string according to its value
 * @private
 * @param {string} s The severity to color
 * @returns {String} Returns a chalk colored string
 */
Transport.prototype.getSeverityColour = function(s) {
    switch (s.toLowerCase()) {
        case 'success':
            return this.settings.colour.force ? forceChalk.green.bold(s) : chalk.green.bold(s);
        case 'transport':
            return this.settings.colour.force ? forceChalk.cyan.bold(s) : chalk.cyan.bold(s);
        case 'debug':
            return this.settings.colour.force ? forceChalk.blue.bold(s) : chalk.blue.bold(s);
        case 'info':
            return this.settings.colour.force ? forceChalk.magenta.bold(s) : chalk.magenta.bold(s);
        case 'warning':
            return this.settings.colour.force ? forceChalk.yellow.bold(s) : chalk.yellow.bold(s);
        case 'error':
            return this.settings.colour.force ? forceChalk.red.bold(s) : chalk.red.bold(s);
        default:
            return s;
    }
};

/**
 * Formats the source
 * @private
 * @param {object} data The data to grab the source from
 * @returns {string} Returns the source formatted to be [source]
 */
Transport.prototype.getSource = function(data) {
    let source;
    if (data && typeof data.source === "string") {
        source = `[${data.source}]`;
    } else {
        source = "[undefined]";
    } return source;
};

/**
 * @private
 * @param {object} data The data to grab the timestamp from
 * @returns {string} Returns the timestamp formatted to the timestamp format
 */
Transport.prototype.getTimestamp = function(data) {
    let date;

    if (data && data.timestamp) {
        date = data.timestamp;
    } else {
        date = new Date();
    }
    const f = this.settings.timestamp.utc
        ? moment(date.toISOString()).utc().format(this.settings.timestamp.format)
        : moment(date.toISOString()).format(this.settings.timestamp.format);
    if (this.settings.timestamp.brackets === true) {
        return `[${f}]`;
    }
    return f;

};

/**
 * Formats the string according to
 * @param {object} data The data to format
 * @returns {String} A formatted string
 */
Transport.prototype.formatString = function(data) {
    if (typeof data === "object" && data != null) {
        const timestamp = this.settings.timestamp.enabled === true ? this.getTimestamp(data) : "";
        const severity = this.spaceOut(this.getSeverity(data), 11);
        const location = this.settings.location.enabled === true ? this.spaceOut(this.getLocation(data), 20) : "";
        const source = this.spaceOut(this.getSource(data), 15);
        const message = this.getMessage(data);
        let output = (`${timestamp} ${severity}${location} ${source} ${message}`);
        if (this.settings.colour.enabled === false) {
            output = stripAnsi(output);
        } return output;
    }
    throw new Error(`A non-object was sent to the Logger.output() function! See: ${util.inspect(data)}`);

};

/**
 * Internal input handler
 * @param {object} data data to log to transport
 * @private
 */
Transport.prototype._input = function(data) {
    if (this.settings.enabled()) {
        if (this.isValidOutputParameters(data)) {
            if (typeof this.output === "function") {
                if (this.namespaces.length === 0 || this.namespaces.indexOf(data.namespace) > -1) {
                    if ((this.settings.source.enabled === null) || (this.settings.source.enabled === "whitelist" &&
                            this.settings.source.whitelist.indexOf(data.source) > -1) || (this.settings.source.enabled === "blacklist" && this.settings.source.blacklist.indexOf(data.source) === -1)) {
                        this.output(data);
                    }
                }
            } else {
                throw new Error("No output prototype found for transport");
            }
        } else {
            throw new Error("Missing parameters!");
        }
    }
};

/**
 * Placeholder output function to be overwritten
 */
Transport.prototype.output = function() {
    throw new Error("Output function not overwritten!");
};

/**
 * Internal error handling function, sets callback to the errorHandler property
 * @param {function} callback - Function to be emitted to, on error
 * @private
 */
Transport.prototype._onError = function(callback) {
    this.errorHandlers.push(callback);
};

/**
 * Emits to the contained error callbacks (Usually only Jethro internal)
 * @param {object} err - Object to be emitted
 * @private
 * @returns {Transport} An instance of the transport
 */
Transport.prototype._throwError = function(err) {
    if (this.errorHandlers.length > 0) {
        for (let i = 0; i < this.errorHandlers.length; i++) {
            if (typeof this.errorHandlers[i] === 'function') {
                this.errorHandlers[i](err);
            }
        }

        return this;
    }
    throw err;
};

/**
 * Log function with predefined fatal error severity
 * @param {string} source - Declares the source of the log
 * @param {Error} err - Error object
 */
Transport.prototype.trace = function(source, err) {
    if (err instanceof Error) {
        this.output({
            message: err.message,
            severity: "error",
            source
        });
    } else {
        throw new Error("Error not sent to Jethro.trace");
    }
};

module.exports = Transport;
