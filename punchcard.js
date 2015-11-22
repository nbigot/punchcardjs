punchcard = (function() {
	var truncateLimitChars, colors, rMin, rMax, minSampleRange, maxSampleRange;

	function init() {
		truncateLimitChars = 30;
		rMin = 2;
		rMax = 9;
		colors = [
			'fill: rgb(49, 130, 189);',		// blue
			'fill: rgb(107, 174, 214);',
			'fill: rgb(158, 202, 225);',
			'fill: rgb(198, 219, 239);',
			'fill: rgb(230, 85, 13);',		// orange
			'fill: rgb(253, 141, 60);',
			'fill: rgb(253, 174, 107);',
			'fill: rgb(253, 208, 162);',
			'fill: rgb(49, 163, 84);',		// green
			'fill: rgb(116, 196, 118);',
			'fill: rgb(161, 217, 155);',
			'fill: rgb(199, 233, 192);',
			'fill: rgb(117, 107, 177);',	// purple
			'fill: rgb(158, 154, 200);',
			'fill: rgb(188, 189, 220);',
			'fill: rgb(218, 218, 235);',
			'fill: rgb(99, 99, 99);',		// grey
			'fill: rgb(150, 150, 150);',
			'fill: rgb(189, 189, 189);',
			'fill: rgb(217, 217, 217);',
		];
	}

	function generate(data) {
		minSampleRange = data.range.min;
		maxSampleRange = data.range.max;
		var gWidth = data.xAxis.length * 30 + 20 + 200;
		var gHeight = 20 * (data.rows.length + 2);
		var g = '<svg width="'+gWidth+'" height="'+gHeight+'">'
		g += '<g transform="translate(20,20)">';
		// labels for x axis
		g += '<g class="x axis" transform="translate(0,0)">';
		var xTranslate = 0;
		var xTranslateInc = 100/3;
		for (var i = 0; i < data.xAxis.length; i++) {
			var xAxisLabel = data.xAxis[i];
			g += '<g class="tick major" transform="translate('+xTranslate+',0)" style="opacity: 1;"><line y2="-6" x2="0"></line><text y="-9" x="0" dy="0em" style="text-anchor: middle;">'+xAxisLabel+'</text></g>';
			xTranslate += xTranslateInc;
		}
		g += '<path class="domain" d="M0,-6V0H'+(xTranslateInc*(data.xAxis.length-1))+'V-6"></path></g>';
		// rows
		for (var i = 0; i < data.rows.length; i++) {
			row = data.rows[i];
			var color = getColor(i, row);
			var cy = 20 * (i+1);
			var cytext = cy + 5;
			g += '<g class="journal">';
			var circles = '';
			var texts = '';
			// samples in a row
			for (var j = 0; j < row.samples.length; j++) {
				var sample = row.samples[j];
				if (sample === 0) {
					continue;
				}
				var t = transformSample(row, i, sample, j);
				circles += '<circle cx="'+t.cx+'" cy="'+cy+'" r="'+t.r+'" style="'+color+' display: block;"></circle>';
				texts += '<text y="'+cytext+'" x="'+t.x+'" class="value" style="'+color+' display: none;">'+sample+'</text>';
			}
			g += circles;
			g += texts;
			g += '<text y="'+cytext+'" x="'+(gWidth-200)+'" class="label" style="'+color+'">'+truncateLabel(row.label)+'</text>';
			g += '</g>';
		}
		g += '</svg>';
		var wrapper = document.createElement('div');
		wrapper.innerHTML = g;
		setEvents(wrapper.firstChild);
		return wrapper.firstChild;
	}

	function getColor(index, row) {
		return colors[ index % colors.length ];
	}

	function sample2Radius(sample) {
		// linear interpolate
		if (sample >= maxSampleRange) {
			return rMax;
		}
		if (sample <= minSampleRange) {
			return rMin;
		}
		return rMin + ((sample - minSampleRange) / (maxSampleRange - minSampleRange)) * (rMax - rMin);
	}

	function transformSample(row, rowIndex, sample, sampleIndex) {
		return {
			'r': sample2Radius(sample),
			'cx': sampleIndex*100/3,
			'x': sampleIndex*100/3 - (Math.floor(Math.log10(sample))+1)*4
		};
	}

	function truncateLabel(label) {
		if (label.length <= truncateLimitChars) {
			return label;
		}
		var slices = label.split(/[\s,:]+/);
		var s = '';
		for (var i = 0; i < slices.length; i++) {
			var slice = slices[i];
			if (s.length + slice.length >= truncateLimitChars) {
				break;
			}
			s += slice+' ';
		}
		return s+'...';
	}

	function setEvents(node) {
		var nodes = node.getElementsByClassName("label");
		for (i = 0; i < nodes.length; i++) {
			nodes[i].addEventListener("mouseover", function( event ) {
				var textNodes = this.parentNode.getElementsByTagName("text");
				for (j = 0; j < textNodes.length; j++) {
					if (textNodes[j].classList.contains("label") === false) {
						textNodes[j].style.display = 'block';
					}
				}
				var circleNodes = this.parentNode.getElementsByTagName("circle");
				for (j = 0; j < circleNodes.length; j++) {
					circleNodes[j].style.display = 'none';
				}
			});
			nodes[i].addEventListener("mouseout", function( event ) {
				var textNodes = this.parentNode.getElementsByTagName("text");
				for (j = 0; j < textNodes.length; j++) {
					if (textNodes[j].classList.contains("label") === false) {
						textNodes[j].style.display = 'none';
					}
				}
				var circleNodes = this.parentNode.getElementsByTagName("circle");
				for (j = 0; j < circleNodes.length; j++) {
					circleNodes[j].style.display = 'block';
				}
			});
		}
	}

	return {
		init : init,
		generate : generate
	}
})();