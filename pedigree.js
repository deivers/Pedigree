
var pedigree = {};
var pm; // pedigree model   //TODO change this to pedigree.model???
var pedigreeCount = 0, traitCount = 0;
var currentTrait = -1; //TODO make this a property of pm?
var answerIndex;
pedigree.easyModeIndex;
pedigree.teachModeCounter = 0;

pedigree.constant = {
	DOMINANT_AUTOSOMAL: 0,
	RECESSIVE_AUTOSOMAL: 1,
	DOMINANT_SEXLINKED: 2,
	RECESSIVE_SEXLINKED: 3,
	traitChoices: ["Dominant Autosomal", "Recessive Autosomal", "Dominant Sex-linked", "Recessive Sex-linked"],
	traitChoicesForThisMode: [],
	// graphic parameters
	SYMBOL_SIZE: 16,
	SEPARATION: 72,
	LINE_THICKNESS: 4,
	// IndividualModel
	DOMINANT: 1,
	EMPTY: 0,
	RECESSIVE: -1,
	X_ALLELE: 0,
	Y_ALLELE: 1,
	//
	DARK_COLOR: '#222',
	LIGHT_COLOR: '#eee',
	//
	BB_BB: 0,
	BB_Bb: 1,
	BB_bb: 2,
	Bb_Bb: 3,
	Bb_bb: 4,
	bb_bb: 5,
	XBXB_XBy: 0,
	XBXB_Xby: 1,
	XBXb_XBy: 2,
	XBXb_Xby: 3,
	XbXb_XBy: 4,
	XbXb_Xby: 5,

	// a list of 4 ratios for trait frequencies:  Dominant Autosomal, Recessive Autosomal, Dominant Sex-linked, Recessive Sex-linked
	traitTypeFrequency: [0.25, 0.25, 0.25, 0.25],
	// a list of 6 ratios for Autosomal frequencies:  BBxBB, BBxBb, BBxbb, BbxBb, Bbxbb, bbxbb
	autosomalFrequency: [0.05, 0.1, 0.2, 0.3, 0.3, 0.05],
	// a list of 6 ratios for Sex-linked frequencies:  XBXB.XBy, XBXB.Xby, XBXb.XBy, XBXb.Xby, XbXb.XBy, XbXb.Xby
	sexlinkedFrequency: [0.05, 0.15, 0.3, 0.3, 0.15, 0.05],
	// a list of 4 integers for min & max number of first gen. offspring and min & max number of second gen. offspring
	numOffspringLimits: [3, 5, 2, 5], // the actual will be a random integer between these with a bias toward higher values

	easyModeQuestions: [
		"This trait is autosomal.  Your task is to determine whether it is dominant or recessive.",
		"This trait is sex-linked.  Your task is to determine whether it is dominant or recessive.",
		"This trait is dominant.  Your task is to determine whether it is autosomal or sex-linked.",
		"This trait is recessive.  Your task is to determine whether it is autosomal or sex-linked."
	]
	// later added: easyMode and teachMode
};


$.getScript("utility.js", function(){
	// get the mode from the html
	var modeStringFromHtml = $("#pedigree").data("mode");
	pedigree.constant.teachMode = (modeStringFromHtml === "teach");
	pedigree.constant.easyMode = (modeStringFromHtml === "easy");
	// setup the mode
	if (pedigree.constant.teachMode) {
		$("#combo-box").html("Select a trait: &#x25BC;");
		$("body").append("<div class='show-details'><input type='checkbox' id='show-details-checkbox' onclick='showDetailsCheckboxHandler()'> Reveal first generation details</div>")
	} else {
		$("#combo-box").html("Choose the correct trait: &#x25BC;");
		$(".show-details").remove();
	}
	$("body").append(showMetaInfo("2.0 August 2015"));
	// create snap drawing context (a.k.a paper)
	snapSvgCanvas.snapPaper = Snap("#canvas").group();
	// run it
	if (pedigree.constant.teachMode) {
		$("#info-label").html("Select a trait to get started...");
		updateDropdownMenu();
	} else { // quiz mode
		nextTrait();
		nextPedigree(currentTrait);
		pm.draw(snapSvgCanvas);
	}
});

