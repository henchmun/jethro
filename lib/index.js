'use strict';

const os = require("os");
const util = require("util");

/**
 * @private
 * @type {v4}
 */
const uuid = require("uuid/v4");

// Classes
/**
 * @private
 * @type {Settings}
 */
const Settings = require('./transports/settings.js');

/**
 * @private
 * @type {Utilities}
 */
const Utilities = require("./utils.js");

/**
 * @private
 * @type {Transport}
 */
const Transport = require('./transports/index.js');

/**
 * @private
 * @type {Console}
 */
const Console = require('./transports/native/console.js');

/**
 * @private
 * @type {File}
 */
const File = require('./transports/native/file.js');

/**
 * @private
 * @type {Plugin}
 */
const Plugin = require('./plugins/index.js');

/**
 * @private
 * @type {HttpServer}
 */
const HttpServer = require('./plugins/defaults/http.js');

/**
 * @private
 * @type {Express}
 */
const Express = require('./plugins/native/express.js');
//var Restify = require('./plugins/native/restify.js');

/**
 * Module entry point, default logging function
 * @private
 * @inheritDoc {Jethro.log}
 * @param {string} severity - Describes the severity of the log
 * @param {string} source - Declares the source of the log
 * @param {string} message - The message of the log
 * @param {string} [timestamp] - The timestamp of the message, if not provided, new Date();
 * @returns {Jethro|logger.log} if new keyword is used, a new instance of Jethro is returned, if not, log to existing
 */
function log(severity, source, message, timestamp) {
    if (!(this instanceof log)) {
        return logger.log(severity, source, message, timestamp);
    }
    return new Jethro();

}

/**
 * Jethro class constructor
 * @constructor
 * @example
 * var Jethro = require('jethro');
 * var logger = new Jethro();
 * logger("info", "Somewhere", "Something is happening...");
 * @augments {Utilities}
 * @property {uuid} id - Unique ID for Jethro Instance
 * @property {object} plugins - Container for plugin modules
 * @property {object} transports - Container for transport modules
 * @property {object} transports.console - Default console transport
 * @property {string} location - Location for the jethro instance
 *
 * @returns {Jethro} Self
 */
function Jethro() {

    /**
     * Unique ID for Jethro Instance
     * @private
     * @type {uuid|string}
     */
    this.id = uuid();

    /**
     * Container for plugin modules
     * @private
     * @type {{}}
     */
    this.plugins = {

    };

    /**
     * Container for transport modules
     * @type {{}}
     * @private
     * @property {Plugin} transports.console - Default console transport
     */
    this.transports = {
        console: new Console()
    };

    /**
     * Container for error handlers
     * @private
     * @type {Array}
     */
    this.errorHandlers = [];

    /**
     * Location for the jethro instance
     * @private
     * @type {String}
     */
    this.location = os.hostname();

    return this;
}

util.inherits(Jethro, Utilities);

/**
 * Returns the ID of the Jethro instance
 * @returns {uuid} id - Returns the ID of the Jethro instance
 */
Jethro.prototype.getId = function() {
    return this.id;
};

//Transport API
/**
 * Adds transport to all event emitters
 * @param {string} name - The name of the transport to be assigned
 * @param {Transport} transport - The instance of Transport to be imported
 * @returns {Jethro} Self
 */
Jethro.prototype.addTransport = function(name, transport) {
    if (typeof name !== "string") {
        throw new TypeError("Provided Transport Name is not a string.");
    }
    if (transport instanceof Transport) {
        this.transports[name] = (transport);
        this.transports[name]._onError(this._errorHandler.bind(this));
        return this;
    }
    throw new TypeError("Provided Transport not an instance of Transport Class");
};

/**
 * Removes the requested/named transport from the event emitters
 * @param {string} name - Name of transport to be removed
 * @returns {Jethro} Self
 */
Jethro.prototype.removeTransport = function(name) {
    if (typeof name === 'string' && this.transports[name]) {
        delete this.transports[name];
        return this;
    }
    throw new TypeError("Invalid Transport specified");
};

/**
 * Returns the requested/named transport
 * @param {string} transport - Name of the transport to be found
 * @returns {Transport|Object} Instance of the saved transport
 */
