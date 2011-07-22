exports.applier = function(instance, method) {
	return function(args) {
		args = Array.prototype.slice.call(arguments);
		method.apply(instance, args);
	}
};