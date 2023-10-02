var mcoloring = require('mocha').reporters.Base.color;

/**
* Convert a JavaScript arguments object into an array and optionally surround it with the given values
* @param arguments arguments A JavaScript arguments object
* @param string prefix Optional prefix to apply
* @param string suffix Optional suffix to apply
* @return array A standard array of the extracted arguments
*/
function _argArray(argObj, prefix, suffix) {
	var args = Array.prototype.slice.call(argObj);
	if (prefix) args.unshift(prefix);
	if (suffix) args.push(suffix);
	return args;
}


var styles = {
	log: {
		color: 'error stack', // I know this makes no sence, it just looks better
		prefix: mcoloring('error stack', '    -'),
		suffix: null,
	},
	pending: {
		color: 'error stack', // I know this makes no sence, it just looks better
		prefix: mcoloring('error stack', '    -'),
		suffix: null,
	},
	success: {
		color: 'pass',
		prefix: mcoloring('bright pass', '    ✔'),
		suffix: null,
	},
	error: {
		color: 'fail',
		prefix: mcoloring('fail', '    ✖'),
		suffix: null,
	},
};

function log() {
	console.log.apply(this, 
		_argArray(arguments, styles.log.prefix, styles.log.suffix)
			.map(function(v, k) { return k == 0 ? v : mcoloring(styles.log.color, v) }
	));
}

function pending() {
	console.log.apply(this, 
		_argArray(arguments, styles.pending.prefix, styles.pending.suffix)
			.map(function(v, k) { return k == 0 ? v : mcoloring(styles.pending.color, v) }
	));
}

function success() {
	console.log.apply(this, 
		_argArray(arguments, styles.success.prefix, styles.success.suffix)
			.map(function(v, k) { return k == 0 ? v : mcoloring(styles.success.color, v) }
	));
}

function error() {
	console.log.apply(this, 
		_argArray(arguments, styles.error.prefix, styles.error.suffix)
			.map(function(v, k) { return k == 0 ? v : mcoloring(styles.error.color, v) }
	));
}

module.exports = {
	styles: styles,
	log: log,
	pending: pending,
	success: success,
	error: error,
};
