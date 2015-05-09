// requires jQuery

var pedigree;
var pm;

// var requiredScripts = [
// 	"utility.js",
// 	"IndividualModel.js"
// ];

// $.when.apply(null, requiredScripts.map(function(filePath) {
// 	console.log(filePath)
//     return $.getScript(filePath);
// }))
// .done(function( script, textStatus ) { console.log("this should only print out once......."); })
// .fail(function( jqxhr, settings, exception ) { console.log("FAILED to load scrips") });

$.getScript("IndividualModel.js", function(){

	if (!exists(pedigree))
		pedigree = {};
	if (!exists(pedigree.constants))
		pedigree.constants = {
			DOMINANT_AUTOSOMAL: 0,
			RECESSIVE_AUTOSOMAL: 1,
			DOMINANT_SEXLINKED: 2,
			RECESSIVE_SEXLINKED: 3,
			// graphic parameters
			SYMBOL_SIZE: 8,
			LINE_THICKNESS: 2
		};

	 // test
	debug("utility script successfully loaded");
	pm = new PedigreeModel();
	debug(pm.traitType);
	debug(pedigree.constants.SYMBOL_SIZE);

});

function PedigreeModel(traittype, pairTypeGen1, pairTypeGen2, numChild, numGrand) {
	this.traitType = traittype;
	this.fatherGen1 = null;
	this.motherGen1 = null;
	// this.inlaw
	// this.whichChildPairsWithInlaw
	// this.grandchildren
	this.pairing = null;
	this.width = 600;
	this.height = 500;

	var sexlinked = (traittype == pedigree.constants.DOMINANT_SEXLINKED || traittype == pedigree.constants.RECESSIVE_SEXLINKED);
	var fatherGen2prefered;
	var motherGen2prefered;

	if ( !sexlinked) {
		createParentsAutosomal(pairTypeGen2); // create temporary second generation parents we'd prefer
		fatherGen2prefered = this.fatherGen1; // round about way of doing this
		motherGen2prefered = this.motherGen1; // round about way of doing this
		createParentsAutosomal(pairTypeGen1);
	} else { // it's sexlinked
		createParentsSexlinked(pairTypeGen2); // create temporary second generation parents we'd prefer
		fatherGen2prefered = this.fatherGen1; // round about way of doing this
		motherGen2prefered = this.motherGen1; // round about way of doing this
		createParentsSexlinked(pairTypeGen1);
	}

	this.children = new IndividualModel(numChild);
	// create first generation
	for (var i = 0; i < numChild; i++) {
		this.children[i] = birth(this.fatherGen1, this.motherGen1);
	}

	// try to find a pairing that matches parent2 (in which case we will adhere to the desired statistics
	this.whichChildPairsWithInlaw = -1;
	for (var i = 0; i < numChild; i++) {
		if (this.children[i].equals(fatherGen2prefered, sexlinked)) {
			whichChildPairsWithInlaw = i;
			break;
		} else if (this.children[i].equals(motherGen2prefered, sexlinked)) {
			whichChildPairsWithInlaw = i;
			break;
		}
	}
	if (this.whichChildPairsWithInlaw == -1) // the above wasn't successful, so just pick the first
		this.whichChildPairsWithInlaw = 0;
	if (this.children[whichChildPairsWithInlaw].isMale())
		this.inlaw = motherGen2prefered;
	else
		this.inlaw = fatherGen2prefered;

	this.grandchildren = new IndividualModel(numGrand);
	// create second generation
	var fatherGen2;
	var motherGen2;
	if (inlaw.isMale()) {
		fatherGen2 = this.inlaw;
		motherGen2 = this.children[this.whichChildPairsWithInlaw];
	} else {
		motherGen2 = this.inlaw;
		fatherGen2 = this.children[this.whichChildPairsWithInlaw];
	}
	for (var i = 0; i < numGrand; i++) {
		this.grandchildren[i] = birth(fatherGen2, motherGen2);
	}

	this.draw = function(snap) {
		// this code uses Snap.svg //
		var gridX = 40;
		var gridY = 60;
		var headY = 25;

		var gen1 = this.children.length;
		var gen2 = this.grandchildren.length;

		var gen1Center = Math.floor(0.4 * width);

		// draw father/mother pairing T
		snap.line(gen1Center - gridX / 2, gridY, gen1Center + gridX / 2, gridY);
		snap.line(gen1Center, gridY, gen1Center, gridY * 2 - headY);
		// draw gen 1 sibling line
		var x = gen1Center - ((gen1 - 1) * gridX) / 2;
		snap.line(x, gridY * 2 - headY, gen1Center + ((gen1 - 1) * gridX) / 2, gridY * 2 - headY);
		for (var i = 0; i < gen1; i++) {
			x = gen1Center - ((gen1 - 1) * gridX) / 2 + i * gridX;
			snap.line(x, gridY * 2 - headY, x, gridY * 2 - headY + 6);
		}
		// draw inlaw pairing T
		var gen2Center = gen1Center + (gen1 * gridX) / 2;
		snap.line(gen2Center - gridX / 2, gridY * 2, gen2Center + gridX / 2, gridY * 2);
		snap.line(gen2Center, gridY * 2, gen2Center, gridY * 3 - headY);
		// draw gen 2 sibling line
		var x2 = gen2Center - ((gen2 - 1) * gridX) / 2;
		snap.line(x2, gridY * 3 - headY, gen2Center + ((gen2 - 1) * gridX) / 2, gridY * 3 - headY);
		for (var i = 0; i < gen2; i++) {
			x2 = gen2Center - ((gen2 - 1) * gridX) / 2 + i * gridX;
			snap.line(x2, gridY * 3 - headY, x2, gridY * 3 - headY + 6);
		}

		// draw symbols
		var dominant = (this.traitType == pedigree.constants.DOMINANT_SEXLINKED || this.traitType == pedigree.constants.DOMINANT_AUTOSOMAL);
		var visible = this.fatherGen1.isTraitVisible(dominant);
		var fatherGS = new GenderSymbol(gen1Center - gridX / 2, gridY, pedigree.constants.SYMBOL_SIZE, visible, pedigree.constants.LINE_THICKNESS, true);
		fatherGS.draw(snap);
		visible = this.motherGen1.isTraitVisible(dominant);
		var motherGS = new GenderSymbol(gen1Center + gridX / 2, gridY, pedigree.constants.SYMBOL_SIZE, visible, pedigree.constants.LINE_THICKNESS, false);
		motherGS.draw(snap);

		visible = this.inlaw.isTraitVisible(dominant);
		var inlawGS = new GenderSymbol(x + gridX, 2 * gridY, pedigree.constants.SYMBOL_SIZE, visible, pedigree.constants.LINE_THICKNESS, inlaw.isMale());
		this.inlawGS.draw(snap);

		// sort so that the inlaw's mate is at the right end
		var temp = this.children;
		temp[gen1 - 1] = this.children[whichChildPairsWithInlaw];
		temp[whichChildPairsWithInlaw] = this.children[gen1 - 1];

		var child;
		for (var i = 0; i < gen1; i++) {
			x = gen1Center - ((gen1 - 1) * gridX) / 2 + i * gridX;
			visible = temp[i].isTraitVisible(dominant);
			child = new GenderSymbol(x, 2 * gridY, pedigree.constants.SYMBOL_SIZE, visible, pedigree.constants.LINE_THICKNESS, temp[i].isMale());
			child.draw(snap);
		}

		var grand;
		for (var i = 0; i < gen2; i++) {
			x2 = gen2Center - ((gen2 - 1) * gridX) / 2 + i * gridX;
			visible = this.grandchildren[i].isTraitVisible(dominant);
			grand = new GenderSymbol(x2, 3 * gridY, pedigree.constants.SYMBOL_SIZE, visible, pedigree.constants.LINE_THICKNESS, grandchildren[i].isMale());
			grand.draw(snap);
		}


	};

	function createParentsAutosomal(parentType) {
		switch (parentType) {
			case 0: // BB BB
				this.pairing = "BB BB";
				this.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				this.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				break;
			case 1: // BB Bb
				this.pairing = "BB Bb";
				this.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				this.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				break;
			case 2: // BB bb
				if (Math.random() > 0.5) // randomly choose whether father or mother is BB
				{
					this.pairing = "BB bb";
					this.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
					this.motherGen1 = new IndividualModel(false, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				} else {
					this.pairing = "bb BB";
					this.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
					this.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				}
				break;
			case 3: // Bb Bb
				this.pairing = "Bb Bb";
				this.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				this.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				break;
			case 4: // Bb bb
				if (Math.random() > 0.5) // randomly choose whether father or mother is Bb
				{
					this.pairing = "Bb bb";
					this.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
					this.motherGen1 = new IndividualModel(false, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				} else {
					this.pairing = "bb Bb";
					this.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
					this.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				}
				break;
			case 5: // bb bb
				this.pairing = "bb bb";
				this.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				this.motherGen1 = new IndividualModel(false, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				break;
		}
	}

	function createParentsSexlinked(parentType) {
		switch (parentType) {
			case 0: // XBXB XBy
				this.pairing = "XBXB XBy";
				this.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				this.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.EMPTY);
				break;
			case 1: // XBXB Xby
				this.pairing = "XBXB Xby";
				this.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				this.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.EMPTY);
				break;
			case 2: // XBXb XBy
				this.pairing = "XBXb XBy";
				this.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				this.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.EMPTY);
				break;
			case 3: // XBXb Xby
				this.pairing = "XBXb Xby";
				this.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				this.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.EMPTY);
				break;
			case 4: // XbXb XBy
				this.pairing = "XbXb XBy";
				this.motherGen1 = new IndividualModel(false, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				this.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.EMPTY);
				break;
			case 5: // XbXb Xby
				this.pairing = "XbXb Xby";
				this.motherGen1 = new IndividualModel(false, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				this.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.EMPTY);
				break;
		}
	}

	// Returns the father and mother pairing of the first generation
	// @return  string description of the pairing
	var getPairing = function() {
		return this.pairing;
	}

	var birth = function(father, mother) {
		var toggle = Math.round(Math.random()); // 0 or 1
		var male = (toggle == 1);
		var a2 = father.getAllele(toggle);
		var a1 = mother.getAllele(Math.round(Math.random()));
		return new IndividualModel(male, a1, a2);
	}

	// Returns a description of the current pedigree, used for debugging only
	var toString = function() {
		result = "";
		result += "*Father: " + this.fatherGen1.toString();
		result += "\n";
		result += "*Mother: " + this.motherGen1.toString();
		result += "\n";
		for (var i = 0; i < this.children.length; i++) {
			if (i == this.whichChildPairsWithInlaw)
				result += "*";
			result += cthis.hildren[i].toString();
			result += "\n";
		}
		result += "*Inlaw: " + this.inlaw.toString();
		result += "\n";
		for (var i = 0; i < this.grandchildren.length; i++) {
			result += this.grandchildren[i].toString();
			result += "\n";
		}
		return result;
	}

} // end of PedigreeModel


// function loadScript(url, callback) {
//     // @todo if url is an array, load each element///////////
//     var head = document.getElementsByTagName('head')[0];
//     var script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.src = url;
//     script.onreadystatechange = callback;
//     script.onload = callback;
//     head.appendChild(script);
// }

function run() {
	// test
	debug("utility script successfully loaded");
	var p = new PedigreeModel();
	debug(p.traitType);
	debug(p.c.SYMBOL_SIZE);
};
// loadScript("utility.js", run);


