# Jethro [![npm version][npm-badge]][npm-link] [![npm downloads][npmd-badge]][npmd-link]

Jethro Logger is an all-in-one logging utility designed to give developers the logging tools and flexibility they need
within one complete package. It is also designed to be used in cooperation with other tools and transport services.

Compatible with Node `>= 8.0`.

Deprecation Notice
------------------

While Jethro is still functional with node.js 8 onwards, development has halted
and more active alternatives exist including 
[Winston](https://github.com/winstonjs/winston) which has a similar philosophy
and approach to it's API.

Installation
------------
```npm i jethro --save```

Usage
-----

```js
var logger = require('jethro');

logger('info', 'Testing', 'This is a test message!');
```

Examples
--------

#### Console

```js
var Jethro = require('jethro');
var logger = new Jethro();
logger('info', 'Somewhere', 'Something happened...');

// OR

var logger = require('jethro');
logger.info('Somewhere', 'Something happened');
```

The API
-------
```js
var logger = new Jethro();
logger.log(severity, source, message);
logger.direct({
    source,
    severity,
    message,
    timestamp
});
logger.output({
    source,
    severity,
    message,
    timestamp
});
logger.info(source, message);
logger.transport(source, message);
logger.debug(source, message);
logger.success(source, message);
logger.warn(source, message);
logger.warning(source, message);
logger.error(source, message);
logger.fatal(source, message);
```

Plugins
-------

#### Express

```js
var Jethro = require('jethro');
var logger = new Jethro();
var expressLog = new Jethro.Express();
logger.addPlugin('express', expressLog);
app.use(expressLog.input());

// OR

var logger = require('jethro');
logger.addPlugin('express', new Jethro.Express());
app.use(logger.plugins.express.input());
```

Transports
----------

#### File logging

```js
var Jethro = require('jethro');
var path = require('path');
var logger = new Jethro();
var jethroFile = new Jethro.File();
jethroFile.setFilePath(path.join(__dirname, 'logs'));
logger.addTransport('file', jethroFile);
```

Projects using this logger
--------------------------
* TFL Bot (plug.dj)

Credits
-------
Created and maintained by Henchmun.

Helped and maintained with [Alex](http://thedark1337.com).

Suggestions and moral support from [xBytez](https://github.com/xBytez) and [Matthew](https://github.com/yemasthui)!

Special thanks to [ReAnna](https://github.com/goto-bus-stop/) whom without which, version 3+ would not be possible.

License
-------
Licensed under the LGPL-v3 & MIT Licenses

Copyright (C) 2020  Henchmun.

Licenses: [LGPL-v3](/LGPLv3-license.txt) AND [MIT](/MIT-.txt)

[npm-badge]: http://img.shields.io/npm/v/jethro.svg
[npm-link]: https://npmjs.org/package/jethro
[npmd-badge]: http://img.shields.io/npm/dm/jethro.svg
[npmd-link]: https://npmjs.org/package/jethro