Jethro.prototype.getTransport = function(transport) {
    //TODO: Add type validation
    if (typeof transport !== "undefined" && transport !== null) {
        for (const i in this.transports) {
            /* istanbul ignore else: hasOwnProperty can't really be tested. */
            if (this.transports.hasOwnProperty(i)) {
                if (i === transport) {
                    return this.transports[i];
                }
            }
        } throw new Error("Transport not found by name");
    } else {
        return this.transports;
    }
};

/**
 * Runs through getter functions of the Transport instances
 * @param {?string} [transport] - Name of the transport to be acted on
 * @param {string} func - Name of function to be run
 * @returns {*} - Value returned by getter function
 * @private
 */
Jethro.prototype._getter = function(transport, func) {
    const t = this.getTransport(transport);
    if (!(t instanceof Transport)) {
        const arr = {};
        for (const i in t) {
            /* istanbul ignore else: hasOwnProperty can't really be tested. */
            if (t.hasOwnProperty(i)) {
                arr[i] = t[i][func]();
            }
        } return arr;
    }
    return t[func]();

};

/**
 * Runs through setter functions of the Transport instances
 * @param {?string} [transport] - Name of the transport to be acted on
 * @param {string} func - Name of function to be run
 * @param {?*} a - Value to be past onto upstream function
 * @param {?*} b - Value to be past onto upstream function
 * @param {?*} c - Value to be past onto upstream function
 * @returns {Jethro} Self
 * @private
 */
Jethro.prototype._setter = function(transport, func, a, b, c) {
    const t = this.getTransport(transport);
    if (!(t instanceof Transport)) {
        for (const i in t) {
            /* istanbul ignore else: hasOwnProperty can't really be tested. */
            if (t.hasOwnProperty(i)) {
                t[i][func](a, b, c);
            }
        }
    } else {
        t[func](a, b, c);
    } return this;
};

/**
 * Returns the boolean whether or not the transport is enabled
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {boolean} Boolean of the transport's enabled state
 */
Jethro.prototype.transportDisabled = function(transport) {
    return this._getter(transport, "disabled");
};

/**
 * Returns the boolean of whether or not the transport is disabled
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {boolean} Boolean of the transport's disabled state
 */
Jethro.prototype.transportEnabled = function(transport) {
    return this._getter(transport, "enabled");
};

//Transports
/**
 * Disables the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} self
 */
Jethro.prototype.disableTransport = function(transport) {
    const t = this.getTransport(transport);
    if (!(t instanceof Transport)) {
        throw new Error("Invalid transport");
    } else {
        t.disable();
    } return this;
};

/**
 * Enables the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.enableTransport = function(transport) {
    const t = this.getTransport(transport);
    if (!(t instanceof Transport)) {
        throw new Error("Invalid transport");
    } else {
        t.enable();
    } return this;
};

// Colour
/**
 * Disables the colour on a requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.disableColour("console");
 * @returns {Jethro} Self
 */
Jethro.prototype.disableColor = Jethro.prototype.disableColour = function(transport) {
    return this._setter(transport, "disableColour");
};

/**
 * Enables the colour setting on the requested transport instance
 * @param {?string} [transport] - Name of the transport to apply
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.enableColour("console");
 * @returns {Jethro} Self
 */
Jethro.prototype.enableColor = Jethro.prototype.enableColour = function(transport) {
    return this._setter(transport, "enableColour");
};

/**
 * Returns the colour settings of the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.getColourSettings("console");
 * @returns {object} - Colour settings object
 */
Jethro.prototype.getColorSettings = Jethro.prototype.getColourSettings = function(transport) {
    return this._getter(transport, "getColourSettings");
};

/**
 * Disables the force colour setting of the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.disableForceColour("console");
 * @returns {Jethro} Self
 */
Jethro.prototype.disableForceColor = Jethro.prototype.disableForceColour = function(transport) {
    return this._setter(transport, "disableForceColour");
};

/**
 * Enables the force colour string of the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.enableForceColour("console");
 * @returns {Jethro} Self
 */
Jethro.prototype.enableForceColor = Jethro.prototype.enableForceColour = function(transport) {
    return this._setter(transport, "enableForceColour");
};

/**
 * Disables the bold colour setting of the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.disableBoldColour("console");
 * @returns {Jethro} Self
 */
