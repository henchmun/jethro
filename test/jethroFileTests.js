"use strict";

const expect = require("unexpected");
const fs = require("fs");
const Jethro = require('../');
const path = require("path");
const logger = new Jethro();
const jethroFile = new Jethro.File();
const moment = require('moment');
const tempy = require('tempy');
const folder = tempy.directory();
const name = `${moment().format("YYYY-MM-DD")}.txt`;
jethroFile.setFilePath(folder);
logger.removeTransport("console");
logger.addTransport("file", jethroFile);

describe("Jethro File Transport Tests", () => {
    it("Should be an instance of File", () => {
        expect(jethroFile instanceof Jethro.File, "to be true");
    });

    it("Should throw on a non string for setFilePath", () => {
        try {
            expect(jethroFile.setFilePath(null), "to throw");
        } catch (ex) {}
    });

    it("Should set the correct path", () => {
        expect(jethroFile.getFilePath(), "to equal", folder);
    });

    describe("Logging to file", () => {
        beforeEach(() => {
            logger.info("test", "test");
        });
        it("Should have a file with the correct formatted date", () => {
            expect(fs.existsSync(path.join(folder, name)), 'to be true');
        });
        it("Should have logged something", (done) => {
            fs.readFile(path.join(folder, name), 'utf8', (err, data) => {
                if (err) {
                    return done(err);
                }
                expect(data, "to contain", "[Info]      [test]          test");
                return done();
            });
        });
    });
});
