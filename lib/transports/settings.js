'use strict';

/**
 * Setting object
 * @constructor
 * @returns {Settings} Self
 */
function Settings() {

    /**
     * Boolean of whether the transport is active or not
     * @type {boolean}
     */
    this._enabled = true;

    /**
     * Colour settings
     * @property {boolean} enabled - Boolean of whether colour output is enabled
     * @property {boolean} bold - Boolean for enabling bold output
     * @property {boolean} force - Boolean for forcing colour output, even if not supported
     * @type {{bold: boolean, enabled: boolean, force: boolean}}
     */
    this.colour = {
        bold: true,
        enabled: true,
        force: false
    };

    /**
     * Severity settings
     * @property {boolean} debug - Boolean for allowing/disallowing debug severity output
     * @property {boolean} transport - Boolean for allowing/disallowing transport severity output
     * @property {boolean} info - Boolean for allowing/disallowing debug info output
     * @property {boolean} success - Boolean for allowing/disallowing debug success output
     * @property {boolean} warning - Boolean for allowing/disallowing debug warning output
     * @property {boolean} error - Boolean for allowing/disallowing debug error output
     * @type {{debug: boolean, transport: boolean, info: boolean, success: boolean, warning: boolean, error: boolean}}
     */
    this.severity = {
        debug: true,
        transport: true,
        info: true,
        success: true,
        warning: true,
        error: true
    };

    /**
     * Source settings
     * @property {?string} enabled - String for whether source whitelist, blacklist or neither are enabled
     * @property {Array} whitelist - List of allowed sources to output through this transport
     * @property {Array} blacklist - List of disallowed sources not to output through this transport
     * @type {{enabled: null, whitelist: Array, blacklist: Array}}
     */
    this.source = {
        enabled: null,
        whitelist: [],
        blacklist: []
    };

    /**
     * Timestamp settings
     * @property {boolean} enabled - Boolean of whether timestamp is part of the output string
     * @property {string} format - Format moment.js should follow for the timestamp
     * @property {boolean} utc - Boolean to force timestamp in UTC
     * @property {boolean} brackets - Boolean to wrap timestamp in brackets
     * @type {{enabled: boolean, format: string, utc: boolean, brackets: boolean}}
     */
    this.timestamp = {
        enabled: true,
        format: "HH:mm:ss[s] SSS[ms]",
        utc: false,
        brackets: false
    };

    /**
     * Location settings
     * @property {boolean} enabled - Boolean of whether to display location or not
     * @type {{enabled: boolean}}
     */
    this.location = {
        enabled: false
    };

    return this;
}

/**
 * Returns whether the settings object variables are intact
 * @returns {boolean} Boolean value for all variable validation checks
 */
Settings.prototype.isValid = function() {
    return typeof this.colour !== "undefined" &&
        typeof this.severity !== "undefined" &&
        typeof this.source !== "undefined" &&
        typeof this.timestamp !== "undefined" &&
        typeof this.location !== "undefined" &&
        typeof this._enabled === 'boolean' &&
        typeof this.colour.bold === 'boolean' &&
        typeof this.colour.enabled === 'boolean' &&
        typeof this.colour.force === 'boolean' &&
        typeof this.severity.debug === 'boolean' &&
        typeof this.severity.transport === 'boolean' &&
        typeof this.severity.info === 'boolean' &&
        typeof this.severity.success === 'boolean' &&
        typeof this.severity.warning === 'boolean' &&
        typeof this.severity.error === 'boolean' &&
        (this.source.enabled === "whitelist" || this.source.enabled === "blacklist" || this.source.enabled === null) &&
        Array.isArray(this.source.whitelist) &&
        Array.isArray(this.source.blacklist) &&
        typeof this.timestamp.enabled === "boolean" &&
        typeof this.timestamp.format === "string" &&
        typeof this.timestamp.utc === "boolean" &&
        typeof this.timestamp.brackets === "boolean" &&
        typeof this.location.enabled === "boolean";
};

