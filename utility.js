

function debug(x) {
	if (typeof x === "object") {
		console.log(JSON.stringify(x));
	} else
		console.log(x);
}

String.prototype.contains = function(subString) {
	return this.indexOf(subString) != -1;
}

function exists(x) {
	return (typeof x !== "undefined" && x != null);
}
jQuery.fn.exists = function(){
	return jQuery(this).length>0;
}

