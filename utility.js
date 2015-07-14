if (typeof Mathy === "undefined" || Mathy === null)
	Mathy = {};
// not sure why I can't use my exists fn above

/**
 * Returns a boolean that is true some percent of the time
 * @param changeTrue is a ratio (between 0 and 1)
 */
 Mathy.skewedRandomBoolean = function(chanceTrue) {
 	return (Math.random() < chanceTrue);
 }

/**
 * Picks a number according to the statistical frequency array.
 * For example, given an array {0.1, 0.3, 0.6}, the number will be 0 10% of the time, 1 30% of the time, and 2 60%.
 * The array need not sum to a value of 1.0.
 * @param freq array of desired ratios
 * @return the number
 */
Mathy.skewedRandomInteger = function(freqArray) {
	// assume the elements of freqArray are numbers between 0 and 1
	if (!exists(freqArray.length))
		return 0;
	var r = Math.random();
	var sum = 0;
	var accumulator = 0;
	sum = freqArray.reduce(function(prev,curr) {
		return prev + curr;
	});
	for (var i=0; i<freqArray.length; i++) {
		accumulator += freqArray[i];
		if (r <= (accumulator / sum))
			return i;
	}
	return freqArray.length - 1; // never gets here
}


// general utility functions

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
	return (typeof x !== "undefined" && x !== null);
}

jQuery.fn.exists = function(){
	return jQuery(this).length>0;
}

Array.prototype.max = function() {
 return Math.max.apply(null, this);
};

Array.prototype.randomElement = function() {
	return this[Math.floor(Math.random()*this.length)];
};

function shuffleArray(array) {
	// Randomize order in-place using Fisher-Yates shuffle algorithm
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

function arrayMake(numberOfElements,multiplier,offset) {
	var array = new Array(numberOfElements);
	for (var i=0; i<numberOfElements; i++)
		array[i] = i * multiplier + offset;
	return array;
}