Jethro.prototype.disableBoldColor = Jethro.prototype.disableBoldColour = function(transport) {
    return this._setter(transport, "disableBoldColour");
};

/**
 * Enables the bold colour stting of the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.enableBoldColour("console");
 * @returns {Jethro} Self
 */
Jethro.prototype.enableBoldColor = Jethro.prototype.enableBoldColour = function(transport) {
    return this._setter(transport, "enableBoldColour");
};

// Whitelist
/**
 * Adds the requested source to the requested whitelist
 * @param {?string} [transport] - Name of the transport to apply
 * @param {string} str - The name of the source to be added to the whitelist
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.addToSourceWhitelist("console", "MySQL");
 * @returns {Jethro} Self
 */
Jethro.prototype.addToSourceWhitelist = function(transport, str) {
    return this._setter(transport, "addToSourceWhitelist", str);
};

/**
 * Removes the requested source, from the requsted transport's whitelist
 * @param {?string} [transport] - Name of the transport to apply
 * @param {string} str - The name of the source to be removed from the whitelist
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.removeFromSourceWhitelist("console", "Express");
 * @returns {Jethro} Self
 */
Jethro.prototype.removeFromSourceWhitelist = function(transport, str) {
    return this._setter(transport, "removeFromSourceWhitelist", str);
};

/**
 * Returns the whitelist of the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.getSourceWhitelist("console");
 * @returns {Array} - Returns the array of the whitelist
 */
Jethro.prototype.getSourceWhitelist = function(transport) {
    return this._getter(transport, "getSourceWhitelist");
};

/**
 * Empties the whitelist of the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.clearSourceWhitelist("console");
 * @returns {Jethro} Self
 */
Jethro.prototype.clearSourceWhitelist = function(transport) {
    return this._setter(transport, "clearSourceWhitelist");
};

// Blacklist
/**
 * Adds the requested source to the requested blacklist
 * @param {?string} [transport] - Name of the transport to apply
 * @param {string} str - The name of the source to be added to the blacklist
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.addToSourceBlacklist("console", "Express");
 * @returns {Jethro} Self
 */
Jethro.prototype.addToSourceBlacklist = function(transport, str) {
    return this._setter(transport, "addToSourceBlacklist", str);
};

/**
 * Removes the requested source, from the requsted transport's blacklist
 * @param {?string} [transport] - Name of the transport to apply
 * @param {string} str - The name of the source to be removed from the blacklist
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.removeFromSourceBlacklist("console", "Express");
 * @returns {Jethro} Self
 */
Jethro.prototype.removeFromSourceBlacklist = function(transport, str) {
    return this._setter(transport, "removeFromSourceBlacklist", str);
};

/**
 * Returns the blacklist of the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.getSourceBlacklist("console");
 * @returns {Array} - Returns the array of the blacklist
 */
Jethro.prototype.getSourceBlacklist = function(transport) {
    return this._getter(transport, "getSourceBlacklist");
};

/**
 * Empties the blacklist of the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @example
 * //Where "console" is the name of the transport:
 * var Jethro = require("jethro");
 * var logger = new Jethro();
 * logger.clearSourceBlacklist("console");
 * @returns {Jethro} Self
 */
Jethro.prototype.clearSourceBlacklist = function(transport) {
    return this._setter(transport, "clearSourceBlacklist");
};

//Source Control
/**
 * Set the source control variable for the specified transport
 * @param {?string} [transport] - Name of the transport to apply
 * @param {string} str - String to set
 * @returns {Jethro} Self
 */
Jethro.prototype.setSourceControlSetting = function(transport, str) {
    return this._setter(transport, "setSourceControlSetting", str);
};

/**
 * Returns the state of the source conrol variable for the specified transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {String} Source control setting
 */
Jethro.prototype.getSourceControlSetting = function(transport) {
    return this._getter(transport, "getSourceControlSetting");
};