Settings.prototype.importSettings = function(settings) {
    if (typeof settings === "object" && settings != null) {

        if (typeof settings.output === "object" && settings.output != null) {

            //Legacy setting object
            this._enabled = true;
            this.colour = {
                bold: true,
                enabled: (typeof settings.output.colour === 'boolean' ? settings.output.colour : true),
                force: false
            };
            this.severity = {
                debug: true,
                transport: true,
                info: true,
                success: true,
                warning: true,
                error: true
            };
            this.source = {
                enabled: null,
                whitelist: (Array.isArray(settings.output.source.whitelist) ? settings.output.source.whitelist : []),
                blacklist: (Array.isArray(settings.output.source.blacklist) ? settings.output.source.blacklist : [])
            };
            this.timestamp = {
                enabled: (typeof settings.output.timestamp === 'boolean' ? settings.output.timestamp : true),
                format: (typeof settings.output.timeformat === "string" ? settings.output.timeformat : "HH:mm:ss[s] SSS[ms]"),
                utc: (typeof settings.output.timestampOpts.utc === 'boolean' ? settings.output.timestampOpts.utc : false),
                brackets: (typeof settings.output.timestampOpts.brackets === 'boolean' ? settings.output.timestampOpts.brackets : false),
            };
            this.location = {
                enabled: false
            };
        } else {

            // New Setting object
            this._enabled = (typeof settings.enabled === 'boolean' ? settings.enabled : true);
            this.colour = {
                bold: (settings.colour && typeof settings.colour.bold === 'boolean' ? settings.colour.bold : true),
                enabled: (settings.colour && typeof settings.colour.enabled === 'boolean' ? settings.colour.enabled : true),
                force: (settings.colour && typeof settings.colour.force === 'boolean' ? settings.colour.force : false)
            };
            this.severity = {
                debug: (settings.severity && typeof settings.severity.debug === 'boolean' ? settings.severity.debug : true),
                transport: (settings.severity && typeof settings.severity.transport === 'boolean' ? settings.severity.transport : true),
                info: (settings.severity && typeof settings.severity.info === 'boolean' ? settings.severity.info : true),
                success: (settings.severity && typeof settings.severity.success === 'boolean' ? settings.severity.success : true),
                warning: (settings.severity && typeof settings.severity.warning === 'boolean' ? settings.severity.warning : true),
                error: (settings.severity && typeof settings.severity.error === 'boolean' ? settings.severity.error : true)
            };
            this.source = {
                enabled: (settings.source && ['blacklist', 'whitelist'].indexOf(settings.source.enabled) > -1 ? settings.source.enabled : null),
                whitelist: (settings.source && Array.isArray(settings.source.whitelist) ? settings.source.whitelist : []),
                blacklist: (settings.source && Array.isArray(settings.source.blacklist) ? settings.source.blacklist : [])
            };
            this.timestamp = {
                enabled: (settings.timestamp && typeof settings.timestamp.enabled === 'boolean' ? settings.timestamp.enabled : true),
                format: (settings.timestamp && typeof settings.timestamp.format === 'string' ? settings.timestamp.format : "HH:mm:ss[s] SSS[ms]"),
                utc: (settings.timestamp && typeof settings.timestamp.utc === 'boolean' ? settings.timestamp.utc : false),
                brackets: (settings.timestamp && typeof settings.timestamp.brackets === 'boolean' ? settings.timestamp.brackets : false)
            };
            this.location = {
                enabled: (settings.location && typeof settings.location.enabled === 'boolean' ? settings.location.enabled : false)
            };
        }
    } else {
        throw new TypeError("Unexpected object in bagging area");
    }
};

/**
 * Reverts setting variables to default values if they are incorrect
 * @returns {Settings} Self
 */
Settings.prototype.clean = function() {
    if (typeof this._enabled !== "boolean") {
        this._enabled = false;
    }
    if (typeof this.colour === "object" && this.colour != null) {
        if (typeof this.colour.bold !== "boolean") {
            this.colour.bold = true;
        }
        if (typeof this.colour.enabled !== "boolean") {
            this.colour.enabled = true;
        }
        if (typeof this.colour.force !== "boolean") {
            this.colour.force = false;
        }
    } else {
        this.colour = {
            bold: true,
            enabled: true,
            force: false
        };
    }
    if (typeof this.severity === "object" && this.severity != null) {
        if (typeof this.severity.debug !== 'boolean') {
            this.severity.debug = true;
        }
        if (typeof this.severity.transport !== 'boolean') {
            this.severity.transport = true;
        }
        if (typeof this.severity.info !== 'boolean') {
            this.severity.info = true;
        }
        if (typeof this.severity.success !== 'boolean') {
            this.severity.success = true;
        }
        if (typeof this.severity.warning !== 'boolean') {
            this.severity.warning = true;
        }
        if (typeof this.severity.error !== 'boolean') {
            this.severity.error = true;
        }
    } else {
        this.severity = {
            debug: true,
            transport: true,
            info: true,
            success: true,
            warning: true,
            error: true
        };
    }
    if (typeof this.source === "object" && this.source != null) {
        if (this.source.enabled !== "whitelist" && this.source.enabled !== "blacklist" && this.source.enabled !== null) {
            this.source.enabled = null;
        }
        if (!(Array.isArray(this.source.whitelist))) {
            this.source.whitelist = [];
        }
        if (!(Array.isArray(this.source.blacklist))) {
            this.source.blacklist = [];
        }
    } else {
        this.source = {
            enabled: null,
            whitelist: [],
            blacklist: []
        };
    }
    if (typeof this.timestamp === "object" && this.timestamp != null) {
        if (typeof this.timestamp.enabled !== "boolean") {
            this.timestamp.enabled = true;
        }
        if (typeof this.timestamp.format !== "string") {
            this.resetTimestampFormat();
        }
        if (typeof this.timestamp.utc !== "boolean") {
            this.timestamp.utc = false;
        }
        if (typeof this.timestamp.brackets !== "boolean") {
            this.timestamp.brackets = false;
        }
    } else {
        this.timestamp = {
            enabled: true,
            format: "HH:mm:ss[s] SSS[ms]",
            utc: false,
            brackets: false
        };
    }
    if (typeof this.location === "object" && this.location != null) {
        if (typeof this.location.enabled !== "boolean") {
            this.location.enabled = false;
        }
    } else {
        this.location = {
            enabled: false
        };
    }
    return this;
};

