'use strict';

/**
 * @private
 * @type {Plugin}
 */
const Plugin = require("../index.js");

const util = require("util");

/**
 * @private
 * @type {Chalk}
 */
const chalk = require("chalk");

/**
 * @private
 * @type {chalk.constructor}
 */
const forceChalk = new chalk.constructor({
    enabled: true,
    level: chalk.supportsColor && chalk.supportsColor.level > 0 ? chalk.supportsColor.level : 1
});

/**
 *
 * @returns {HttpServer}
 * @constructor
 * @augments {Plugin}
 * @description Used as a template for express, restify and other common http-server modules that may be used as plugins
 * @returns {HttpServer} self
 */
function HttpServer() {
    Plugin.call(this);
    return this;
}

util.inherits(HttpServer, Plugin);

/**
 * Function to format the Jethro log for use with web servers, this aims to standardise output from all webserver types
 * Especially those such as Restify and Express
 * @param {object} data The data to format
 * @param {string} data.ip The ip of the http request
 * @param {string} data.host The host of the http request
 * @param {string} data.route The route of the http request
 * @param {string} data.method The method of the http request
 * @param {number} data.statusCode The statusCode of the http request
 * @param {number} data.responseTime The number representing how long the request took
 * @param {function} callback The callback to call
 * @returns {function} callback Returns the callback with a formatted string as the argument
 */
HttpServer.prototype.format = function(data, callback) {
    const ip = this.spaceOut((data.ip.substr(0, 3) == "::1" ? "127.0.0.1" : data.ip.substr(0, 7) === "::ffff:" ? data.ip.substr(7) : data.ip), 18
    );

    const methods = {
        DELETE: "red",
        GET: "green",
        OPTIONS: "cyan",
        PATCH: "magenta",
        POST: "yellow",
        PUT: "magenta"
    };

    const method = this.spaceOut(forceChalk[methods[data.method]].bold(data.method), 8);
    const route = this.spaceOut(data.host + data.route, 50);
    const responseTime = data.responseTime < 50 ? forceChalk.green.bold(`${data.responseTime} ms`) : data.responseTime < 250 ? forceChalk.yellow.bold(`${data.responseTime} ms`) : forceChalk.red.bold(`${data.responseTime} ms`);

    let level, code;

    /* istanbul ignore else: Can't test invalid HTTP status codes */
    if (data.statusCode >= 500) {
        level = "error";
        code = forceChalk.red.bold(data.statusCode);
    } else if (data.statusCode >= 400) {
        level = "warning";
        code = forceChalk.yellow.bold(data.statusCode);
    } else if (data.statusCode >= 300) {
        level = "info";
        code = forceChalk.cyan.bold(data.statusCode);
    } else if (data.statusCode >= 100) {
        level = "info";
        code = forceChalk.green.bold(data.statusCode);
    }

    return callback(level, `${ip + this.spaceOut(code, 6) + method + route} ${responseTime}`);
};

module.exports = HttpServer;
