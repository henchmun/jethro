"use strict";

const expect = require("unexpected");
const Jethro = require("../");
const logger = new Jethro();
const defaultSet = function() {
    logger.clean().disableLocation().disableBrackets().disableUTC().enableColour().enableTimestamp().resetSourceControl().setTimestampFormat(undefined, 'H:mm');
};

describe("Logger config functions", () => {
    beforeEach(defaultSet);

    describe("logger.importSettings", () => {
        it("Should throw if not an instance of Settings as well as undefined", () => {
            expect(() => {
                logger.importSettings(undefined);
            }, "to throw");
        });

        it("Should throw Unexpected baggage on non undefined", () => {
            expect(() => {
                logger.importSettings(undefined, "test");
            }, "to throw", new TypeError("Unexpected object in bagging area"));
        });

        it("Should use defaults with legacy object if opts are null", () => {
            logger.importSettings("console", {
                output: {
                    colour: null,
                    source: {
                        blacklist: null,
                        whitelist: null
                    },
                    timestamp: null,
                    timeformat: null,
                    timestampOpts: {
                        brackets: null,
                        utc: null
                    }
                }
            });
            const options = Object.create(Jethro.Settings.prototype);
            Object.assign(options, {
                _enabled: true, colour: { bold: true, enabled: true, force: false }, severity: { debug: true, transport: true, info: true, success: true, warning: true, error: true }, source: { enabled: null, whitelist: [], blacklist: [] }, timestamp: { enabled: true, format: 'HH:mm:ss[s] SSS[ms]', utc: false, brackets: false }, location: { enabled: false }});

            expect(logger.transports.console.settings, "to equal", options);
        });

        it("Should change settings with legacy object", () => {
            logger.importSettings("console", {
                output: {
                    colour: false,
                    source: {
                        blacklist: ["testing"],
                        whitelist: ["testing"]
                    },
                    timestamp: true,
                    timeformat: "HH:MM:SS[s] SSS[ms]",
                    timestampOpts: {
                        brackets: true,
                        utc: true
                    }
                }
            });
            const options = Object.create(Jethro.Settings.prototype);
            Object.assign(options, {
                _enabled: true, colour: { bold: true, enabled: false, force: false }, severity: { debug: true, transport: true, info: true, success: true, warning: true, error: true }, source: { enabled: null, whitelist: [ 'testing' ], blacklist: [ 'testing' ] }, timestamp: { enabled: true, format: 'HH:MM:SS[s] SSS[ms]', utc: true, brackets: true }, location: { enabled: false }
            });

            expect(logger.transports.console.settings, "to equal", options);
        });

        it("Should use defaults with invalid settings", () => {
            logger.importSettings('console', {
                enabled: null,
                location: {
                    enabled: null
                },
                severity: {
                    debug: null,
                    transport: null,
                    info: null,
                    success: null,
                    warning: null,
                    error: null
                },
                timeformat: null,
                source: {
                    enabled: null,
                    whitelist: null,
                    blacklist: null
                },
                colour: {
                    enabled: null,
                    bold: null,
                    force: null
                },
                timestamp: {
                    enabled: null,
                    format: null,
                    brackets: null,
                    utc: null
                }
            });
            const options = Object.create(Jethro.Settings.prototype);

            Object.assign(options, {
                _enabled: true, colour: { bold: true, enabled: true, force: false }, severity: { debug: true, transport: true, info: true, success: true, warning: true, error: true }, source: { enabled: null, whitelist: [], blacklist: [] }, timestamp: { enabled: true, format: 'HH:mm:ss[s] SSS[ms]', utc: false, brackets: false }, location: { enabled: false }
            });

            expect(logger.transports.console.settings, "to equal", options);
        });

        it("Should change the settings object", () => {
            logger.importSettings('console', {
                enabled: false,
                location: {
                    enabled: true
                },
                severity: {
                    debug: false,
                    transport: false,
                    info: false,
                    success: false,
                    warning: false,
                    error: false
                },
                timeformat: "DD:MM:HH",
                source: {
                    enabled: "blacklist",
                    whitelist: ["testing"],
                    blacklist: ["testing"]
                },
                colour: {
                    enabled: false,
                    bold: true,
                    force: true
                },
                timestamp: {
                    enabled: false,
                    format: "HH:MM:SS[s] SSS[ms]",
                    brackets: true,
                    utc: true
                }
            });
            const options = Object.create(Jethro.Settings.prototype);

            Object.assign(options, {
                _enabled: false, colour: { bold: true, enabled: false, force: true }, severity: { debug: false, transport: false, info: false, success: false, warning: false, error: false }, source: { enabled: "blacklist", whitelist: [ 'testing' ], blacklist: [ 'testing' ] }, timestamp: { enabled: false, format: 'HH:MM:SS[s] SSS[ms]', utc: true, brackets: true }, location: { enabled: true }
            });

            expect(logger.transports.console.settings, "to equal", options);
        });

        it("Should throw if an invalid Settings instance is passed in", () => {
            const options = Object.create(Jethro.Settings.prototype);

            expect(() => {
                logger.importSettings('console', options);
            }, "to throw", new Error("Setting class failed validity check"));
        });

        it("Should work with an instance of Settings", () => {
            const options = Object.create(Jethro.Settings.prototype);

            Object.assign(options, {
                _enabled: false, colour: { bold: true, enabled: false, force: true }, severity: { debug: false, transport: false, info: false, success: false, warning: false, error: false }, source: { enabled: "blacklist", whitelist: [ 'testing' ], blacklist: [ 'testing' ] }, timestamp: { enabled: false, format: 'HH:MM:SS[s] SSS[ms]', utc: true, brackets: true }, location: { enabled: true }
            });

            logger.importSettings('console', options);
            expect(logger.transports.console.settings, "to equal", options);
        });
    });
    describe("Logger brackets", () => {
        it("Should change brackets boolean to false with false", () => {
            logger.disableBrackets();
            expect(logger.transports.console.settings.timestamp.brackets, "to be", false);
        });

        it("Should change brackets boolean to true with true", () => {
            logger.enableBrackets();
            expect(logger.transports.console.settings.timestamp.brackets, "to be", true);
        });
    });

    describe("Logger Colour Functions", () => {
        it("Should change colour boolean to false with disableColour", () => {
            logger.disableColour('console');
            expect(logger.transports.console.settings.colour.enabled, "to be", false);
        });

        it("Should change colour boolean to true with enableColour", () => {
            logger.enableColour();
            expect(logger.transports.console.settings.colour.enabled, "to be", true);
        });

        it("Should change colour boolean to false with disableColor", () => {
            logger.disableColor('console');
            expect(logger.transports.console.settings.colour.enabled, "to be", false);
        });

        it("Should change colour boolean to true with enableColor", () => {
            logger.enableColor();
            expect(logger.transports.console.settings.colour.enabled, "to be", true);
        });

        it('Should change bold boolean to false with disableBoldColour', () => {
            logger.disableBoldColour();
            expect(logger.transports.console.settings.colour.bold, "to be", false);
        });

        it('Should change bold boolean to true with enableBoldColour', () => {
            logger.enableBoldColour();
            expect(logger.transports.console.settings.colour.bold, "to be", true);
        });

        it('Should change bold boolean to false with disableBoldColor', () => {
            logger.disableBoldColor();
            expect(logger.transports.console.settings.colour.bold, "to be", false);
        });

        it('Should change bold boolean to true with enableBoldColor', () => {
            logger.enableBoldColor();
            expect(logger.transports.console.settings.colour.bold, "to be", true);
        });
        it('Should change force boolean to false with disableForceColour', () => {
            logger.disableForceColour();
            expect(logger.transports.console.settings.colour.force, "to be", false);
        });

        it('Should change force boolean to true with enableForceColour', () => {
            logger.enableForceColour();
            expect(logger.transports.console.settings.colour.force, "to be", true);
        });

        it('Should change force boolean to false with disableForceColor', () => {
            logger.disableForceColor();
            expect(logger.transports.console.settings.colour.force, "to be", false);
        });

        it('Should change force boolean to true with enableForceColor', () => {
            logger.enableForceColor();
            expect(logger.transports.console.settings.colour.force, "to be", true);
        });
    });

    describe("Logger Location Functions", () => {
        it("Should change location to testing", () => {
            logger.setLocation("testing");
            expect(logger.getLocation(), "to be", "testing");
        });

        it("Should change location.enabled boolean to true", () => {
            logger.enableLocation();
            expect(logger.transports.console.settings.location.enabled, "to be", true);
        });

        it("Should change location.enabled boolean to false", () => {
            logger.disableLocation();
            expect(logger.transports.console.settings.location.enabled, "to be", false);
        });
    });

    describe("Logger Timeformat Functions", () => {
        it("Should change timeformat to testing", () => {
            logger.setTimestampFormat("console", "testing");
            expect(logger.transports.console.settings.timestamp.format, "to be", "testing");
        });
        it("Should throw on unknown timestamp format", () => {
            expect(() => {
                logger.setTimestampFormat(undefined, undefined);
            }, "to throw");
        });
    });

    describe("Logger disable/enable timestamp", () => {
        it("Should change timestamp boolean to false with false", () => {
            logger.disableTimestamp();
            expect(logger.transports.console.settings.timestamp.enabled, "to be", false);
        });

        it("Should change timestamp boolean to true with true", () => {
            logger.enableTimestamp();
            expect(logger.transports.console.settings.timestamp.enabled, "to be", true);
        });
    });

    describe("Logger disable/enable UTC", () => {
        it("Should change UTC boolean to false with false", () => {
            logger.disableUTC();
            expect(logger.transports.console.settings.timestamp.utc, "to be", false);
        });

        it("Should change UTC boolean to true with true", () => {
            logger.enableUTC();
            expect(logger.transports.console.settings.timestamp.utc, "to be", true);
        });
    });
    describe("Logger source control tests", () => {
        describe("Logger.clearSourceBlacklist", () => {
            it("Should clear the blacklist", () => {
                logger.addToSourceBlacklist(undefined, "testing");
                logger.clearSourceBlacklist();
                expect(logger.transports.console.settings.source.blacklist, "to be empty");
            });
        });
        describe("Logger.clearSourceWhitelist", () => {
            it("Should clear the whitelist", () => {
                logger.addToSourceWhitelist(undefined, "testing");
                logger.clearSourceWhitelist();
                expect(logger.transports.console.settings.source.whitelist, "to be empty");
            });
        });
        describe("Logger.getSourceBlacklist", () => {
            it("Should get the blacklist", () => {
                logger.addToSourceBlacklist(undefined, "testing");
                expect(logger.getSourceBlacklist().console, "to contain", "testing");
            });
        });
        describe("Logger.getSourceWhitelist", () => {
            it("Should get the whitelist", () => {
                logger.addToSourceWhitelist(undefined, "testing");
                expect(logger.getSourceWhitelist().console, "to contain", "testing");
            });
        });
        describe("Logger.addToSourceBlacklist", () => {
            it("Should change blacklist to testing", () => {
                logger.addToSourceBlacklist(undefined, "testing");
                expect(logger.transports.console.settings.source.blacklist, "to equal", ["testing"]);
            });
            it("Should only add once on duplicate items", () => {
                logger.addToSourceBlacklist(undefined, "testing");
                logger.addToSourceBlacklist(undefined, "testing");
                expect(logger.transports.console.settings.source.blacklist, "to equal", ["testing"]);
            });
            it("Should throw on non string parameter", () => {
                expect(() => {
                    logger.addToSourceBlacklist(undefined, undefined);
                }, "to throw");
            });
        });

        describe("Logger.addToSourceWhitelist", () => {
            it("Should change whitelist to testing", () => {
                logger.addToSourceWhitelist(undefined, "testing");
                expect(logger.transports.console.settings.source.whitelist, "to equal", ["testing"]);
            });
            it("Should only add once on duplicate items", () => {
                logger.addToSourceWhitelist(undefined, "testing");
                logger.addToSourceWhitelist(undefined, "testing");
                expect(logger.transports.console.settings.source.whitelist, "to equal", ["testing"]);
            });
            it("Should throw on non string parameter", () => {
                expect(() => {
                    logger.addToSourceWhitelist(undefined, undefined);
                }, "to throw");
            });
        });

        describe("Logger.setSourceControlSetting", () => {
            it ("should change source control to blacklist", () => {
                logger.setSourceControlSetting(undefined, "blacklist");
                expect(logger.transports.console.settings.source.enabled, "to be", "blacklist");
            });
            it("Should change source control to whitelist", () => {
                logger.setSourceControlSetting(undefined, "whitelist");
                expect(logger.transports.console.settings.source.enabled, "to equal", "whitelist");
            });
            it("Should change source control to null", () => {
                logger.setSourceControlSetting(undefined, null);
                expect(logger.transports.console.settings.source.enabled, "to equal", null);
            });
            it("Should throw on unknown setting", () => {
                expect(() => {
                    logger.setSourceControlSetting(undefined, undefined, undefined);
                }, "to throw");
            });
        });
        describe("Logger.disableSourceControlSetting", () => {
            it("Should set source control to null", () => {
                logger.setSourceControlSetting(undefined, "blacklist");
                logger.disableSourceControlSetting();
                expect(logger.getSourceControlSetting().console, "to equal", null);
            });
        });

        describe("Logger.getSourceControlSetting", () => {
            it("Should return null by default for console", () => {
                expect(logger.getSourceControlSetting().console, "to equal", null);
            });
            it("Should return blacklist if source control is set to blacklist", () => {
                logger.setSourceControlSetting(undefined, "blacklist");
                expect(logger.getSourceControlSetting().console, "to equal", "blacklist");
            });
            it("Should return whitelist if source control is set to whitelist", () => {
                logger.setSourceControlSetting(undefined, "whitelist");
                expect(logger.getSourceControlSetting().console, "to equal", "whitelist");
            });
        });
        describe("Logger.resetSourceControl", () => {
            it ("Should reset source control settings", () => {
                logger.addToSourceBlacklist(undefined, "testing");
                logger.addToSourceWhitelist(undefined, "testing");
                logger.setSourceControlSetting(undefined, "blacklist");
                logger.resetSourceControl();
                expect(logger.getSourceControlSetting().console, "to equal", null);

            });
        });
        describe("Logger.removeFromSourceBlacklist", () => {
            beforeEach(() => {
                logger.addToSourceBlacklist(undefined, "testing");
            });
            it("Should remove from blacklist", () => {
                logger.removeFromSourceBlacklist(undefined, "testing");
                expect(logger.transports.console.settings.source.blacklist, "to be empty");
            });
            it("Should not remove from blacklist if it isn't in the blacklist", () => {
                logger.removeFromSourceBlacklist(undefined, "testing2");
                expect(logger.transports.console.settings.source.blacklist, "to equal", ["testing"]);
            });
            it("Should throw if a non string is a parameter", () => {
                expect(() => {
                    logger.removeFromSourceBlacklist(undefined, undefined);
                }, "to throw");
            });
        });
        describe("Logger.removeFromSourceWhitelist", () => {
            beforeEach(() => {
                logger.addToSourceWhitelist(undefined, "testing");
            });
            it("Should remove from Whitelist", () => {
                logger.removeFromSourceWhitelist(undefined, "testing");
                expect(logger.transports.console.settings.source.whitelist, "to be empty");
            });
            it("Should not remove from blacklist if it isn't in the blacklist", () => {
                logger.removeFromSourceWhitelist(undefined, "testing2");
                expect(logger.transports.console.settings.source.whitelist, "to equal", ["testing"]);
            });
            it("Should throw if a non string is a parameter", () => {
                expect(() => {
                    logger.removeFromSourceWhitelist(undefined, undefined);
                }, "to throw");
            });
        });
    });
    describe("Logger setLogLevel", () => {
        it("Should throw an error if a non boolean is the third parameter", () => {
            expect(() => {
                logger.setLogLevel(undefined, 'info', "hi");
            }, 'to throw');
        });
        it("Should throw an error if the second parameter is an unknown severity", () => {
            expect(() => {
                logger.setLogLevel(undefined, 'undefined', true);
            }, 'to throw');
        });
        it("Should set a level to false", () => {
            logger.setLogLevel(undefined, 'info', false);
            expect(logger.transports.console.settings.severity.info, 'to be', false);
        });
        it("Should throw if all parameters are incorrect", () => {
            expect(() => {
                logger.setLogLevel(undefined, undefined, undefined);
            }, 'to throw');
        });
    });
    describe("Logger enable / disable", () => {
        describe("disableTransport /enableTransport", () => {
            it("Should throw on unknown transport for disableTransport", () => {
                expect(() => {
                    logger.disableTransport(undefined);
                }, "to throw");
            });
            it("Should throw on unknown transport for enableTransport", () => {
                expect(() => {
                    logger.enableTransport(undefined);
                }, "to throw");
            });
            describe("Disabling console transport should work", () => {
                beforeEach(() => {
                    logger.disableTransport("console");
                });
                it("Should return false for enabled", () => {
                    expect(logger.transportEnabled("console"), "to be false");
                });
                it("Should return true for disabled", () => {
                    expect(logger.transportDisabled("console"), "to be true");
                });
            });
            describe("Enabling console transport should work", () => {
                beforeEach(() => {
                    logger.disableTransport("console");
                });
                it("Should return false for enabled", () => {
                    logger.enableTransport("console");
                    expect(logger.transportEnabled("console"), "to be true");
                });
                it("Should return false for disabled", () => {
                    logger.enableTransport("console");
                    expect(logger.transportDisabled("console"), "to be false");
                });
            });
        });
    });
    describe("Logger getColorSettings", () => {
        it("Should return color settings", () => {
            expect(logger.getColorSettings().console, "to have keys", ["bold", "enabled", "force"]);
        });
        it("Should return colour settings", () => {
            expect(logger.getColourSettings().console, "to have keys", ["bold", "enabled", "force"]);
        });
    });
    describe("Logger clean", () => {
        it("Should reset to defaults on invalid settings", () => {
            logger.transports.console.settings.timestamp = logger.transports.console.settings.location = logger.transports.console.settings.severity = logger.transports.console.settings.source = logger.transports.console.settings.colour = logger.transports.console.settings._enabled = undefined;
            logger.clean();
            expect(logger.isValid().console, "to be true");
        });
        it("Should validate all paths for invalid settings", () => {
            logger.transports.console.settings.location = {
                enabled: undefined
            };
            logger.transports.console.settings.colour = {
                bold: undefined,
                enabled: undefined,
                force: undefined
            };
            logger.transports.console.settings.source = {
                blacklist: undefined,
                whitelist: undefined,
                enabled: undefined
            };
            logger.transports.console.settings.timestamp = {
                enabled: undefined,
                format: undefined,
                utc: undefined,
                brackets: undefined
            };
            logger.transports.console.settings.severity = {
                debug: undefined,
                error: undefined,
                info: undefined,
                transport: undefined,
                warning: undefined
            };
            logger.clean();
            expect(logger.isValid().console, "to be true");
        });
    });
});

