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
lsystem = {
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

	_test : [
		//Tree **
		{
			axium : "HBA90FFy",
			vars : "xy",
			productions : [
				"F[S0.5+++++++++x]-F[S0.4-----------Nx]S0.6x",
				"F[A160S0.4x]F[A10S0.5x]x}" ],
			depth : 9,
			angle : 7
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
	lsystem_test : function(id, len, w, h) {
		var l = this._copyLsystem(this._tests[id]);
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
				colours = {
							BR, BG, BB,
							110, 70, 0,
							15, 130, 10 };
				num_colours = 2;
			break;
			case 3:
				mode = this.LSYSTEM_COLOUR_LINE;
				colours = {
							BR, BG, BB,
							150, 0, 150,
							0, 0, 240,
							180, 0, 40,
							0, 0, 240,
							150, 0, 150,
							0, 0, 240,
							150, 0, 150 };
				num_colours = 7;
			break;
			case 4:
				mode = this.LSYSTEM_COLOUR_LINE;
				colours = {
							BR, BG, BB,
							0, 0, 0 };
				colours = c4;
				num_colours = 2;
				if (id === 4) { num_colours = 1 };
			break;
			case 5:
			case 6:
				mode = this.LSYSTEM_COLOUR_INLINE;
				colours = {
							BR, BG, BB,
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
							180, 0, 40 };
				num_colours = 9;
			break;
			case 7:
				mode = this.LSYSTEM_COLOUR_LINE;
				colours = {
							BR, BG, BB,
							240, 0, 0,
							205, 205, 0 };
				num_colours = 2;
				if (id == 4) { num_colours = 1; }
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
		ls2.productions = new Array(ls1.roductions.length);
		var i;
		for(i = 0; i < ls1.productions.length; ++i) {
			ls2.productions.push(ls1.productions[i]);
		}
	},

	_draw_colour : function(l, w, h, cm, colours, num_colours) {
		var data = new Array(w * h * 3);

		var background = [255, 255, 255];
		if (colours)
		{
			background[0] = colours.shift();
			background[1] = colours.shift();
			background[2] = colours.shift();
		}
		var i = 0;
		for (i = 0; i < w*h; i++)
		{
			d[i] = background[0];
			d[i + 1] = background[1];
			d[i + 2] = background[2];
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
		state.str = l.axiom;

		state.colour_mode = cm;
		state.colour_list = colours;
		state.ci = 0;
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
		if (state.colour_mode === this.LSYSTEM_COLOUR_DEPTH)
		{
			state.ci = state.depth*(state.num_colours/(state.lsys.depth + 1.0));
			state.colour[0] = state.colour_list[state.ci * 3 + 0];
			state.colour[1] = state.colour_list[state.ci * 3 + 1];
			state.colour[2] = state.colour_list[state.ci * 3 + 2];
		}

		var ci = 0;
		var c = state.str;
		var done = false;
		var negate = 1;
		while (ci < c.length && !done)
		{
			var angle = false;
			var search_i = null;

			//If haven't reach the maximum recursive depth
			if (state.depth < state.lsys.depth)
			{
				//see if this character has a substitution
				search_i = state.lsys.vars.indexOf(c[ci]);
				if (search_i != -1)
				{
					//replace current string with proposition
					char *temp = state.str;
					state.str = state.lsys.productions[search_i];

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
				case LSYSTEM_LINE :
					this._draw_line(state);
				break;
				case LSYSTEM_MOVE :
					var d = this._find_slope(state);
					state.x += d.dx;
					state.y += d.dy;
				break;
				case LSYSTEM_ROTATE_P :
					state.angle += state.lsys.angle*negate;
				break;
				case LSYSTEM_ROTATE_N :
					state.angle -= state.lsys.angle*negate;
				break;
				case LSYSTEM_SAVE:
					//copy current state
					var new_state this._copyLsystemState(state);
					new_state.str = c.substring(ci + 1);

					//call recursive
					this._draw_r(&new_state);

					//advance past save area
					var search_i = new_state.str.indexOf(this.LSYSTEM_RESTORE);
					if (search_i != -1) {
						ci = search_i;
					} else {
						console.log("Missing close of save state at: %i\n", ci);
					}
				break;
				case LSYSTEM_RESTORE :
					done = true;
				break;
				case LSYSTEM_ANGLE :
					angle = true;
				case LSYSTEM_SCALE :
					++ci;

					var numStr = "";
					while (/[\d.]/.test(c[ci])) {
						numStr += c[ci];
						++ci;
					}
					var amount = parseFloat(numStr);
					if (!isNaN(amount)) {
						if (angle)
							state.angle = amount;
						else
							state.len *= amount;
						//advance pointer to end of number
					} else {
						console.log("Invaild number at: %s\n", ci);
					}
				break;
				case LSYSTEM_REVERSE :
					negate *= -1;
				break;
				case LSYSTEM_COLOUR :
					if (state.colour_mode === this.LSYSTEM_COLOUR_INLINE) {
						state.ci = (state.ci + 1) % state.num_colours;
						state.colour[0] = state.colour_list[state.ci * 3];
						state.colour[1] = state.colour_list[state.ci * 3 + 1];
						state.colour[2] = state.colour_list[state.ci * 3 + 2];
					}
				break;
				case LSYSTEM_TOP :
					state.y = state.h - 1;
				break;
				case LSYSTEM_BOTTOM :
					state.y = 0;
				break;
				case LSYSTEM_LEFT :
					state.x = 0;
				break;
				case LSYSTEM_RIGHT :
					state.x = state.w - 1;
				break;
				case LSYSTEM_CENTER_H :
					state.x = state.w/2;
				break;
				case LSYSTEM_CENTER_V :
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
	},

	/** Finds the x and y component of the current line slope
	 *  @param state The lsystem
	 *  @return An object { dx, dy }
	 */
	_find_slope : function(state)
	{
		var dx = Math.round(state.len*Math.cos(state.angle*Math.PI/180.0));
		var dy = Math.round(state.len*Math.sin(state.angle*Math.PI/180.0));
		return { dx : dx, dy : dy };
	}

	/** Fills in a pixel
	 *  @param state The lsystem
	 */
	_draw_pixel : function(state)
	{
		if (state.x < state.w && state.y < state.h)
		{
			state.data[(state.y*state.w + state.x)*3] = state.colour[0];
			state.data[(state.y*state.w + state.x)*3 + 1] = state.colour[1];
			state.data[(state.y*state.w + state.x)*3 + 2] = state.colour[2];
		}
	},

	/** Draws a line
	 *  @param state The lsystem
	 */
	_draw_line : (state)
	{
		var slope = this._find_slope(state);
		var dx = slope.dx;
		var dy = slope.dy;

		//where the line is going
		var x1 = state.x + dx;
		var y1 = state.y + dy;

		//lope is greater than 1 move on y instead of x
		if (Math.abs(dy) > Math.abs(dx))
		{
			var temp = x1;
			x1 = y1;
			y1 = temp;

			var temp2 = dx;
			dx = dy;
			dy = temp2;
		}

		//deal with negative slopes
		var xstep;
		var ystep;
		if (dx > 0) xstep = 1; else xstep = -1;
		if (dy > 0) ystep = 1; else ystep = -1;
		dx = Math.abs(dx);
		dy = Math.abs(dy);

		//keep track of error
		var e = 0;
		var de = dy;

		if (state.colour_mode == LSYSTEM_COLOUR_LINE)
		{
			state.ci = (state.ci + 1) % state.num_colours;
			state.colour[0] = state.colour_list[state.ci * 3];
			state.colour[1] = state.colour_list[state.ci * 3 + 1];
			state.colour[2] = state.colour_list[state.ci * 3 + 2];
		}

		while (state.x != x1)
		{
			this._draw_pixel(state);
			state.x += xstep;

			e += de;
			if (e << 1 >= dx)
			{
				state.y += ystep;
				e -= dx;
			}
		}
		this._draw_pixel(state);
	}
};
