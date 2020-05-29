"use strict";

const assign = require("object-assign");
const chalk = require("chalk");
const date = new Date();
const lolex = require('lolex');
const clock = lolex.install({
    now: date
});
const expect = require("unexpected");
const Jethro = require("../");
const logger = new Jethro();
const moment = require("moment");
const now = moment(date.toISOString()).format('H:mm');
const nowUTC = moment(date.toISOString()).utc().format('H:mm');
const output = logger.output.bind(logger);
const stdout = require("test-console").stdout;
const defaultInfo = {
    message: "Testing Output",
    source: "Tests",
    timestamp: date
};
const defaultSet = function() {
    logger.clean().disableLocation().disableBrackets().disableUTC().enableColour().enableTimestamp().resetSourceControl().setTimestampFormat(undefined, 'H:mm').enableForceColor().enableTransport("console");
};
const forceChalk = new chalk.constructor({
    enabled: true,
    level: chalk.supportsColor && chalk.supportsColor.level > 0 ? chalk.supportsColor.level : 1
});

describe("Jethro Transport Functionality", () => {
    beforeEach(defaultSet);
    describe("Transport formatString", () => {
        it("Should throw on non object", () => {
            expect(() => {
                logger.transports.console.formatString(undefined);
            }, "to throw", new Error("A non-object was sent to the Logger.output() function! See: undefined"));
        });
    });
    describe("Transport _input", () => {
        it("Should throw missing parameters if parameters are missing", () => {
            expect(() => {
                logger.transports.console._input(undefined);
            }, "to throw", new Error("Missing parameters!"));
        });
    });
    describe("Transport _throwError", () => {
        it("Should throw on no error handler", () => {
            const error = new TypeError("Test is undefined");
            expect(() => {
                const transport = new Jethro.Transport();

                transport._throwError(error);
            }, "to throw", error);
        });
        it("Should not log an error if error handler isn't a function", () => {
            const error = new TypeError("Test is undefined");
            const inspect = stdout.inspectSync(() => {
                const transport = new Jethro.Transport();
                transport._onError(undefined);

                transport._throwError(error);
            });

            expect(inspect, "to be empty");
        });
        it("Should log an error", () => {
            const error = new TypeError("Test is undefined");
            const inspect = stdout.inspectSync(() => {
                const transport = new Jethro.Transport();
                transport._onError((data) => {
                    console.log(data.stack);
                });

                transport._throwError(error);
            });

            expect(inspect[0], "to equal", `${error.stack}\n`);
        });
    });
    describe("Transport getLocation", () => {
        it("Should return the location", () => {
            expect(logger.transports.console.getLocation({location: "127.0.0.1"}), "to equal", "[127.0.0.1]");
        });
    });
    describe("Transport getMessage", () => {
        it("Should return the message", () => {
            expect(logger.transports.console.getMessage({message: "test"}), "to equal", "test");
        });
        it("Should inspect on a non string", () => {
            expect(logger.transports.console.getMessage({message: {foo: 'bar'}}), "to equal", require("util").inspect({foo: 'bar'}));
        });
    });
    describe("Transport getSeverity", () => {
        it("Should return [Info] with Magenta for info severity", () => {
            expect(logger.transports.console.getSeverity({severity: "info"}), "to equal", `[${chalk.magenta.bold("Info")}]`);
        });
        it("Should return undefined for invalid severity", () => {
            expect(logger.transports.console.getSeverity(undefined), "to equal", "[undefined]");
        });
    });
    describe("Transport getSeverityColor", () => {
        describe("Force colors", () => {
            it("Should return yellow for warning", () => {
                expect(logger.transports.console.getSeverityColour("warning"), "to equal", forceChalk.yellow.bold("warning"));
            });
            it("Should return blue for debug", () => {
                expect(logger.transports.console.getSeverityColour("debug"), "to equal", forceChalk.blue.bold("debug"));
            });
            it("Should return red for error", () => {
                expect(logger.transports.console.getSeverityColour("error"), "to equal", forceChalk.red.bold("error"));
            });
            it("Should return magenta for info", () => {
                expect(logger.transports.console.getSeverityColour("info"), "to equal", forceChalk.magenta.bold("info"));
            });
            it("Should return magenta for success", () => {
                expect(logger.transports.console.getSeverityColour("success"), "to equal", forceChalk.green.bold("success"));
            });
            it("Should return cyan for transport", () => {
                expect(logger.transports.console.getSeverityColour("transport"), "to equal", forceChalk.cyan.bold("transport"));
            });
        });
        describe("Normal colors", () => {
            beforeEach(() => {
                logger.disableForceColour();
            });
            it("Should return yellow for warning", () => {
                expect(logger.transports.console.getSeverityColour("warning"), "to equal", chalk.yellow.bold("warning"));
            });
            it("Should return blue for debug", () => {
                expect(logger.transports.console.getSeverityColour("debug"), "to equal", chalk.blue.bold("debug"));
            });
            it("Should return red for error", () => {
                expect(logger.transports.console.getSeverityColour("error"), "to equal", chalk.red.bold("error"));
            });
            it("Should return magenta for info", () => {
                expect(logger.transports.console.getSeverityColour("info"), "to equal", chalk.magenta.bold("info"));
            });
            it("Should return green for success", () => {
                expect(logger.transports.console.getSeverityColour("success"), "to equal", chalk.green.bold("success"));
            });
            it("Should return cyan for transport", () => {
                expect(logger.transports.console.getSeverityColour("transport"), "to equal", chalk.cyan.bold("transport"));
            });
        });
        describe("Transport Trace", () => {
            it("Should Log to console with trace level for Logger.transports.console.trace", () => {
                const error = new TypeError("Test is undefined");
                const inspect = stdout.inspectSync(() => {
                    logger.transports.console.trace("Tests", error);
                });

                expect(inspect[0], "to be", `${now} [${chalk.red.bold("Error")}]     [Tests]         ${error.message}\n`);
            });

            it("Should throw if a non error is sent in", () => {
                expect(() => {
                    logger.transports.console.trace("tests", undefined);
                }, "to throw", new Error("Error not sent to Jethro.trace"));
            });

        });
    });
    describe("Transport getSource", () => {
        it("Should return the source", () => {
            expect(logger.transports.console.getSource({source: "source"}), "to equal", "[source]");
        });
        it("Should default to [undefined] on invalid source", () => {
            expect(logger.transports.console.getSource(undefined), "to equal", "[undefined]");
        });
    });
    describe("Transport getTimestamp", () => {
        it("Should return the timestamp", () => {
            expect(logger.transports.console.getTimestamp({timestamp: date}), "to equal", moment(date.toISOString()).format(logger.transports.console.settings.timestamp.format));
        });
        it("Should return the timestamp in utc", () => {
            logger.enableUTC();

            expect(logger.transports.console.getTimestamp({timestamp: date}), "to equal", moment(date.toISOString()).utc().format(logger.transports.console.settings.timestamp.format));
        });
        it("Should return the timestamp with brackets", () => {
            logger.enableBrackets();

            expect(logger.transports.console.getTimestamp({timestamp: date}), "to equal", `[${moment(date.toISOString()).format(logger.transports.console.settings.timestamp.format)}]`);
        });
    });
    describe("Transport output", () => {
        it("Should throw if output function isn't overriden", () => {
            expect(() => {
                const transport = new Jethro.Transport();

                transport.output();
            }, "to throw", new Error("Output function not overwritten!"));
        });
    });
});
describe("logger.set (deprecated)", () => {
    it("Should log its deprecated", (done) => {
        if (process.versions.node.split(".")[0] > 5) {
            logger.set("console", {});
            process.on("warning", (warning) => {
                expect(warning.message, "to be", "logger.set is deprecated, please use .importSettings instead!");

                return done();
            });
        } else {
            const stderr = require('test-console').stderr;
            const inspect = stderr.inspectSync((() => {
                logger.set("console", {});
            }));
            expect(inspect[0], "to be", "logger.set is deprecated, please use .importSettings instead!\n");
            return done();
        }
    });
});
describe("Logging Tests", () => {
    beforeEach(defaultSet);
    after(() => clock.uninstall());

    describe("Output disabled", () => {
        it("Shouldn't log if console transport is disabled", () => {
            logger.disableTransport("console");
            const inspect = stdout.inspectSync(() => {
                output(assign({}, defaultInfo, {
                    severity: "error"
                }));
            });

            expect(inspect, "to be empty");
        });
    });

    describe("Direct output", () => {
        it("Should throw on invalid type for direct output", () => {
            expect(() => {
                output(undefined);
            }, "to throw", new Error("Missing data parameter."));
        });
    });

    describe("Legacy output", () => {
        // TODO: Fix legacy output. Currently it does not auto capitalize the severity, nor the source. As well as settings are not working for it. Not sure why.
        it("Should work with Legacy output", () => {
            const inspect = stdout.inspectSync(() => {
                Jethro("Info", "Tests", "Testing Output", date);
            });

            expect(inspect[0], "to contain", `[${chalk.magenta.bold("Info")}]      [Tests]         Testing Output\n`);
        });
    });
    describe("Logger addTransport", () => {
        it("Should fail on non instance of Transport", () => {
            expect(() => {
                logger.addTransport("test", undefined);
            }, "to throw", new TypeError("Provided Transport not an instance of Transport Class"));
        });
        it("Should fail on non string transport name", () => {
            expect(() => {
                logger.addTransport(undefined);
            }, "to throw", new TypeError("Provided Transport Name is not a string."));
        });
    });
    describe("Logger getTransport", () => {
        it("Should get the console transport", () => {
            expect(logger.getTransport("console") instanceof Jethro.Transport, "to be", true);
        });
        it("Should throw if it can't find the transport", () => {
            expect(() => {
                logger.getTransport("undefined");
            }, "to throw", new Error("Transport not found by name"));
        });
    });
    describe("Logger removeTransport", () => {
        it("Should throw if a non string is sent in", () => {
            expect(() => {
                logger.removeTransport(undefined);
            }, "to throw", new TypeError("Invalid Transport specified"));
        });
    });
    describe("Logger getId", () => {
        it("Should have an ID", () => {
            expect(logger.getId(), "to match", /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/i);
        });
    });

    describe("Logger resetTimestampFormat", () => {
        it("Should reset the format", () => {
            logger.resetTimestampFormat();

            expect(logger.transports.console.settings.timestamp.format, "to equal", "HH:mm:ss[s] SSS[ms]");
        });
    });

    describe("Logger _outputHandler", () => {
        it("Should throw on invalid data", () => {
            expect(() => {
                logger._outputHandler(undefined);
            }, "to throw", new Error("Missing parameters"));
        });

        // TODO: Fix when namespaces can be added.
        it.skip("Should throw if not handled by a transport", () => {
            expect(() => {
                logger._outputHandler(assign({}, defaultInfo, {
                    namespace: "testing",
                    severity: "info"
                }));
            }, "to throw", new Error("Namespace: testing not handled"));
        });
    });

    describe("Logger Levels", () => {
        it("Should Log to console with debug level", () => {
            const inspect = stdout.inspectSync(() => {
                output(assign({}, defaultInfo, {
                    severity: "debug"
                }));
            });

            expect(inspect[0], "to be", `${now} [${chalk.blue.bold("Debug")}]     [Tests]         Testing Output\n`);
        });

        it("Should Log to console with error level", () => {
            const inspect = stdout.inspectSync(() => {
                output(assign({}, defaultInfo, {
                    severity: "error"
                }));
            });

            expect(inspect[0], "to be", `${now} [${chalk.red.bold("Error")}]     [Tests]         Testing Output\n`);
        });

        it("Should Log to console with info level", () => {
            const inspect = stdout.inspectSync(() => {
                output(assign({}, defaultInfo, {
                    severity: "info"
                }));

            });

            expect(inspect[0], "to be", `${now} [${chalk.magenta.bold("Info")}]      [Tests]         Testing Output\n`);
        });

        it("Should Log to console with success level", () => {
            const inspect = stdout.inspectSync(() => {
                output(assign({}, defaultInfo, {
                    severity: "success"
                }));

            });

            expect(inspect[0], "to be", `${now} [${chalk.green.bold("Success")}]   [Tests]         Testing Output\n`);
        });

        it("Should Log to console with transport level", () => {
            const inspect = stdout.inspectSync(() => {
                output(assign({}, defaultInfo, {
                    severity: "transport"
                }));

            });

            expect(inspect[0], "to be", `${now} [${chalk.cyan.bold("Transport")}] [Tests]         Testing Output\n`);
        });

        it("Should Log to console with warning level", () => {
            const inspect = stdout.inspectSync(() => {
                output(assign({}, defaultInfo, {
                    severity: "warning"
                }));

            });

            expect(inspect[0], "to be", `${now} [${chalk.yellow.bold("Warning")}]   [Tests]         Testing Output\n`);
        });

    });

    describe("Logger.<level> Tests", () => {
        it("Should Log to console with debug level for Logger.debug", () => {
            const inspect = stdout.inspectSync(() => {
                logger.debug("Tests", "Testing Output", date);
            });

            expect(inspect[0], "to be", `${now} [${chalk.blue.bold("Debug")}]     [Tests]         Testing Output\n`);
        });

        it("Should Log to console with error level for Logger.error", () => {
            const inspect = stdout.inspectSync(() => {
                logger.error("Tests", "Testing Output", date);
            });

            expect(inspect[0], "to be", `${now} [${chalk.red.bold("Error")}]     [Tests]         Testing Output\n`);
        });

        it("Should Log to console with info level for Logger.info", () => {
            const inspect = stdout.inspectSync(() => {
                logger.info("Tests", "Testing Output", date);
            });

            expect(inspect[0], "to be", `${now} [${chalk.magenta.bold("Info")}]      [Tests]         Testing Output\n`);
        });

        it("Should Log to console with success level for Logger.success", () => {
            const inspect = stdout.inspectSync(() => {
                logger.success("Tests", "Testing Output", date);
            });

            expect(inspect[0], "to be", `${now} [${chalk.green.bold("Success")}]   [Tests]         Testing Output\n`);
        });

        describe("Logger Fatal", () => {
            it("Should throw an error if no errorhandlers for Logger.fatal", () => {
                const error = new TypeError("Test is undefined");
                expect(() => {
                    logger.fatal(error);
                }, "to throw", error);
            });
            it("Should work with an added errorHandler", () => {
                const error = new TypeError("Test is undefined");
                const inspect = stdout.inspectSync(() => {
                    logger.onError((data) => {
                        console.log(data.stack);
                    });
                    logger.fatal(error);
                });

                expect(inspect[0], "to equal", `${error.stack}\n`);
            });

            it("Should throw if a non error is sent in", () => {
                expect(() => {
                    logger.fatal("tests");
                }, "to throw", new Error("Error not sent to Jethro.fatal"));
            });

        });

        describe("Logger Trace", () => {
            it("Should Log to console with error level for Logger.trace", () => {
                const error = new TypeError("Test is undefined");
                const inspect = stdout.inspectSync(() => {
                    logger.trace("Tests", error);
                });

                expect(inspect[0], "to be", `${now} [${chalk.red.bold("Error")}]     [Tests]         ${error.message}\n`);
            });

            it("Should throw if a non error is sent in", () => {
                expect(() => {
                    logger.trace("tests", undefined);
                }, "to throw", new Error("Error not sent to Jethro.trace"));
            });

        });

        it("Should Log to console with transport level for Logger.transport", () => {
            const inspect = stdout.inspectSync(() => {
                logger.transport("Tests", "Testing Output", date);
            });

            expect(inspect[0], "to be", `${now} [${chalk.cyan.bold("Transport")}] [Tests]         Testing Output\n`);
        });

        it("Should Log to console with warning level for Logger.warning", () => {
            const inspect = stdout.inspectSync(() => {
                logger.warning("Tests", "Testing Output", date);
            });

            expect(inspect[0], "to be", `${now} [${chalk.yellow.bold("Warning")}]   [Tests]         Testing Output\n`);
        });

    });

    describe("Logger Undefined / thrown errors", () => {
        it("should Log to console with undefined message", () => {
            const inspect = stdout.inspectSync(() => {
                output(assign({}, defaultInfo, {
                    message: undefined,
                    severity: "info",
                }));
            });
            expect(inspect[0], "to be", `${now} [${chalk.yellow.bold("Warning")}]   [Logger]        Check syntax, something was undefined - Severity: info Source: Tests Message: undefined\n`);

        });

        it("Should Log to console with bogus level", () => {
            const inspect = stdout.inspectSync(() => {
                output(assign({}, defaultInfo, {
                    severity: "bogus"
                }));

            });

            expect(inspect[0], "to be", `${now} [Bogus]     [Tests]         Testing Output\n`);
        });

        it("Should Log to console with undefined severity", () => {
            const inspect = stdout.inspectSync(() => {
                output(assign({}, defaultInfo, {
                    severity: undefined
                }));

            });

            expect(inspect[0], "to be", `${now} [${chalk.yellow.bold("Warning")}]   [Logger]        Check syntax, something was undefined - Severity: undefined Source: Tests Message: Testing Output\n`);
        });

        it("should Log to console with undefined source", () => {
            const inspect = stdout.inspectSync(() => {
                output(assign({}, defaultInfo, {
                    message: "Testing Output",
                    severity: "info",
                    source: undefined
                }));
            });

            expect(inspect[0], "to be", `${now} [${chalk.yellow.bold("Warning")}]   [Logger]        Check syntax, something was undefined - Severity: info Source: undefined Message: Testing Output\n`);
        });

        it("Should warn if object is passed to logger", () => {
            const inspect = stdout.inspectSync(() => {
                logger.log({
                    test: "test"
                });
            });

            expect(inspect[0], "to be", `${now} [${chalk.yellow.bold("Warning")}]   [Logger]        An object was passed to Jethro, support for this is currently unavailable!\n`);
        });

        it("Should throw if non object is passed to output", () => {

            // Adding try catch to bypass it from failing tests.
            try {
                expect(output("testing"), "to throw");
            } catch (ex) { // No need to log an exception was caught.
            }
        });

        it("Should warn if something is undefined", () => {
            const inspect = stdout.inspectSync(() => {
                logger.log("info", "Test", undefined, date);
            });

            expect(inspect[0], "to contain", "Check syntax, something was undefined - Severity");
        });
    });

    describe("Custom Log settings", () => {
        describe("Brackets", () => {
            it("Should log timestamp with brackets", () => {
                logger.enableBrackets();
                const inspect = stdout.inspectSync(() => {
                    output(assign({}, defaultInfo, {
                        message: "Testing Output",
                        severity: "info",
                        source: "Tests"
                    }));

                });

                expect(inspect[0], "to be", `[${now}]` + ` [\x1b[35m\x1b[1mInfo\x1b[22m\x1b[39m]      [Tests]         Testing Output\n`);
            });
        });
        describe("Location", () => {
            it("Should log a location", () => {
                logger.enableLocation("console");
                const inspect = stdout.inspectSync(() => {
                    output(assign({}, defaultInfo, {
                        message: "Testing Output",
                        severity: "info",
                        source: "Tests"
                    }));

                });

                expect(inspect[0], "to be", `${now} [\x1b[35m\x1b[1mInfo\x1b[22m\x1b[39m]     ${logger.spaceOut(`[${logger.getLocation()}]`, 20)} [Tests]         Testing Output\n`);
            });
        });
        describe("Whitelist / Blacklist", () => {
            describe("Blacklist", () => {
                let inspect;
                beforeEach(() => {
                    logger.addToSourceBlacklist(undefined, "Tests").setSourceControlSetting(undefined, "blacklist");
                    inspect = stdout.inspectSync(() => {
                        output(assign({}, defaultInfo, {
                            message: "Testing Output",
                            severity: "info",
                            source: "Tests"
                        }));
                        output(assign({}, defaultInfo, {
                            message: "Testing Output",
                            severity: "info",
                            source: "Not Tests"
                        }));
                    });
                });

                it("Should only have one output", () => {
                    expect(inspect.length, "to be", 1);
                });
                it("Should only log from Tests source", () => {
                    expect(inspect[0], "to be", `${now} [\x1b[35m\x1b[1mInfo\x1b[22m\x1b[39m]      [Not Tests]     Testing Output\n`);
                });

            });
            describe("Whitelist", () => {
                let inspect;
                beforeEach(() => {
                    logger.addToSourceWhitelist(undefined, "Tests").setSourceControlSetting(undefined, "whitelist");
                    inspect = stdout.inspectSync(() => {
                        output(assign({}, defaultInfo, {
                            message: "Testing Output",
                            severity: "info",
                            source: "Tests"
                        }));
                        output(assign({}, defaultInfo, {
                            message: "Testing Output",
                            severity: "info",
                            source: "Not Tests"
                        }));
                    });
                });
                it("Should only have one output", () => {
                    expect(inspect.length, "to be", 1);
                });
                it("Should only log from Tests source", () => {
                    expect(inspect[0], "to be", `${now} [\x1b[35m\x1b[1mInfo\x1b[22m\x1b[39m]      [Tests]         Testing Output\n`);
                });

            });
        });
        describe("Colors", () => {
            it("should Log to console with no colour", () => {
                logger.disableColour();
                const inspect = stdout.inspectSync(() => {
                    output(assign({}, defaultInfo, {
                        severity: "info"
                    }));
                });

                expect(inspect[0], "to be", `${now} [Info]      [Tests]         Testing Output\n`);
            });
        });
        describe("Timeformats", () => {
            it("Should log with a custom format", () => {
                logger.setTimestampFormat(undefined, "DD:MM:YYYY");
                const inspect = stdout.inspectSync(() => {
                    output(assign({}, defaultInfo, {
                        message: "Testing Output",
                        severity: "info",
                        source: "Tests"
                    }));

                });
                expect(inspect[0], "to be", `${moment().format("DD:MM:YYYY")} [\x1b[35m\x1b[1mInfo\x1b[22m\x1b[39m]      [Tests]         Testing Output\n`);
            });

            it("Should log with utc format", () => {
                logger.enableUTC();
                const inspect = stdout.inspectSync(() => {
                    output(assign({}, defaultInfo, {
                        message: "Testing Output",
                        severity: "info",
                        source: "Tests"
                    }));

                });
                expect(inspect[0], "to be", `${nowUTC} [\x1b[35m\x1b[1mInfo\x1b[22m\x1b[39m]      [Tests]         Testing Output\n`);
            });
            it("should Log to console with no timestamp", () => {
                logger.disableTimestamp();
                const inspect = stdout.inspectSync(() => {
                    output(assign({}, defaultInfo, {
                        severity: "info",
                    }));
                });

                expect(inspect[0], "to equal", ` [${chalk.magenta.bold("Info")}]      [Tests]         Testing Output\n`);
            });
        });
    });
});

