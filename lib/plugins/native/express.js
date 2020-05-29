'use strict';

const HttpServer = require("../defaults/http.js");
const util = require("util");

/**
 * Express Jethro plugin constructor
 * @returns {Express} Self
 * @constructor
 * @augments {Plugin} Self
 */
function Express() {
    HttpServer.call(this);
    return this;
}

util.inherits(Express, HttpServer);

/**
 * Input function for returning Express middleware to log to jethro
 * @returns {function} Express middleware
 */
Express.prototype.input = function() {
    const self = this;

    return function log(req, res, next) {
        const startTime = new Date();
        const end = res.end;

        res.end = function(chunk, encoding) {

            res.end = end;
            res.end(chunk, encoding);

            const obj = {
                ip: req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || (req.connection && req.connection.remoteAddress) || "0.0.0.0",
                host: req.headers.host,
                route: req.originalUrl,
                method: req.method,
                statusCode: res.statusCode,
                responseTime: new Date() - startTime
            };

            self.format(obj, (severity, message) => {
                self.log(severity, "Express", message, null, obj);
            });
        };
        next();
    };
};

module.exports = Express;
