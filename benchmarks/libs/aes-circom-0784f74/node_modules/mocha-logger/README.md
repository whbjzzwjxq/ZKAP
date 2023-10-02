Mocha-logger
============
Simple logging support using the standard Mocha reporting style.

This module is designed to work as an inline reporter for long running Mocha tasks.


Examples
--------

```js
import mlog from 'mocha-logger';

mlog.log('This is .log()');
mlog.pending('This is .pending()');
mlog.success('This is .success()');
mlog.error('This is .error()');
```