/**
 * Disables the current transport
 * @returns {Settings} Self
 */
Settings.prototype.disable = function() {
    this._enabled = false;
    return this;
};

/**
 * Enables the current Transport
 * @returns {Settings} Self
 */
Settings.prototype.enable = function() {
    this._enabled = true;
    return this;
};

/**
 * Returns whether this transport is enabled
 * @returns {boolean} Boolean of the transport's enabled state
 */
Settings.prototype.enabled = function() {
    return this._enabled;
};

/**
 * Returns whether this transport is disabled
 * @returns {boolean} Boolean of the transport's disabled state
 */
Settings.prototype.disabled = function() {
    return !this._enabled;
};

// Colour
/**
 * Disables the colour setting for this transport
 * @returns {Settings} Self
 */
Settings.prototype.disableColor = Settings.prototype.disableColour = function() {
    this.colour.enabled = false;
    return this;
};

/**
 * Enables the colour setting for this transport
 * @returns {Settings} Self
 */
Settings.prototype.enableColor = Settings.prototype.enableColour = function() {
    this.colour.enabled = true;
    return this;
};

/**
 * Returns the colour setting object for this transport
 * @returns {object} Colour settings object
 */
Settings.prototype.getColorSettings = Settings.prototype.getColourSettings = function() {
    return this.colour;
};

/**
 * Disables the force colour option for this transport
 * @returns {Settings} Self
 */
Settings.prototype.disableForceColor = Settings.prototype.disableForceColour = function() {
    this.colour.force = false;
    return this;
};

/**
 * Enables the force colour option for this transport
 * @returns {Settings} Self
 */
Settings.prototype.enableForceColor = Settings.prototype.enableForceColour = function() {
    this.colour.force = true;
    return this;
};

/**
 * Disables the bold colour option for this transport
 * @returns {Settings} Self
 */
Settings.prototype.disableBoldColor = Settings.prototype.disableBoldColour = function() {
    this.colour.bold = false;
    return this;
};

/**
 * Enables the bold colour option for this transport
 * @returns {Settings} Self
 */
Settings.prototype.enableBoldColor = Settings.prototype.enableBoldColour = function() {
    this.colour.bold = true;
    return this;
};

// Whitelist
/**
 * Adds the specified string to the source whitelist for this transport
 * @param {string} str - Value to add to whitelist
 * @returns {Settings} Self
 */
Settings.prototype.addToSourceWhitelist = function(str) {
    if (typeof str !== "string") {
        throw new TypeError("Argument not a string");
    }
    if (this.source.whitelist.indexOf(str) === -1) {
        this.source.whitelist.push(str);
    }
    return this;
};

/**
 * Removes the specified string from the source whitelist for this transport
 * @param {string} str - Value remove from whitelist
 * @returns {Settings} Self
 */
Settings.prototype.removeFromSourceWhitelist = function(str) {
    if (typeof str !== "string") {
        throw new TypeError("Argument not a string");
    }
    const index = this.source.whitelist.indexOf(str);
    if (index > -1) {
        this.source.whitelist.splice(index, 1);
    }
    return this;
};

/**
 * Returns the whitelist array for this transport
 * @returns {Array} Whitelist
 */
Settings.prototype.getSourceWhitelist = function() {
    return this.source.whitelist;
};

/**
 * Clears the whitelist for this transport
 * @returns {Settings} Self
 */
Settings.prototype.clearSourceWhitelist = function() {
    this.source.whitelist = [];
    return this;
};

// Blacklist
/**
 * Adds the specified string to the source blacklist for this transport
 * @param {string} str - Value to add to blacklist
 * @returns {Settings} Self
 */
Settings.prototype.addToSourceBlacklist = function(str) {
    if (typeof str !== "string") {
        throw new TypeError("Argument not a string");
    }
    if (this.source.blacklist.indexOf(str) === -1) {
        this.source.blacklist.push(str);
    }
    return this;
};

/**
 * Removes the specified string from the source blacklist for this transport
 * @param {string} str - Value to remove from blacklist
 * @returns {Settings} Self
 */
