/**
 * @fileOverview
 *
 * An lsystem generator
 *
 * Copyright (C) 2011 by Matthew Phillips
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

/**
 * @namespace
 */
var lsystem = {
	//These are fairly standard lsystem symbols
	/** Draws a line */
	LSYSTEM_LINE : 'F',
	/** Moves without drawing a line */
	LSYSTEM_MOVE : 'M',
	/** Turns left (positive)*/
	LSYSTEM_ROTATE_P : '+',
	/** Turns right (negative) */
	LSYSTEM_ROTATE_N : '-',
	/** Save the current state */
	LSYSTEM_SAVE : '[',
	/** Restore the previously saved state */
	LSYSTEM_RESTORE : ']',

	//These are some addiotns I have seen
	/** Change the size of the line */
	LSYSTEM_SCALE : 'S',
	/** Reverse meaning of +,- */
	LSYSTEM_REVERSE : 'N',

	//These are additions I made up
	/** Switch to next colour */
	LSYSTEM_COLOUR : 'C',
	/** Move to top of data area */
	LSYSTEM_TOP	: 'T',
	/** Move to bottom of data area */
	LSYSTEM_BOTTOM : 'B',
	/** Move to left of data area */
	LSYSTEM_LEFT : 'L',
	/** Move to right of data area */
	LSYSTEM_RIGHT : 'R',
	/** Move to horizonatl center of data area */
	LSYSTEM_CENTER_H : 'H',
	/** Move to vertical center of data area */
	LSYSTEM_CENTER_V : 'V',
	/** Set the current angle */
	LSYSTEM_ANGLE : 'A',

	// Color modes
	/** No Colours */
	LSYSTEM_COLOUR_NONE : 0,
	/** Colours are divided evenly by depth */
	LSYSTEM_COLOUR_DEPTH : 1,
	/** Colour is changed each time a line is drawn */
	LSYSTEM_COLOUR_LINE : 2,
	/** Colour is changing using C command in lsystem string */
	LSYSTEM_COLOUR_INLINE : 3,

	_number_regexp : /[\d.]/,

	_test : [
		//Tree **
		{
			axium : "HBA90FFy",
			vars : "xy",
			productions : [
				"F[S0.5+++++++++x]-F[S0.4-----------Nx]S0.6x",
				"F[A160S0.4x]F[A10S0.5x]x}" ],
			depth : 9,
			angle : 7,
			len : 50
		},
		//Bush **
		{
			axium : "HBA90F",
			vars : "F",
			productions : [ "FF-[-F+F+F]+[+F-F-F]" ],
			depth : 4,
			angle : 22.5,
			len : 8
		},
		//Thistle **
		{
			axium : "VLyA180Ry",
			vars : "xy",
			productions : [
				"FxC[-Fx][-Fx][+Fx]Fx",
				"[++FFx][--FFx]" ],
			depth : 5,
			angle : 30,
			len : 4
		},
		//Square **
		{
			axium : "[F]+[F]+[F]+[F]",
			vars : "F",
			productions : [ "F[+F][-F]F" ],
			depth : 5,
			angle : 90,
			len : 6
		},
		//Circle **
		{
			axium : "HVxA180x",
			vars : "x",
			productions : [ "x+F" ],
			depth : 360,
			angle : 1,
			len : 5
		},
		//Kosh Island **
		{
			axium : "[x]+[x]+[x]+[x]",
			vars : "Fx",
			productions : [ "F+CF-F-FCF+F+F-F", "F+F+F+F" ],
			depth : 4,
			angle : 90,
			len : 2
		},
		//Kosh2? **
		{
			axium : "BL[F]TRA180F",
			vars : "F",
			productions : [ "F+CF-F-FC+F" ],
			depth : 5,
			angle : 90,
			len : 5
		},
		//Dragon Curve **
		{
			axium : "[-x]+++x",
			vars : "xy",
			productions : [ "x+F+y", "x-F-y" ],
			depth : 16,
			angle : 45,
			len : 1
		}
	],

	/** String representation of lsystem tests */
	_test_s : [
		"Tree   ",
		"Bush   ",
		"Thistle",
		"Square ",
		"Circle ",
		"Kosh   ",
		"Kosh2  ",
		"Dragon "
	],

	/** Default background red */
	_BR : 60,
	/** Default background green */
	_BG : 120,
	/** Default background blue */
	_BB : 200,

	/**
	 * Draw an lsystem test
	 *
	 * @param id	The id of the test to draw
	 * @param len	Line length
	 * @param w		The width
	 * @param h		The height
	 */
	test : function(id, len, w, h) {
		var l = this._copyLsystem(this._test[id]);
		l.len += len;

		var mode = this.LSYSTEM_COLOUR_NONE;
		var colours = null;
		switch (id)
		{
			case 0:
			case 1:
			case 2:
				mode = this.LSYSTEM_COLOUR_DEPTH;
				if (id === 2) {
					mode = this.LSYSTEM_COLOUR_INLINE;
				}
				colours = [
							this._BR, this._BG, this._BB,
							110, 70, 0,
							15, 130, 10 ];
				num_colours = 2;
			break;
			case 3:
				mode = this.LSYSTEM_COLOUR_LINE;
				colours = [
							this._BR, this._BG, this._BB,
							150, 0, 150,
							0, 0, 240,
							180, 0, 40,
							0, 0, 240,
							150, 0, 150,
							0, 0, 240,
							150, 0, 150 ];
				num_colours = 7;
			break;
			case 4:
				mode = this.LSYSTEM_COLOUR_LINE;
				colours = [
							this._BR, this._BG, this._BB,
							0, 0, 0 ];
				num_colours = 2;
				if (id === 4) { num_colours = 1; }
			break;
			case 5:
			case 6:
				mode = this.LSYSTEM_COLOUR_INLINE;
				colours = [
							this._BR, this._BG, this._BB,
							0, 0, 240,
							0, 0, 240,
							0, 0, 240,
							180, 0, 40,
							180, 0, 40,
							180, 0, 40,
							140, 0, 140,
							140, 0, 140,
							140, 0, 140,
							180, 0, 40,
							180, 0, 40,
							180, 0, 40 ];
				num_colours = 9;
			break;
			case 7:
				mode = this.LSYSTEM_COLOUR_LINE;
				colours = [
							this._BR, this._BG, this._BB,
							240, 0, 0,
							205, 205, 0 ];
				num_colours = 2;
				if (id === 4) { num_colours = 1; }
			break;
		}
		return this._draw_colour(l, w, h, mode, colours, num_colours);
	},

	/**
	 * Makes a copy of an lsystem structure
	 */
	_copyLsystem : function(ls1) {
		var ls2 = {};
		ls2.axium = ls1.axium;
		ls2.vars = ls1.vars;
		ls2.depth = ls1.depth;
		ls2.angle = ls1.angle;
		ls2.len = ls1.len;
		ls2.productions = new Array(ls1.productions.length);
		var i;
		for(i = 0; i < ls1.productions.length; ++i) {
			ls2.productions[i] = ls1.productions[i];
		}
		return ls2;
	},

	_draw_colour : function(l, w, h, cm, colours, num_colours) {
		var dataSize = w * h * 3;
		var data = new Array(dataSize);

		var background = [255, 255, 255];
		if (colours)
		{
			background[0] = colours.shift();
			background[1] = colours.shift();
			background[2] = colours.shift();
		}
		var i = 0;
		for (i = 0; i < dataSize; i+=3)
		{
			data[i] = background[0];
			data[i + 1] = background[1];
			data[i + 2] = background[2];
		}

		var state = {};
		state.w = w;
		state.h = h;
		state.x = w/2;
		state.y = h/2;

		state.depth = 0;

		state.lsys = l;
		state.angle = 0.0;
		state.len = l.len;
		state.str = l.axium;

		state.colour_mode = cm;
		state.colour_list = colours;
		state.ci = 0;
		state.colour = new Array(3);
		if (colours)
		{
			state.colour[0] = colours[0];
			state.colour[1] = colours[1];
			state.colour[2] = colours[2];
		}
		else
		{
			state.colour[0] = 0;
			state.colour[1] = 0;
			state.colour[2] = 0;
		}
		state.num_colours = num_colours;

		state.data = data;

		this._draw_r(state);

		return data;
	},

	_draw_r : function(state) {
		//console.log('lsystem._draw_r: %s %i', state.str, state.depth);
		if (state.colour_mode === this.LSYSTEM_COLOUR_DEPTH)
		{
			state.ci = Math.floor(state.depth*(state.num_colours/(state.lsys.depth + 1)));
			state.colour[0] = state.colour_list[state.ci * 3];
			state.colour[1] = state.colour_list[state.ci * 3 + 1];
			state.colour[2] = state.colour_list[state.ci * 3 + 2];
		}

		var ci = 0;
		var c = state.str;
		var done = false;
		var negate = 1;
		var angle = false;
		var search_i = -1;
		while (ci < c.length && !done)
		{
			angle = false;

			//If haven't reach the maximum recursive depth
			if (state.depth < state.lsys.depth)
			{
				//see if this character has a substitution
				search_i = state.lsys.vars.indexOf(c[ci]);
				if (search_i !== -1)
				{
					//replace current string with proposition
					var temp = state.str;
					state.str = state.lsys.productions[search_i];

					//console.log('lsystem._draw_r: substitue %s', c[ci]);

					//process the new string
					++state.depth;
					this._draw_r(state);
					--state.depth;

					//restore and move on
					state.str = temp;
					++ci;
					continue;
				}
			}

			//If at the maximum recursion depth, or the character
			//was not substituted then process it
			switch (c[ci])
			{
				case this.LSYSTEM_LINE :
					this._draw_line(state);
				break;
				case this.LSYSTEM_MOVE :
					var d = this._find_slope(state);
					state.x += d.dx;
					state.y += d.dy;
				break;
				case this.LSYSTEM_ROTATE_P :
					state.angle += state.lsys.angle*negate;
				break;
				case this.LSYSTEM_ROTATE_N :
					state.angle -= state.lsys.angle*negate;
				break;
				case this.LSYSTEM_SAVE:
					//copy current state
					var new_state = this._copyLsystemState(state);
					new_state.str = c.substring(ci + 1);

					//call recursive
					//console.log('lsystem._draw_r: save');
					this._draw_r(new_state);

					//advance past save area
					search_i = c.indexOf(this.LSYSTEM_RESTORE, ci);
					if (search_i !== -1) {
						ci = search_i;
						//console.log('lsystem._draw_r: save done %s', c.substring(ci+1));
					} else {
						console.log("Missing close of save state at: %i\n", ci);
					}
				break;
				case this.LSYSTEM_RESTORE :
					done = true;
				break;
				case this.LSYSTEM_ANGLE :
					angle = true;
					// pass through
				case this.LSYSTEM_SCALE :
					++ci;

					var numStr = "";
					while (this._number_regexp.test(c[ci])) {
						numStr += c[ci];
						++ci;
					}
					--ci;
					var amount = parseFloat(numStr);
					if (!isNaN(amount)) {
						if (angle) {
							state.angle = amount;
						} else {
							state.len *= amount;
						}
					} else {
						console.log("Invaild number at: %s\n", ci);
					}
				break;
				case this.LSYSTEM_REVERSE :
					negate *= -1;
				break;
				case this.LSYSTEM_COLOUR :
					if (state.colour_mode === this.LSYSTEM_COLOUR_INLINE) {
						state.ci = (state.ci + 1) % state.num_colours;
						state.colour[0] = state.colour_list[state.ci * 3];
						state.colour[1] = state.colour_list[state.ci * 3 + 1];
						state.colour[2] = state.colour_list[state.ci * 3 + 2];
					}
				break;
				case this.LSYSTEM_TOP :
					state.y = state.h - 1;
				break;
				case this.LSYSTEM_BOTTOM :
					state.y = 0;
				break;
				case this.LSYSTEM_LEFT :
					state.x = 0;
				break;
				case this.LSYSTEM_RIGHT :
					state.x = state.w - 1;
				break;
				case this.LSYSTEM_CENTER_H :
					state.x = state.w/2;
				break;
				case this.LSYSTEM_CENTER_V :
					state.y = state.h/2;
				break;
				default : break;
			}

			//next character
			++ci;
		}
	},

	_copyLsystemState : function(ls1) {
		var ls2 = {};
		ls2.w = ls1.w;
		ls2.h = ls1.h;
		ls2.x = ls1.x;
		ls2.y = ls1.y;
		ls2.depth = ls1.depth;
		ls2.angle = ls1.angle;
		ls2.len = ls1.len;
		ls2.str = ls1.str;
		ls2.lsys = ls1.lsys;
		ls2.colour_mode = ls1.colour_mode;
		ls2.colour = [ls1.colour[0], ls1.colour[1], ls1.colour[2]];
		ls2.colour_list = ls1.colour_list;
		ls2.num_colours = ls1.num_colours;
		ls2.ci = ls1.ci;
		ls2.data = ls1.data;
		return ls2;
	},

	/** Finds the x and y component of the current line slope
	 *  @param state The lsystem
	 *  @return An object { dx, dy }
	 */
	_find_slope : function(state) {
		var dx = Math.round(state.len*Math.cos(state.angle*Math.PI/180.0));
		var dy = Math.round(state.len*Math.sin(state.angle*Math.PI/180.0));
		return { dx : dx, dy : dy };
	},

	/** Fills in a pixel
	 *  @param state The lsystem
	 */
	_draw_pixel : function(state) {
		if (state.x < state.w && state.y < state.h)
		{
			var i = (state.y*state.w + state.x)*3;
			state.data[i] = state.colour[0];
			state.data[i + 1] = state.colour[1];
			state.data[i + 2] = state.colour[2];
		}
	},

	/** Draws a line
	 *  @param state The lsystem
	 */
	_draw_line : function(state) {
		var slope = this._find_slope(state);
		var dx = slope.dx;
		var dy = slope.dy;

		//where the line is going
		var x1 = state.x + dx;
		var y1 = state.y + dy;

		//lope is greater than 1 move on y instead of x
		var x, y;
		if (Math.abs(dy) > Math.abs(dx))
		{
			x = 'y';
			y = 'x';

			var temp = x1;
			x1 = y1;
			y1 = temp;

			var temp2 = dx;
			dx = dy;
			dy = temp2;
		} else {
			x = 'x';
			y = 'y';
		}

		//deal with negative slopes
		var xstep;
		var ystep;
		if (dx > 0) { xstep = 1; } else { xstep = -1; }
		if (dy > 0) { ystep = 1; } else { ystep = -1; }
		dx = Math.abs(dx);
		dy = Math.abs(dy);

		//keep track of error
		var e = 0;
		var de = dy;

		if (state.colour_mode === this.LSYSTEM_COLOUR_LINE)
		{
			state.ci = (state.ci + 1) % state.num_colours;
			state.colour[0] = state.colour_list[state.ci * 3];
			state.colour[1] = state.colour_list[state.ci * 3 + 1];
			state.colour[2] = state.colour_list[state.ci * 3 + 2];
		}

		while (state[x] !== x1)
		{
			this._draw_pixel(state);
			state[x] += xstep;

			e += de;
			if (e << 1 >= dx)
			{
				state[y] += ystep;
				e -= dx;
			}
		}
		this._draw_pixel(state);
	}
};