/**
 * Resets source whitelist, blacklist and enabled boolean for the specified transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.resetSourceControl = function(transport) {
    return this._setter(transport, "resetSourceControl");
};

/**
 * Disables source control setting for the specified transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.disableSourceControlSetting = function(transport) {
    return this._setter(transport, "disableSourceControlSetting");
};

// Log Level
/**
 * Sets the log level, or allow/ignore value of a specific level for the specified transport
 * @param {?string} [transport] - Name of the transport to apply
 * @param {string} str - Name of the severity to be acted upon
 * @param  {boolean} value - Value of the severity to be set to
 * @returns {Jethro} Self
 */
Jethro.prototype.setLogLevel = function(transport, str, value) {
    return this._setter(transport, "setLogLevel", str, value);
};

// Timestamp
/**
 * Enables the timestamp setting on the specified transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.enableTimestamp = function(transport) {
    return this._setter(transport, "enableTimestamp");
};

/**
 * Disables the timestamp setting on the specified transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.disableTimestamp = function(transport) {
    return this._setter(transport, "disableTimestamp");
};

/**
 * Enables the brackets on the timestamp of the specified transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} - Returning self for chaining purposes
 */
Jethro.prototype.enableBrackets = function(transport) {
    return this._setter(transport, "enableBrackets");
};

/**
 * Disables the brackets on the timestamp of the specified transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.disableBrackets = function(transport) {
    return this._setter(transport, "disableBrackets");
};

/**
 * Sets the format for moment.js timestamp as on the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @param {string} str - The new format value of the timestamp
 * @returns {Jethro} Self
 */
Jethro.prototype.setTimestampFormat = function(transport, str) {
    return this._setter(transport, "setTimestampFormat", str);
};

/**
 * Resets the timestamp format to the default value on the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.resetTimestampFormat = function(transport) {
    return this._setter(transport, "resetTimestampFormat");
};

/**
 * Enables the UTC setting on the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.enableUTC = function(transport) {
    return this._setter(transport, "enableUTC");
};

/**
 * Disables the UTC setting on the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.disableUTC = function(transport) {
    return this._setter(transport, "disableUTC");
};

//Location
/**
 * Enables the location setting on the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.enableLocation = function(transport) {
    return this._setter(transport, "enableLocation");
};

/**
 * Disables the location on the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.disableLocation = function(transport) {
    return this._setter(transport, "disableLocation");
};

/**
 * Import new settings object for this transport
 * @param {?string} [transport] - Name of the transport to apply
 * @param {Settings} settings class
 * @returns {Transport} Self
 */
Jethro.prototype.importSettings = function(transport, settings) {
    return this._setter(transport, "importSettings", settings);
};

/**
 * Returns whether the settings object variables are intact of the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {boolean} A boolean whether the settings are valid or not
 */
Jethro.prototype.isValid = function(transport) {
    return this._getter(transport, "isValid");
};

/**
 * Reverts setting variables to default values if they are incorrect for the requested transport
 * @param {?string} [transport] - Name of the transport to apply
 * @returns {Jethro} Self
 */
Jethro.prototype.clean = function(transport) {
    return this._setter(transport, "clean");
};

/**
 * Returns the currently set location
 * @returns {string} location string
 */
Jethro.prototype.getLocation = function() {
    return this.location;
};

/**
 * Sets the global location setting
 * @param {string} str - Value for the location to be set to
 * @returns {Jethro} Self
 */
Jethro.prototype.setLocation = function(str) {
    this.location = str;
    return this;
};

Jethro.prototype.set = util.deprecate(function(transport, settings) {
    return this._setter(transport, "importSettings", settings);
}, "logger.set is deprecated, please use .importSettings instead!");

//Plugin API - Not yet in use!
/**
 * [Unstable] Function to add plugins to Jethro
 * @param {string} name the plugin name
 * @param {object} object a plugin object
 * @returns {Jethro} Self
 */
Jethro.prototype.addPlugin = function(name, object) {
    this.plugins[name] = object;
    this.plugins[name]._onOutput(this._outputHandler.bind(this));
    this.plugins[name]._onError(this._errorHandler.bind(this));
    return this;
};

/**
 * [Unstable] Function to remove plugins from Jethro
 * @param {string} name - Name od the plugin to remove
 * @returns {Jethro} Self
 */
Jethro.prototype.removePlugin = function(name) {
    delete this.plugins[name];
    return this;
};

Jethro.prototype.onError = function(callback) {
    this.errorHandlers.push(callback);
};