Settings.prototype.removeFromSourceBlacklist = function(str) {
    if (typeof str !== "string") {
        throw new TypeError("Argument not a string");
    }
    const index = this.source.blacklist.indexOf(str);
    if (index > -1) {
        this.source.blacklist.splice(index, 1);
    }
    return this;
};

/**
 * Returns the blacklist array for this transport
 * @returns {Array} Whitelist
 */
Settings.prototype.getSourceBlacklist = function() {
    return this.source.blacklist;
};

/**
 * Clears the blacklist for this transport
 * @returns {Settings} Self
 */
Settings.prototype.clearSourceBlacklist = function() {
    this.source.blacklist = [];
    return this;
};

//Source Control
/**
 * Set the source control variable
 * @param {string} str - String to set
 * @returns {Settings} Self
 */
Settings.prototype.setSourceControlSetting = function(str) {
    if (str === "whitelist") {
        this.source.enabled = "whitelist";
        return this;
    } else if (str === "blacklist") {
        this.source.enabled = "blacklist";
        return this;
    } else if (str === null) {
        this.source.enabled = null;
        return this;
    }
    throw new Error("Unrecognised source control setting");

};

/**
 * Returns the state of the source conrol variable
 * @returns {String} Source control setting
 */
Settings.prototype.getSourceControlSetting = function() {
    return this.source.enabled;
};

/**
 * Resets source whitelist, blacklist and enabled boolean
 * @returns {Settings} Self
 */
Settings.prototype.resetSourceControl = function() {
    this.source.whitelist = [];
    this.source.blacklist = [];
    this.source.enabled = null;
    return this;
};

/**
 * Disables source control setting
 * @returns {Settings} Self
 */
Settings.prototype.disableSourceControlSetting = function() {
    this.source.enabled = null;
    return this;
};

// Log Level
/**
 * Sets the log level, or allow/ignore value of a specific level for this transport
 * @param  {string} str - Name of the severity to be acted upon
 * @param  {boolean} value - Value of the severity to be set to
 * @returns {Settings} Self returns an instance of Settings
 */
Settings.prototype.setLogLevel = function(str, value) {
    if (typeof str === "string" && typeof value !== "undefined") {
        if (typeof value === "boolean") {
            const s = this.severity;
            for (const i in s) {
                if (s.hasOwnProperty(i) && i === str) {
                    s[str] = value;
                    return this;
                }
            }
            throw new Error("Severity not found in settings");
        } else {
            throw new TypeError("Second argument must be true or false");
        }
    } else {
        throw new Error("Invalid arguments");
    }
};

// Timestamp
/**
 * Enables the timestamp setting for this transport
 * @returns {Settings} Self
 */
Settings.prototype.enableTimestamp = function() {
    this.timestamp.enabled = true;
    return this;
};

/**
 * Disables the timestamp setting for this transport
 * @returns {Settings} Self
 */
Settings.prototype.disableTimestamp = function() {
    this.timestamp.enabled = false;
    return this;
};

/**
 * Enables the brackets on the timestamp for this transport
 * @returns {Settings} - Returning self for chaining purposes
 */
Settings.prototype.enableBrackets = function() {
    this.timestamp.brackets = true;
    return this;
};

/**
 * Disables the brackets on the timestamp for this transport
 * @returns {Settings} Self
 */
Settings.prototype.disableBrackets = function() {
    this.timestamp.brackets = false;
    return this;
};

/**
 * Sets the format for moment.js timestamp string for this transport
 * @param {string} str - The new format value of the timestamp
 * @returns {Settings} Self
 */
Settings.prototype.setTimestampFormat = function(str) {
    if (typeof str === "string") {
        this.timestamp.format = str;
        return this;
    }
    throw new TypeError("Argument not a string");

};

/**
 * Resets the timestamp format to the default value for this transport
 * @returns {Settings} Self
 */
Settings.prototype.resetTimestampFormat = function() {
    this.timestamp.format = "HH:mm:ss[s] SSS[ms]";
    return this;
};

/**
 * Enables the UTC setting for this transport
 * @returns {Settings} Self
 */
Settings.prototype.enableUTC = function() {
    this.timestamp.utc = true;
    return this;
};

/**
 * Disables the UTC setting ofor this transport
 * @returns {Settings} Self
 */
Settings.prototype.disableUTC = function() {
    this.timestamp.utc = false;
    return this;
};

// Location

/**
 * Enables the location for this transport
 * @returns {Settings} Self
 */
Settings.prototype.enableLocation = function() {
    this.location.enabled = true;
    return this;
};

/**
 * Disables the location for this transport
 * @returns {Settings} Self
 */
Settings.prototype.disableLocation = function() {
    this.location.enabled = false;
    return this;
};

module.exports = Settings;
