
function GenderSymbol(x, y, size, filled, lineW, gender) {

	this.c = {
		RADIUS_RATIO = 1.8f;	// controls how long the radial line is as a ratio of circle radius
		SPREAD_RATIO = 0.75f;	// controls how big the arrow and crossbar are as a ratio of circle radius
	};

	this.xCenter = Math.abs(x);
	this.yCenter = Math.abs(y);
	this.size = (size > 4) ? size : 5;
	this.filled = filled;
	this.lineWidth = (lineW < 1) ? 1 : lineW;
	this.gender = gender;
	this.c = Color.getHSBColor(0f, 0f, 0f); // black line and fill color

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
			snapSvgContainer.setColor(Color.getHSBColor(0f, 0f, 1f)); // white, hides the line inside the oval
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