/**
 * [Unstable] Function for emitting internal errors
 * @param {object} error - error packet to be emitted
 * @private
 * @returns {Jethro} Self
 */
Jethro.prototype._errorHandler = function(error) {
    if (this.errorHandlers.length > 0) {
        for (let i = 0; i < this.errorHandlers.length; i++) {
            if (typeof this.errorHandlers[i] === 'function') {
                this.errorHandlers[i](error);
            }
        }

        return this;
    }
    throw error;
};

/**
 * Function for handling outputs to all transports
 * @param {object} data - data packet to be sent to transport modules
 * @private
 */
Jethro.prototype._outputHandler = function(data) {
    let notHandled = true;
    if (this.isValidOutputParameters(data)) {
        for (const i in this.transports) {
            /* istanbul ignore else: hasOwnProperty can't really be tested. */
            if (this.transports.hasOwnProperty(i)) {
                if (
                    this.transports[i].namespaces.length === 0 ||
                    this.transports[i].namespaces.indexOf(data.namespace) > -1
                ) {
                    notHandled = false;
                    this.transports[i]._input(data);
                }
            }
        }
        if (notHandled) {
            throw new Error(`Namespace: ${data.namespace} not handled`);
        }
    } else {
        throw new Error("Missing parameters");
    }
};

/**
 * All purpose log function
 * @param {string} severity - Describes the severity of the log
 * @param {string} source - Declares the source of the log
 * @param {string} message - The message of the log
 * @param {Date|string} [timestamp] - The timestamp of the message, if not provided, new Date();
 * @param {string} [namespace] - The namespace for the log to emit to and be handled by
 * @param {Error} [err] - Error object
 * @param {Object} [x] - Custom logging object
 * @returns {Jethro} Self
 */
Jethro.prototype.log = function(severity, source, message, timestamp, namespace, err, x) {
    if (typeof severity !== "object") {
        if (typeof severity !== "undefined" && typeof source !== "undefined" && typeof message !== "undefined") {
            this._outputHandler({
                severity,
                source,
                message,
                timestamp: timestamp || new Date(),
                namespace: namespace || "logger",
                location: this.location,
                error: err || null,
                x: x || null
            });
        } else {
            this.log(
                "warning", "Logger", `Check syntax, something was undefined - Severity: ${
                    severity} Source: ${source} Message: ${message}`
            );
        }
    } else {
        this.log("warning", "Logger", "An object was passed to Jethro, support for this is currently unavailable!");
    } return this;
};

/**
 * Direct log function, taking in a preformed object
 * @param {object} data - Contains preformed object to be logged
 * @param {string} data.severity - Describes the severity of the log
 * @param {string} data.source - Declares the source of the log
 * @param {string} data.message - The message of the log
 * @param {Date|string} [data.timestamp] - The timestamp of the message, if not provided, new Date();
 * @returns {Jethro} Self
 */
Jethro.prototype.direct = Jethro.prototype.output = function(data) {
    if (typeof data === "object" &&
        data != null) {
        this.log(data.severity, data.source, data.message, data.timestamp);
    } else {
        throw new Error("Missing data parameter.");
    } return this;
};

/**
 * Log function with predefined info severity
 * @param {string} source - Declares the source of the log
 * @param {string} message - The message of the log
 * @param {?Date|string} [timestamp] - The timestamp of the message, if not provided, new Date();
 * @param {?string} [namespace] - The namespace for the log to emit to and be handled by
 * @returns {Jethro} Self
 */
Jethro.prototype.info = function(source, message, timestamp, namespace) {
    this.log("info", source, message, timestamp, namespace);
    return this;
};

/**
 * Log function with predefined transport severity
 * @param {string} source - Declares the source of the log
 * @param {string} message - The message of the log
 * @param {?Date|string} [timestamp] - The timestamp of the message, if not provided, new Date();
 * @param {?string} [namespace] - The namespace for the log to emit to and be handled by
 * @returns {Jethro} Self
 */
Jethro.prototype.transport = function(source, message, timestamp, namespace) {
    this.log("transport", source, message, timestamp, namespace);
    return this;
};

