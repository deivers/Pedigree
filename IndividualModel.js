// required global:  pedigree.constants
// required script:  GenderSymbols.js

pedigree.constants.DOMINANT = 1;
pedigree.constants.EMPTY = 0;
pedigree.constants.RECESSIVE = -1;
pedigree.constants.X_ALLELE = 0;
pedigree.constants.Y_ALLELE = 1;

function IndividualModel(m, a1, a2) {
	if (a1 == pedigree.constants.EMPTY) alert("Invalid arguments sent to function IndividualModel");
	if (!m && a2 == pedigree.constants.EMPTY) alert("Invalid arguments sent to function IndividualModel");
	///if (a1 == pedigree.constants.RECESSIVE && a2 == pedigree.constants.DOMINANT) alert("Invalid arguments sent to function IndividualModel");

	this.male = m;		// false selected for female because of common initial letter
	this.allele1 = a1;
	this.allele2 = a2;


	this.isMale = function() {
		return male;
	}

	this.isTraitVisible = function(isDominant) {
		// the only way for a recessive trait to appear is to have:
		// both alleles recessive, or one allele recessive and the other empty
		if (typeof isDominant === "boolean")
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
	this.getAllele = function(int whichN) {
		if (whichN == pedigree.constants.X_ALLELE)
			return allele1;
		else
			return allele2;
	}

	// For our purposes, two individuals are equal if they have the same alleles
	// Optionally, this will also check the individual's gender
	this.equals = function(individualModel, checkGender) {
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

	this.toString = function() {
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


}