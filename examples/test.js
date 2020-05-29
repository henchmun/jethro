'use strict';

const Jethro = require('../lib/index.js');
const path = require("path");
const logger = new Jethro();

/*
 * We'll just accept that this will probably never work again - but that's ok, it's after a constructed element
 * We'll assume if anyone has actually already constructed a new Jethro instance, they know what they are doing and
 * Shouldn't be confused with this (soon to be documented) behaviour
 * logger("info", "this is", "Just a test");
 */

const jethroFile = new Jethro.File();
jethroFile.setFilePath(path.join(__dirname, 'logs'));
//jethroFile.setFilenameFormat("");
logger.addTransport("file", jethroFile);

function test() {
    //logger("info", "constructor", "something");
    logger.log('info', "startup", "Test");
    logger.log('error', "startup", "Test");
    logger.log('warning', "startup", "Test");
    logger.log('transport', "startup", "Test");
    logger.log('success', "startup", "Test");
    logger.log('debug', "startup", "Test");
    logger.log('debug', "Message", {yolo: true});
}

//logger.setBrackets(true);

logger.log('info', 'Core - ', 'Initating timer...', new Date("2016-05-19 10:41:36"));

//logger.setColour(false);

setInterval(() => {
    logger.log('debug', 'Node.js', "Self.timer");
}, 5000);

logger.direct({ message: "hi", severity: "transport", source: "Output" });
console.log("Custom methods test");
logger.info("startup", "Test");
logger.transport("startup", "Test");
logger.debug("startup", "Test");
logger.success("startup", "Test");
logger.warn("startup", "Test");
logger.warning("startup", "Test");
logger.error("startup", "Test");
//logger.fatal("startup", "Test");
console.log("Starting test procedure");

testProcedure();

function testProcedure() {
    logger.enableForceColour("console");
    test();
    logger.log("info", "tester", "Enable colour...").enableColour();
    logger.log("debug", "tester", "Test message.");
    logger.log("info", "tester", "Enable brackets...").enableBrackets();
    logger.log("debug", "tester", "Test message.");
    logger.log("info", "tester", "Disable brackets...").disableBrackets();
    logger.log("debug", "tester", "Test message.");
    logger.log("info", "tester", "Disable colour...").disableColour();
    logger.log("debug", "tester", "Test message.");
    logger.log("info", "tester", "Enable colour...").enableColour();
    logger.log("debug", "tester", "Test message.");
    logger.log("info", "tester", "Enable bold colour...").enableBoldColour();
    logger.log("debug", "tester", "Test message.");
    logger.log("info", "tester", "Disable bold colour...").disableBoldColor();
    logger.log("debug", "tester", "Test message.");
    logger.log("info", "tester", "Enable timestamp...").enableTimestamp();
    logger.log("debug", "tester", "Test message.");
    logger.log("info", "tester", "Set timestamp format...").setTimestampFormat(null, "MMMM Do YYYY, h:mm:ss a");
    logger.log("debug", "tester", "Test message.");
    logger.log("info", "tester", "Reset timestamp format...").resetTimestampFormat();
    logger.log("debug", "tester", "Test message.");
    logger.log("debug", "tester", "Enable location...").enableLocation();
    logger.log("debug", "tester", "Test message.");
    logger.log("debug", "tester", "Disable Location...").disableLocation();
    logger.log("debug", "tester", "Test message.");

}
