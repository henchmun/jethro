"use strict";

const lint = require("mocha-eslint");
const paths = [
    "examples/**/*.js",
    "lib/**/*.js",
    "test/**/*.js"
];

lint(paths);
