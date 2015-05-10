
var pedigree = {};
var pm;

pedigree.constants = {
	DOMINANT_AUTOSOMAL: 0,
	RECESSIVE_AUTOSOMAL: 1,
	DOMINANT_SEXLINKED: 2,
	RECESSIVE_SEXLINKED: 3,
	// graphic parameters
	SYMBOL_SIZE: 8,
	LINE_THICKNESS: 2,
	// IndividualModel
	DOMINANT: 1,
	EMPTY: 0,
	RECESSIVE: -1,
	X_ALLELE: 0,
	Y_ALLELE: 1
};


$.getScript("utility.js", function(){
	debug(pedigree.constants.SYMBOL_SIZE);
	pm = new PedigreeModel(pedigree.constants.DOMINANT_SEXLINKED, 0, 0, 5, 1);
	debug(pm.traitType);

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

	if (!sexlinked) {
		createParentsAutosomal(this, pairTypeGen2); // create temporary second generation parents we'd prefer
		fatherGen2prefered = this.fatherGen1; // round about way of doing this
		motherGen2prefered = this.motherGen1; // round about way of doing this
		createParentsAutosomal(this, pairTypeGen1);
	} else { // it's sexlinked
		createParentsSexlinked(this, pairTypeGen2); // create temporary second generation parents we'd prefer
		fatherGen2prefered = this.fatherGen1; // round about way of doing this
		motherGen2prefered = this.motherGen1; // round about way of doing this
		createParentsSexlinked(this, pairTypeGen1);
	}

	this.children = [];
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
	if (this.children[this.whichChildPairsWithInlaw].isMale())
		this.inlaw = motherGen2prefered;
	else
		this.inlaw = fatherGen2prefered;

	this.grandchildren = new IndividualModel(numGrand);
	// create second generation
	var fatherGen2;
	var motherGen2;
	if (this.inlaw.isMale()) {
		fatherGen2 = this.inlaw;
		motherGen2 = this.children[this.whichChildPairsWithInlaw];
	} else {
		motherGen2 = this.inlaw;
		fatherGen2 = this.children[this.whichChildPairsWithInlaw];
	}
	for (var i = 0; i < numGrand; i++) {
		this.grandchildren[i] = birth(fatherGen2, motherGen2);
	}

	// private function
	function createParentsAutosomal(that, parentType) {
		switch (parentType) {
			case 0: // BB BB
				that.pairing = "BB BB";
				that.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				that.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				break;
			case 1: // BB Bb
				that.pairing = "BB Bb";
				that.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				that.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				break;
			case 2: // BB bb
				if (Math.random() > 0.5) // randomly choose whether father or mother is BB
				{
					that.pairing = "BB bb";
					that.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
					that.motherGen1 = new IndividualModel(false, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				} else {
					that.pairing = "bb BB";
					that.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
					that.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				}
				break;
			case 3: // Bb Bb
				that.pairing = "Bb Bb";
				that.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				that.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				break;
			case 4: // Bb bb
				if (Math.random() > 0.5) // randomly choose whether father or mother is Bb
				{
					that.pairing = "Bb bb";
					that.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
					that.motherGen1 = new IndividualModel(false, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				} else {
					that.pairing = "bb Bb";
					that.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
					that.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				}
				break;
			case 5: // bb bb
				that.pairing = "bb bb";
				that.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				that.motherGen1 = new IndividualModel(false, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				break;
		}
	}

	// private function
	function createParentsSexlinked(that, parentType) {
		switch (parentType) {
			case 0: // XBXB XBy
				that.pairing = "XBXB XBy";
				that.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				that.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.EMPTY);
				break;
			case 1: // XBXB Xby
				that.pairing = "XBXB Xby";
				that.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.DOMINANT);
				that.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.EMPTY);
				break;
			case 2: // XBXb XBy
				that.pairing = "XBXb XBy";
				that.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				that.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.EMPTY);
				break;
			case 3: // XBXb Xby
				that.pairing = "XBXb Xby";
				that.motherGen1 = new IndividualModel(false, pedigree.constants.DOMINANT, pedigree.constants.RECESSIVE);
				that.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.EMPTY);
				break;
			case 4: // XbXb XBy
				that.pairing = "XbXb XBy";
				that.motherGen1 = new IndividualModel(false, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				that.fatherGen1 = new IndividualModel(true, pedigree.constants.DOMINANT, pedigree.constants.EMPTY);
				break;
			case 5: // XbXb Xby
				that.pairing = "XbXb Xby";
				that.motherGen1 = new IndividualModel(false, pedigree.constants.RECESSIVE, pedigree.constants.RECESSIVE);
				that.fatherGen1 = new IndividualModel(true, pedigree.constants.RECESSIVE, pedigree.constants.EMPTY);
				break;
		}
	}

	// private method
	function birth(father, mother) {
		var toggle = Math.round(Math.random()); // 0 or 1
		var male = (toggle == 1);
		var a2 = father.getAllele(toggle);
		var a1 = mother.getAllele(Math.round(Math.random()));
		return new IndividualModel(male, a1, a2);
	}

	// Returns a description of the current pedigree, used for debugging only
	this.toString = function() {
		result = "";
		result += "*Father: " + this.fatherGen1.toString();
		result += "\n";
		result += "*Mother: " + this.motherGen1.toString();
		result += "\n";
		for (var i = 0; i < this.children.length; i++) {
			if (i == this.whichChildPairsWithInlaw)
				result += "*";
			result += this.children[i].toString();
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

}
PedigreeModel.prototype.draw = function(snapCanvas) {
		console.log("draw function");
		debugger///

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
}


function IndividualModel(m, a1, a2) {
	if (a1 == pedigree.constants.EMPTY) alert("Invalid arguments sent to function IndividualModel");
	if (!m && a2 == pedigree.constants.EMPTY) alert("Invalid arguments sent to function IndividualModel");
	///if (a1 == pedigree.constants.RECESSIVE && a2 == pedigree.constants.DOMINANT) alert("Invalid arguments sent to function IndividualModel");

	this.male = m;		// false selected for female because of common initial letter
	this.allele1 = a1;
	this.allele2 = a2;

}
IndividualModel.prototype.isMale = function() {
	return this.male;
}

IndividualModel.prototype.isTraitVisible = function(isDominant) {
	// the only way for a recessive trait to appear is to have:
	// both alleles recessive, or one allele recessive and the other empty
	if (typeof isDominant === "boolean") {
		if (isDominant)
			return (getAllele(pedigree.constants.X_ALLELE)+getAllele(pedigree.constants.Y_ALLELE) >= 0);
		else
			return (getAllele(pedigree.constants.X_ALLELE)+getAllele(pedigree.constants.Y_ALLELE) < 0);
	} else {
		if (isDominant == pedigree.constants.RECESSIVE)
			return (getAllele(pedigree.constants.X_ALLELE)+getAllele(pedigree.constants.Y_ALLELE) < 0);
		else			// dominant
			return (getAllele(pedigree.constants.X_ALLELE)+getAllele(pedigree.constants.Y_ALLELE) >= 0);
	}
};

// Gets one of the alleles.  Use this to generate children according to the Punnett Square.
// @return DOMINANT, EMPTY, OR RECESSIVE
IndividualModel.prototype.getAllele = function(whichN) {
	if (whichN == pedigree.constants.X_ALLELE)
		return this.allele1;
	else
		return this.allele2;
}

// For our purposes, two individuals are equal if they have the same alleles
// Optionally, this will also check the individual's gender
IndividualModel.prototype.equals = function(individualModel, checkGender) {
	// if gender not the same, then false
	if (checkGender) {
		if (this.isMale() != individualModel.isMale())
			return false;
	}
	if (this.getAllele(1)==individualModel.getAllele(1) && this.getAllele(2)==individualModel.getAllele(2))
		return true;
	else if (this.getAllele(1)==individualModel.getAllele(2) && this.getAllele(2)==individualModel.getAllele(1))
		return true;
	else
		return false;
}

IndividualModel.prototype.toString = function() {
	result = "";
	if (male)
		result += "Male ";
	else
		result += "Female ";
	switch(allele1) {
		case pedigree.constants.DOMINANT:
			result += "Dominant ";
			break;
		case pedigree.constants.RECESSIVE:
			result += "Recessive ";
			break;
	}
	switch(allele2) {
		case pedigree.constants.DOMINANT:
			result += "Dominant";
			break;
		case pedigree.constants.RECESSIVE:
			result += "Recessive";
			break;
		case pedigree.constants.EMPTY:
			result += "Empty";
	}
	return result;
}



function GenderSymbol(x, y, size, filled, lineW, gender) {

	this.c = {
		RADIUS_RATIO: 1.8,	// controls how long the radial line is as a ratio of circle radius
		SPREAD_RATIO: 0.75	// controls how big the arrow and crossbar are as a ratio of circle radius
	};

	this.xCenter = Math.abs(x);
	this.yCenter = Math.abs(y);
	this.size = (size > 4) ? size : 5;
	this.filled = filled;
	this.lineWidth = (lineW < 1) ? 1 : lineW;
	this.gender = gender;
	this.c = Color.getHSBColor(0, 0, 0); // black line and fill color

	var xCenter;
	var yCenter;
	var size;		// radius of the circle
	var filled;
	var color;
	var lineWidth;
	var gender;


	function draw(snapSvgContainer) {
		var halfLineW = Math.floor(lineWidth * 0.0); // was 0.5
		var xOval = xCenter - size - lineWidth + 1;
		var yOval = yCenter - size - lineWidth;
		var xFill = xCenter - size - halfLineW - 1;
		var yFill = yCenter - size - halfLineW - 2;
		var l1 = Math.round(size * RADIUS_RATIO);
		var l2 = Math.round(size * SPREAD_RATIO);
		// anti-alias
		snapSvgContainer.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
		snapSvgContainer.setColor(c);
		snapSvgContainer.setStroke(new BasicStroke(lineWidth, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
		// draw the lines that make up the male and female symbols
		if (gender) { // true: male
			snapSvgContainer.drawLine(xCenter, yCenter, xCenter + l1, yCenter - l1);
			snapSvgContainer.drawLine(xCenter + l1 - l2, yCenter - l1, xCenter + l1, yCenter - l1);
			snapSvgContainer.drawLine(xCenter + l1, yCenter - l1, xCenter + l1, yCenter - (l1 - l2));
		} else { // false: female
			snapSvgContainer.drawLine(xCenter, yCenter, xCenter, yCenter + l1 + l2);
			snapSvgContainer.drawLine(xCenter - l2, yCenter + l1, xCenter + l2, yCenter + l1);
		}
		// draw the filling of the circle
		if (filled)
			snapSvgContainer.setColor(c);
		else
			snapSvgContainer.setColor(Color.getHSBColor(0, 0, 1)); // white, hides the line inside the oval
		///snapSvgContainer.setColor(Color.RED);  						// for testing
		snapSvgContainer.setStroke(new BasicStroke(0));
		snapSvgContainer.fillOval(xFill, yFill, size * 2 + lineWidth, size * 2 + lineWidth);
		// draw the outline of the circle if white fill
		if (!filled) {
			snapSvgContainer.setColor(c);  // outline is black even if fill is white
			snapSvgContainer.setStroke(new BasicStroke(lineWidth));
			snapSvgContainer.drawOval(xOval, yOval, size * 2 + lineWidth, size * 2 + lineWidth);
		}
	}
}
