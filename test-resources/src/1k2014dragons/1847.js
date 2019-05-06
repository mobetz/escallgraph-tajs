time=0;delay=64;
	
	// http://www.flickr.com/photos/josecarlosff/6808640749/
	// cc-by-nc 2.0 - Jose Carlos Fernandez
	var lines = [2,240,120,2,120,240,21,10,77,204,82,232,56,77,119,220,120,225,50,18,65,182,104,227,40,75,83,55,126,61,41,42,148,32,177,137,44,28,49,109,51,85,54,18,45,117,61,175,62,16,47,116,46,98,52,79,146,174,155,157,59,95,94,68,124,75,69,90,133,68,144,98,72,90,97,72,125,189,80,71,104,68,135,70,17,5,157,223,155,239,40,3,195,153,196,147,80,85,126,189,154,128,79,22,53,123,84,191,88,40,84,138,84,159,55,4,166,208,171,202,89,43,157,152,165,147,58,9,141,103,185,100,33,6,169,115,188,105,8,8,176,104,179,106,20,7,142,102,167,88,89,53,105,71,140,70,86,9,67,107,95,115,15,12,159,106,163,106,100,2,160,104,162,104,32,7,160,112,164,115,33,5,142,114,151,105,66,5,147,114,171,119,4,3,159,102,179,102,7,5,169,87,187,84,56,9,137,113,144,107,71,10,132,114,143,163,90,14,124,163,122,46,74,10,56,96,58,99,15,6,67,90,100,102,4,4,66,105,75,104,12,8,63,108,65,106,41,6,65,113,74,116,10,10,78,108,84,107,81,2,80,106,82,106,34,7,80,113,83,112,5,4,54,90,77,91,41,7,91,104,108,116,54,7,121,24,158,24,69,6,109,159,111,114,71,11,79,121,102,117,64,5,109,168,121,173,65,5,126,175,142,166,37,4,26,115,34,122,68,5,29,119,34,128,68,10,32,131,34,135,67,10,101,192,122,191,63,9,133,190,152,190,61,6,132,209,153,192,64,8,100,197,125,209,45,3,127,194,156,187,44,3,93,188,126,195];
	
	// http://www.flickr.com/photos/viperstealth/6990399578/
	// cc-by 2.0 - Daniel Lee
	lines.push(2,240,120,2,120,240,36,90,86,141,96,233,60,36,73,127,75,249,48,44,92,201,138,212,24,136,136,134,138,80,48,128,121,108,138,80,23,34,61,90,74,37,46,50,73,138,81,184,1,53,45,93,67,12,55,42,143,214,182,144,82,31,108,205,140,216,64,91,133,68,149,71,63,113,116,141,117,158,74,79,131,66,143,69,85,22,99,173,164,172,82,31,86,118,115,159,83,23,112,155,141,128,72,35,87,173,107,203,85,24,108,125,113,208,54,12,163,211,187,170,82,24,98,190,130,204,40,15,177,103,199,94,9,25,181,109,194,111,69,13,176,107,188,112,10,7,182,93,204,88,87,54,120,76,127,61,94,14,114,104,125,103,12,18,179,106,180,108,98,2,178,108,178,110,100,2,182,108,184,108,68,17,161,169,161,176,49,10,169,159,172,200,1,6,183,103,203,104,5,7,204,88,204,88,38,6,132,116,137,104,49,13,175,122,178,135,81,17,155,134,162,57,41,13,131,86,140,95,13,7,117,76,150,88,17,10,98,98,130,92,6,5,97,98,107,108,23,3,107,109,124,112,10,16,113,97,116,102,72,2,114,102,114,103,75,2,120,100,120,102,41,4,94,82,115,75,3,7,129,94,136,99,67,4,114,73,137,78,76,18,162,145,146,115,73,13,117,125,150,118,82,7,148,149,165,147,18,2,149,156,154,154,51,7,43,124,51,146,43,6,31,143,39,151,67,11,38,139,44,148,43,8,136,187,154,185,27,13,160,187,165,189,39,9,150,195,163,195,75,5,142,194,154,194,14,2,157,188,172,189,23,1,126,186,156,187);
	
	function drawView() {
		c.lineCap="round";
		var coef =.5+.5*Math.cos(time*3.1416/64);
		i=0;
		var nb=6*61-1;
		while(i<nb) {
			c.strokeStyle = "hsl(16,30%,"+(coef*lines[i++]+(1-coef)*lines[i+nb])+"%)";
			c.lineWidth=0|(coef*lines[i++]+(1-coef)*lines[i+nb]);
			c.beginPath();
			c.moveTo(coef*lines[i++]+(1-coef)*lines[i+nb],
					 coef*lines[i++]+(1-coef)*lines[i+nb]);
			c.lineTo(coef*lines[i++]+(1-coef)*lines[i+nb],
					 coef*lines[i++]+(1-coef)*lines[i+nb]);
			c.stroke();
		}
	}

	setInterval( function () {
		drawView();
		
		if (delay>0) 
			--delay;
		else
		{
			++time;
			delay = ((time&63)==0&&delay==0)?99:delay;
		}
		
			
	}, 40);