/**
 * Log function with predefined debug severity
 * @param {string} source - Declares the source of the log
 * @param {string} message - The message of the log
 * @param {?Date|string} [timestamp] - The timestamp of the message, if not provided, new Date();
 * @param {?string} [namespace] - The namespace for the log to emit to and be handled by
 * @returns {Jethro} Self
 */
Jethro.prototype.debug = function(source, message, timestamp, namespace) {
    this.log("debug", source, message, timestamp, namespace);
    return this;
};

/**
 * Log function with predefined success severity
 * @param {string} source - Declares the source of the log
 * @param {string} message - The message of the log
 * @param {?Date|string} [timestamp] - The timestamp of the message, if not provided, new Date();
 * @param {?string} [namespace] - The namespace for the log to emit to and be handled by
 * @returns {Jethro} Self
 */
Jethro.prototype.success = function(source, message, timestamp, namespace) {
    this.log("success", source, message, timestamp, namespace);
    return this;
};

/**
 * Log function with predefined warning severity
 * @param {string} source - Declares the source of the log
 * @param {string} message - The message of the log
 * @param {?Date|string} [timestamp] - The timestamp of the message, if not provided, new Date();
 * @param {?string} [namespace] - The namespace for the log to emit to and be handled by
 * @returns {Jethro} Self
 */
Jethro.prototype.warn = Jethro.prototype.warning = function(source, message, timestamp, namespace) {
    this.log("warning", source, message, timestamp, namespace);
    return this;
};

/**
 * Log function with predefined error severity
 * @param {string} source - Declares the source of the log
 * @param {string} message - The message of the log
 * @param {?Date|string} [timestamp] - The timestamp of the message, if not provided, new Date();
 * @param {?string} [namespace] - The namespace for the log to emit to and be handled by
 * @returns {Jethro} Self
 */
Jethro.prototype.error = function(source, message, timestamp, namespace) {
    this.log("error", source, message, timestamp, namespace);
    return this;
};

/**
 * Log function with predefined error severity + stack trace support
 * @param {string} source - Declares the source of the log
 * @param {Error} err - Error object
 * @param {string} err.message - Message string for the error
 * @param {?Date|string} [timestamp] - The timestamp of the message, if not provided, new Date();
 * @param {?string} [namespace] - The namespace for the log to emit to and be handled by
 */
Jethro.prototype.trace = function(source, err, timestamp, namespace) {
    /*
     * While trace is usually used in Java with the lowest severity, it is used here as the same severity as error, and
     * Intuitively addressed as such, because it contains a whole error object but isn't passed as a fatal error.
     */
    if (err instanceof Error) {
        this.log("error", source, err.message, timestamp, namespace);
    } else {
        throw new Error("Error not sent to Jethro.trace");
    }
};

/**
 * Log function with predefined fatal severity + stack trace support. This will go straight to the error handler
 * @param {Error} err - Error object
 * @returns {Jethro} Self
 */
Jethro.prototype.fatal = function(err) {
    if (err instanceof Error) {
        return this._errorHandler(err);
    }
    throw new Error("Error not sent to Jethro.fatal");

};

//Default logger instance
/**
 * Default instance
 * @private
 * @inheritDoc {Jethro}
 * @type {Jethro}
 */
const logger = new Jethro();

module.exports = log;

module.exports.Constructor = Jethro;

module.exports.transports = logger.transports;
module.exports.plugins = logger.plugins;
module.exports.location = logger.location;
module.exports.id = logger.id;

//Map logger methods to exports
module.exports.log = logger.log.bind(logger);
module.exports.direct = logger.direct.bind(logger);
module.exports.output = logger.direct.bind(logger);

//Logging methods
module.exports.info = logger.info.bind(logger);
module.exports.transport = logger.transport.bind(logger);
module.exports.debug = logger.debug.bind(logger);
module.exports.success = logger.success.bind(logger);
module.exports.warn = logger.warn.bind(logger);
module.exports.warning = logger.warning.bind(logger);
module.exports.error = logger.error.bind(logger);
module.exports.trace = logger.trace.bind(logger);
module.exports.fatal = logger.fatal.bind(logger);

//Core methods
module.exports.getId = logger.getId.bind(logger);
module.exports.addPlugin = logger.addPlugin.bind(logger);
module.exports.removePlugin = logger.removePlugin.bind(logger);

