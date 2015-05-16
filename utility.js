

function debug(x) {
	if (typeof x === "object" && x != null) {
		if (exists(x.toString))
			console.log(x.toString())
		else
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

Array.prototype.max = function() {
	var maxVal = this[0];
	this.forEach(function(val){
		maxVal = Math.max(val, maxVal);
	});
	return maxVal;
}