function updateInfoLabel(pedigreeModel) {
	var text;
	if (pedigree.constant.teachMode) { // display the trait type at top of applet
		text = "Trait: " + pedigree.constant.traitChoices[currentTrait];
		if ($("#show-details-checkbox").is(":checked"))
			text += "<br>First generation: " +pedigreeModel.pairing;
		pedigree.teachModeCounter++;
	} else if (pedigree.constant.easyMode) {
		text = pedigree.constant.easyModeQuestions[pedigree.easyModeIndex];
	} else { // give student info to help orient them
		pedigreeCount++;
		text = "Trait #" + traitCount + "<br>Pedigree #" + pedigreeCount;
	}
	$("#info-label").html(text);
}

function updateDropdownMenu() {
	$('#trait-list').empty();
	if (!pedigree.constant.easyMode || pedigree.easyModeIndex == 0 || pedigree.easyModeIndex == 2)
		$('#trait-list').append("<li><a href='#' onclick='traitSelected(0)'>Dominant Autosomal </a></li>");
	if (!pedigree.constant.easyMode || pedigree.easyModeIndex == 0 || pedigree.easyModeIndex == 3)
		$('#trait-list').append('<li><a href="#" onclick="traitSelected(1)">Recessive Autosomal </a></li>');
	if (!pedigree.constant.easyMode || pedigree.easyModeIndex == 1 || pedigree.easyModeIndex == 2)
		$('#trait-list').append('<li><a href="#" onclick="traitSelected(2)">Dominant Sex-linked </a></li>');
	if (!pedigree.constant.easyMode || pedigree.easyModeIndex == 1 || pedigree.easyModeIndex == 3)
		$('#trait-list').append('<li><a href="#" onclick="traitSelected(3)">Recessive Sex-linked </a></li>');

	$('#trait-list li').on('click', function(){
		var selText = $(this).text();
		$(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
	});
}

function viewAnother() {
	if (currentTrait === -1) // teach mode and no trait chosen yet
		alert("Select a trait first.");
	else
		nextPedigree();
}

function traitSelected(selectedTraitIndex) {
	if (exists(selectedTraitIndex)) {
		if (!pedigree.constant.teachMode) {
			// determine if student answer is correct
			if (selectedTraitIndex === currentTrait) {
				alert("Correct!  Here's a new trait...");
				nextTrait();
			} else {
				alert("Incorrect.  Please try again.")
			}
		} else { // teach mode
			$("#combo-box").html(pedigree.constant.traitChoices[selectedTraitIndex]);
			currentTrait = selectedTraitIndex;
		}
		nextPedigree(selectedTraitIndex);
	}
}

function showDetailsCheckboxHandler() {
	if (currentTrait !== -1)
		updateInfoLabel(pm);
}

function nextTrait() {
	// pick the next trait, depending on the mode
	var prevTrait = currentTrait;
	if (pedigree.constant.easyMode) {
		pedigree.easyModeIndex = Math.floor(Math.random() * 4);
		currentTrait = [[0,1], [2,3], [0,2], [1,3]][pedigree.easyModeIndex].randomElement();
		updateInfoLabel();
	} else {
		currentTrait = Mathy.skewedRandomInteger(pedigree.constant.traitTypeFrequency);
		if (currentTrait === prevTrait)
			currentTrait = Mathy.skewedRandomInteger(pedigree.constant.traitTypeFrequency);
	}
	updateDropdownMenu();
	// since one or more of the 4 might have 0 probability (resulting in fewer choices in the pull-down),
	// figure out the correct answer for the pull-down menu
	answerIndex = currentTrait;
	for (var i = currentTrait - 1; i >= 0; i--) {
		if (pedigree.constant.traitTypeFrequency[i] == 0)
			answerIndex--;
	}
	traitCount++;
	pedigreeCount = 0;
}

function nextPedigree() {
	var pairTypeGen1, pairTypeGen2;
	if (pedigree.teachMode) {
		if (currentTrait < 2) { // autosomal
			pairTypeGen1 = pedigree.teachModeCounter % pedigree.constant.autosomalFrequency.length; // round-robin instead of random
			pairTypeGen2 = Mathy.skewedRandomInteger(pedigree.constant.autosomalFrequency);
		} else { // sex-linked
			pairTypeGen1 = pedigree.teachModeCounter % pedigree.constant.sexlinkedFrequency.length; // round-robin instead of random
			pairTypeGen2 = Mathy.skewedRandomInteger(pedigree.constant.sexlinkedFrequency);
		}
	} else {
		if (currentTrait < 2) { // autosomal
			pairTypeGen1 = Mathy.skewedRandomInteger(pedigree.constant.autosomalFrequency);
			pairTypeGen2 = Mathy.skewedRandomInteger(pedigree.constant.autosomalFrequency);
		} else { // sex-linked
			pairTypeGen1 = Mathy.skewedRandomInteger(pedigree.constant.sexlinkedFrequency);
			pairTypeGen2 = Mathy.skewedRandomInteger(pedigree.constant.sexlinkedFrequency);
		}
	}
	// bias the following randomness toward the higher numbers by using square root of the random number
	var biasedRand1 = Math.sqrt(Math.random());
	var biasedRand2 = Math.sqrt(Math.random());
	var nol = pedigree.constant.numOffspringLimits;
	var numChild = Math.floor(biasedRand1 * (nol[1] - nol[0] + 1)) + nol[0];
	var numGrand = Math.floor(biasedRand2 * (nol[3] - nol[2] + 1)) + nol[2];
	//
	pm = new PedigreeModel(currentTrait, pairTypeGen1, pairTypeGen2, numChild, numGrand);
	updateInfoLabel(pm);
	pm.removeDrawing(snapSvgCanvas);
	pm.draw(snapSvgCanvas);

	// debug("Trait: " + pedigree.constant.traitChoices[currentTrait] + "   First generation: " + pm.pairing);

}

function PedigreeModel(traittype, pairTypeGen1, pairTypeGen2, numChild, numGrand) {
	this.traitType = traittype;
	this.fatherGen1 = null;
	this.motherGen1 = null;
	this.inlaw = null;
	// this.whichChildPairsWithInlaw
	// this.grandchildren
	this.pairing = null;
	this.width = 600;
	this.height = 500;

	var sexlinked = (traittype == pedigree.constant.DOMINANT_SEXLINKED || traittype == pedigree.constant.RECESSIVE_SEXLINKED);
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
	for (var i=0; i<numChild; i++) {
		this.children[i] = birth(this.fatherGen1, this.motherGen1);
	}

	// try to find a pairing that matches parent2 (in which case we will adhere to the desired statistics
	this.whichChildPairsWithInlaw = -1;
	for (var i=0; i<numChild; i++) {
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

	this.grandchildren = new Array(numGrand);
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
	for (var i=0; i<numGrand; i++) {
		this.grandchildren[i] = birth(fatherGen2, motherGen2);
	}

	// private method
	function createParentsAutosomal(that, parentType) {
		switch (parentType) {
			case pedigree.constant.BB_BB:
				that.pairing = "BB BB";
				that.fatherGen1 = new IndividualModel(true, pedigree.constant.DOMINANT, pedigree.constant.DOMINANT);
				that.motherGen1 = new IndividualModel(false, pedigree.constant.DOMINANT, pedigree.constant.DOMINANT);
				break;
			case pedigree.constant.BB_Bb:
				that.pairing = "BB Bb";
				that.fatherGen1 = new IndividualModel(true, pedigree.constant.DOMINANT, pedigree.constant.DOMINANT);
				that.motherGen1 = new IndividualModel(false, pedigree.constant.DOMINANT, pedigree.constant.RECESSIVE);
				break;
			case pedigree.constant.BB_bb:
				if (Math.random() > 0.5) { // randomly choose whether father or mother is BB
					that.pairing = "BB bb";
					that.fatherGen1 = new IndividualModel(true, pedigree.constant.DOMINANT, pedigree.constant.DOMINANT);
					that.motherGen1 = new IndividualModel(false, pedigree.constant.RECESSIVE, pedigree.constant.RECESSIVE);
				} else {
					that.pairing = "bb BB";
					that.fatherGen1 = new IndividualModel(true, pedigree.constant.RECESSIVE, pedigree.constant.RECESSIVE);
					that.motherGen1 = new IndividualModel(false, pedigree.constant.DOMINANT, pedigree.constant.DOMINANT);
				}
				break;
			case pedigree.constant.Bb_Bb:
				that.pairing = "Bb Bb";
				that.fatherGen1 = new IndividualModel(true, pedigree.constant.DOMINANT, pedigree.constant.RECESSIVE);
				that.motherGen1 = new IndividualModel(false, pedigree.constant.DOMINANT, pedigree.constant.RECESSIVE);
				break;
			case pedigree.constant.Bb_bb:
				if (Math.random() > 0.5) { // randomly choose whether father or mother is Bb
					that.pairing = "Bb bb";
					that.fatherGen1 = new IndividualModel(true, pedigree.constant.DOMINANT, pedigree.constant.RECESSIVE);
					that.motherGen1 = new IndividualModel(false, pedigree.constant.RECESSIVE, pedigree.constant.RECESSIVE);
				} else {
					that.pairing = "bb Bb";
					that.fatherGen1 = new IndividualModel(true, pedigree.constant.RECESSIVE, pedigree.constant.RECESSIVE);
					that.motherGen1 = new IndividualModel(false, pedigree.constant.DOMINANT, pedigree.constant.RECESSIVE);
				}
				break;
			case pedigree.constant.bb_bb:
				that.pairing = "bb bb";
				that.fatherGen1 = new IndividualModel(true, pedigree.constant.RECESSIVE, pedigree.constant.RECESSIVE);
				that.motherGen1 = new IndividualModel(false, pedigree.constant.RECESSIVE, pedigree.constant.RECESSIVE);
				break;
		}
	}

	// private method
	function createParentsSexlinked(that, parentType) {
		switch (parentType) {
			case pedigree.constant.XBXB_XBy:
				that.pairing = "XBXB XBy";
				that.motherGen1 = new IndividualModel(false, pedigree.constant.DOMINANT, pedigree.constant.DOMINANT);
				that.fatherGen1 = new IndividualModel(true, pedigree.constant.DOMINANT, pedigree.constant.EMPTY);
				break;
			case pedigree.constant.XBXB_Xby:
				that.pairing = "XBXB Xby";
				that.motherGen1 = new IndividualModel(false, pedigree.constant.DOMINANT, pedigree.constant.DOMINANT);
				that.fatherGen1 = new IndividualModel(true, pedigree.constant.RECESSIVE, pedigree.constant.EMPTY);
				break;
			case pedigree.constant.XBXb_XBy:
				that.pairing = "XBXb XBy";
				that.motherGen1 = new IndividualModel(false, pedigree.constant.DOMINANT, pedigree.constant.RECESSIVE);
				that.fatherGen1 = new IndividualModel(true, pedigree.constant.DOMINANT, pedigree.constant.EMPTY);
				break;
			case pedigree.constant.XBXb_Xby:
				that.pairing = "XBXb Xby";
				that.motherGen1 = new IndividualModel(false, pedigree.constant.DOMINANT, pedigree.constant.RECESSIVE);
				that.fatherGen1 = new IndividualModel(true, pedigree.constant.RECESSIVE, pedigree.constant.EMPTY);
				break;
			case pedigree.constant.XbXb_XBy:
				that.pairing = "XbXb XBy";
				that.motherGen1 = new IndividualModel(false, pedigree.constant.RECESSIVE, pedigree.constant.RECESSIVE);
				that.fatherGen1 = new IndividualModel(true, pedigree.constant.DOMINANT, pedigree.constant.EMPTY);
				break;
			case pedigree.constant.XbXb_Xby:
				that.pairing = "XbXb Xby";
				that.motherGen1 = new IndividualModel(false, pedigree.constant.RECESSIVE, pedigree.constant.RECESSIVE);
				that.fatherGen1 = new IndividualModel(true, pedigree.constant.RECESSIVE, pedigree.constant.EMPTY);
				break;
		}
	}

	// private method
	function birth(father, mother) {
		var toggle = Math.floor(Math.random()*2); // 0 or 1
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
		for (var i=0; i<this.children.length; i++) {
			if (i == this.whichChildPairsWithInlaw)
				result += "*";
			result += this.children[i].toString();
			result += "\n";
		}
		result += "*Inlaw: " + this.inlaw.toString();
		result += "\n";
		for (var i=0; i<this.grandchildren.length; i++) {
			result += this.grandchildren[i].toString();
			result += "\n";
		}
		return result;
	}
}
// public method
PedigreeModel.prototype.draw = function(canvas) {
		// debug("draw function");

		var gridX = pedigree.constant.SEPARATION;
		var gridY = pedigree.constant.SEPARATION*1.5;
		var headY = pedigree.constant.SEPARATION/2;

		var gen1 = this.children.length;
		var gen2 = this.grandchildren.length;

		var gen1Center = Math.floor(0.45 * canvas.getSize().width);

		// draw father/mother pairing T
		canvas.drawLine(gen1Center - gridX / 2, gridY, gen1Center + gridX / 2, gridY, 1);
		canvas.drawLine(gen1Center, gridY, gen1Center, gridY * 2 - headY, 1);
		// draw gen 1 sibling line
		var x = gen1Center - ((gen1 - 1) * gridX) / 2;
		canvas.drawLine(x, gridY * 2 - headY, gen1Center + ((gen1 - 1) * gridX) / 2, gridY * 2 - headY, 1);
		for (var i=0; i < gen1; i++) {
			x = gen1Center - ((gen1 - 1) * gridX) / 2 + i * gridX;
			canvas.drawLine(x, gridY * 2 - headY, x, gridY * 2 - headY + 6, 1);
		}
		// draw inlaw pairing T
		var gen2Center = gen1Center + (gen1 * gridX) / 2;
		canvas.drawLine(gen2Center - gridX / 2, gridY * 2, gen2Center + gridX / 2, gridY * 2, 1);
		canvas.drawLine(gen2Center, gridY * 2, gen2Center, gridY * 3 - headY, 1);
		// draw gen 2 sibling line
		var x2 = gen2Center - ((gen2 - 1) * gridX) / 2;
		canvas.drawLine(x2, gridY * 3 - headY, gen2Center + ((gen2 - 1) * gridX) / 2, gridY * 3 - headY, 1);
		for (var i=0; i < gen2; i++) {
			x2 = gen2Center - ((gen2 - 1) * gridX) / 2 + i * gridX;
			canvas.drawLine(x2, gridY * 3 - headY, x2, gridY * 3 - headY + 6, 1);
		}

		// draw symbols
		var dominant = (this.traitType == pedigree.constant.DOMINANT_SEXLINKED || this.traitType == pedigree.constant.DOMINANT_AUTOSOMAL);
		var visible = this.fatherGen1.isTraitVisible(dominant);
		var fatherGS = new GenderSymbol(gen1Center - gridX / 2, gridY, pedigree.constant.SYMBOL_SIZE, visible, pedigree.constant.LINE_THICKNESS, true);
		fatherGS.draw(canvas);
		visible = this.motherGen1.isTraitVisible(dominant);
		var motherGS = new GenderSymbol(gen1Center + gridX / 2, gridY, pedigree.constant.SYMBOL_SIZE, visible, pedigree.constant.LINE_THICKNESS, false);
		motherGS.draw(canvas);

		visible = this.inlaw.isTraitVisible(dominant);
		var inlawGS = new GenderSymbol(x + gridX, 2 * gridY, pedigree.constant.SYMBOL_SIZE, visible, pedigree.constant.LINE_THICKNESS, this.inlaw.isMale());
		inlawGS.draw(canvas);

		// sort so that the inlaw's mate is at the right end
		var temp = this.children;
		temp[gen1 - 1] = this.children[this.whichChildPairsWithInlaw];
		temp[this.whichChildPairsWithInlaw] = this.children[gen1 - 1];

		var child;
		for (var i=0; i<gen1; i++) {
			x = gen1Center - ((gen1 - 1) * gridX) / 2 + i * gridX;
			visible = temp[i].isTraitVisible(dominant);
			child = new GenderSymbol(x, 2 * gridY, pedigree.constant.SYMBOL_SIZE, visible, pedigree.constant.LINE_THICKNESS, temp[i].isMale());
			child.draw(canvas);
		}

		var grand;
		for (var i=0; i<gen2; i++) {
			x2 = gen2Center - ((gen2 - 1) * gridX) / 2 + i * gridX;
			visible = this.grandchildren[i].isTraitVisible(dominant);
			grand = new GenderSymbol(x2, 3 * gridY, pedigree.constant.SYMBOL_SIZE, visible, pedigree.constant.LINE_THICKNESS, this.grandchildren[i].isMale());
			grand.draw(canvas);
		}
}
PedigreeModel.prototype.removeDrawing = function(canvas) {
	canvas.clear();
}


function IndividualModel(m, a1, a2) {
	if (a1 == pedigree.constant.EMPTY) alert("Invalid arguments sent to function IndividualModel");
	if (!m && a2 == pedigree.constant.EMPTY) alert("Invalid arguments sent to function IndividualModel");
	///if (a1 == pedigree.constant.RECESSIVE && a2 == pedigree.constant.DOMINANT) alert("Invalid arguments sent to function IndividualModel");

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
			return (this.getAllele(pedigree.constant.X_ALLELE)+this.getAllele(pedigree.constant.Y_ALLELE) >= 0);
		else
			return (this.getAllele(pedigree.constant.X_ALLELE)+this.getAllele(pedigree.constant.Y_ALLELE) < 0);
	} else {
		if (isDominant == pedigree.constant.RECESSIVE)
			return (this.getAllele(pedigree.constant.X_ALLELE)+this.getAllele(pedigree.constant.Y_ALLELE) < 0);
		else			// dominant
			return (this.getAllele(pedigree.constant.X_ALLELE)+this.getAllele(pedigree.constant.Y_ALLELE) >= 0);
	}
};

// Gets one of the alleles.  Use this to generate children according to the Punnett Square.
// @return DOMINANT, EMPTY, OR RECESSIVE
IndividualModel.prototype.getAllele = function(whichN) {
	if (whichN == pedigree.constant.X_ALLELE)
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
	else
		return (this.getAllele(1)==individualModel.getAllele(2) && this.getAllele(2)==individualModel.getAllele(1))
}

IndividualModel.prototype.toString = function() {
	result = "";
	if (this.male)
		result += "Male ";
	else
		result += "Female ";
	switch(this.allele1) {
		case pedigree.constant.DOMINANT:
			result += "Dominant ";
			break;
		case pedigree.constant.RECESSIVE:
			result += "Recessive ";
			break;
	}
	switch(this.allele2) {
		case pedigree.constant.DOMINANT:
			result += "Dominant";
			break;
		case pedigree.constant.RECESSIVE:
			result += "Recessive";
			break;
		case pedigree.constant.EMPTY:
			result += "Empty";
	}
	return result;
}



function GenderSymbol(x, y, size, filled, lineW, gender) {

	this.c = {
		RADIUS_RATIO: 1.6,	// controls how long the radial line is as a ratio of circle radius
		SPREAD_RATIO: 0.65,	// controls how big the arrow and crossbar are as a ratio of circle radius
		SLANT: 1 // pixels of offset that sharpens the male arrows
	};

	this.xCenter = parseFloat(x);
	this.yCenter = parseFloat(y);
	this.size = (size > 4) ? size : 5; // radius of circles
	this.lineWidth = (lineW < 1) ? 1 : parseFloat(lineW);
	this.gender = gender; // true for male
	this.fillColor = (filled) ? pedigree.constant.DARK_COLOR : pedigree.constant.LIGHT_COLOR;
}

GenderSymbol.prototype.draw = function(canvas) {
	var halfLineW = Math.floor(this.lineWidth * 0.0);
	var xOval = this.xCenter - halfLineW;
	var yOval = this.yCenter - halfLineW;
	var xFill = this.xCenter - halfLineW;
	var yFill = this.yCenter - halfLineW;
	var l1 = Math.round(this.size * this.c.RADIUS_RATIO);
	var l2 = Math.round(this.size * this.c.SPREAD_RATIO);

	canvas.defaultStroke(pedigree.constant.DARK_COLOR, pedigree.constant.LINE_THICKNESS);
	
	// draw the lines that make up the male and female symbols
	if (this.gender) { // true: male
		canvas.drawLine(this.xCenter, this.yCenter, this.xCenter + l1, this.yCenter - l1);
		canvas.drawLine(this.xCenter + l1 - l2, this.yCenter - l1 + this.c.SLANT, this.xCenter + l1, this.yCenter - l1);
		canvas.drawLine(this.xCenter + l1, this.yCenter - l1, this.xCenter + l1 - this.c.SLANT, this.yCenter - (l1 - l2));
	} else { // false: female
		canvas.drawLine(this.xCenter, this.yCenter, this.xCenter, this.yCenter + l1 + l2 - 1);
		canvas.drawLine(this.xCenter - l2 + 1, this.yCenter + l1, this.xCenter + l2 - 1, this.yCenter + l1);
	}
	canvas.drawCircle(xOval, yOval, this.size, this.fillColor);
}


var snapSvgCanvas = {
	snapPaper: null, // set this before calling any functions below
	clear: function() {
		this.snapPaper.selectAll('line').remove();
		this.snapPaper.selectAll('circle').remove();
	},
	drawLine: function(x1, y1, x2, y2, strokeWidth) {
		if (typeof strokeWidth === 'number')
			return this.snapPaper.line(x1, y1, x2, y2).attr({'stroke-width': strokeWidth});
		else
			return this.snapPaper.line(x1, y1, x2, y2); // the stroke width will be whatever was set on the group - see defaultStrokeColor below
	},
	drawCircle: function(r, cx, cy, fillColor) {
		return this.snapPaper.circle(r, cx, cy).attr({fill: fillColor});
	},
	defaultFillColor: function(colorString) {
		this.snapPaper.attr({fill: colorString});
	},
	defaultStroke: function(colorString, strokeWidth) {
		this.snapPaper.attr({stroke: colorString});
		// also set the default stroke width
		this.snapPaper.attr({'stroke-width': strokeWidth});
		this.snapPaper.attr({'stroke-linecap': 'round'});
	},
	getSize: function() {
		return {
			width: $("#canvas").width(),
			height: $("#canvas").height()
		};
	}
}

function showMetaInfo(versionString) {
	var copyrightText = "Copyright 2015";
	var createdByText = "";
	var versionText = "Version "+versionString+".";
	var centerNode = $("<div style='text-align: center; margin-top: 20px'></div>");
	centerNode.append($("<span></span>").text(copyrightText+" "));
	centerNode.append($("<a href='http://harvest.cals.ncsu.edu' target='_blank'></a>").text("North Carolina State University"));
	centerNode.append(" &nbsp; Code by ");
	centerNode.append($("<a href='http://www.onetimesoftware.com' target='_blank'></a>").text("One Time Software"));
	centerNode.append(". &nbsp; "+versionText);
	centerNode.append("<br>");
	centerNode.append($("<span></span>").text("Free for academic use when displaying this notice."));
	centerNode.css({
		color: "gray",
		"font-size": "x-small",
		"position": "fixed",
		"bottom": "20px",
		"left": "50%",
		"margin-right": "-50%",
		"transform": "translate(-50%, 0)"
	});
	return centerNode;
}