//Transport methods
module.exports.addTransport = logger.addTransport.bind(logger);
module.exports.removeTransport = logger.removeTransport.bind(logger);
module.exports.disableTransport = logger.disableTransport.bind(logger);
module.exports.enableTransport = logger.enableTransport.bind(logger);
module.exports.getTransport = logger.getTransport.bind(logger);

module.exports.transportDisabled = logger.transportDisabled.bind(logger);
module.exports.transportEnabled = logger.transportEnabled.bind(logger);

//Colour settings
module.exports.disableColour = logger.disableColour.bind(logger);
module.exports.disableColor = logger.disableColor.bind(logger);
module.exports.enableColour = logger.enableColour.bind(logger);
module.exports.enableColor = logger.enableColor.bind(logger);
module.exports.getColourSettings = logger.getColourSettings.bind(logger);
module.exports.getColorSettings = logger.getColorSettings.bind(logger);
module.exports.disableForceColour = logger.disableForceColour.bind(logger);
module.exports.disableForceColor = logger.disableForceColor.bind(logger);
module.exports.enableForceColour = logger.enableForceColour.bind(logger);
module.exports.enableForceColor = logger.enableForceColor.bind(logger);
module.exports.disableBoldColour = logger.disableBoldColour.bind(logger);
module.exports.disableBoldColor = logger.disableBoldColor.bind(logger);
module.exports.enableBoldColour = logger.enableBoldColour.bind(logger);
module.exports.enableBoldColor = logger.enableBoldColor.bind(logger);

// Whitelst/blacklist settings
module.exports.addToSourceWhitelist = logger.addToSourceBlacklist.bind(logger);
module.exports.removeFromSourceWhitelist = logger.removeFromSourceWhitelist.bind(logger);
module.exports.getSourceWhitelist = logger.getSourceWhitelist.bind(logger);
module.exports.clearSourceWhitelist = logger.clearSourceWhitelist.bind(logger);
module.exports.addToSourceBlacklist = logger.addToSourceBlacklist.bind(logger);
module.exports.removeFromSourceBlacklist = logger.removeFromSourceBlacklist.bind(logger);
module.exports.getSourceBlacklist = logger.getSourceBlacklist.bind(logger);
module.exports.clearSourceBlacklist = logger.clearSourceBlacklist.bind(logger);

//Source Control
module.exports.setSourceControlSetting = logger.setSourceControlSetting.bind(logger);
module.exports.getSourceControlSetting = logger.getSourceControlSetting.bind(logger);
module.exports.resetSourceControl = logger.resetSourceControl.bind(logger);
module.exports.disableSourceControlSetting = logger.disableSourceControlSetting.bind(logger);

module.exports.setLogLevel = logger.setLogLevel.bind(logger);

module.exports.set = logger.set.bind(logger);

module.exports.importSettings = logger.importSettings.bind(logger);
module.exports.isValid = logger.isValid.bind(logger);
module.exports.clean = logger.clean.bind(logger);

//Location
module.exports.enableLocation = logger.enableLocation.bind(logger);
module.exports.disableLocation = logger.disableLocation.bind(logger);
module.exports.getLocation = logger.getLocation.bind(logger);
module.exports.setLocation = logger.setLocation.bind(logger);

//Time settings
module.exports.enableTimestamp = logger.enableTimestamp.bind(logger);
module.exports.disableTimestamp = logger.disableTimestamp.bind(logger);
module.exports.enableBrackets = logger.enableBrackets.bind(logger);
module.exports.disableBrackets = logger.disableBrackets.bind(logger);
module.exports.setTimestampFormat = logger.setTimestampFormat.bind(logger);
module.exports.resetTimestampFormat = logger.resetTimestampFormat.bind(logger);
module.exports.enableUTC = logger.enableUTC.bind(logger);
module.exports.disableUTC = logger.disableUTC.bind(logger);

//Event Emitter Methods
module.exports.onError = logger.onError(logger);

//Transport Classes
module.exports.Settings = Settings;
module.exports.Transport = Transport;
module.exports.Console = Console;
module.exports.File = File;

//Plugin Classes
module.exports.Plugin = Plugin;
module.exports.HttpServer = HttpServer;
module.exports.Express = Express;
//module.exports.Restify = Restify;
