/**
 * @fileOverview
 *
 * Contains data portion of the Battleship game.
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
 */

/** The width/height of the playing grid */
var GRID_DIM = 10;

/**
 * @namespace
 */
Battleship.Model = {
	NUM_TEST_TYPES : 10,
	TEST_NONE : "None",
	TEST_PRIMITIVE : "Primitive",
	TEST_CLOCK : "Clock",
	TEST_MUG : "Mug",
	TEST_PEG : "Peg",
	TEST_SHIPS : "Ships",
	TEST_FONT : "Font",
	TEST_FOG : "Fog",
	TEST_LSYSTEM : "Lsystem",
	TEST_ROCKET : "Rocket",

	NUM_SHIPS : 5,
	SHIP_CARRIER : 0,
	SHIP_BATTLESHIP : 1,
	SHIP_DESTROYER : 2,
	SHIP_SUB : 3,
	SHIP_PT : 4,
	SHIP_NO_SHIP : 5,

	MAX_SHIP_LEN : 5,

	NUM_FOG_TYPES : 4,
	FOG_OFF : 0,
	FOG_LIGHT : 1,
	FOG_MEDIUM : 2,
	FOG_HEAVY : 3,
	FOG_REGEN : 4,

	/** @private Used to enabled renering tests */
	_do_test : null,
	/** @private Debug value used to draw axis */
	do_lines : false,
	/** @private Used to disable/enable textrues */
	do_textures : true,
	/** @private Used to disable/enable fog */
	do_fog : 1,
	/** @private Used to disable/enable lystems */
	do_lsystem : true,

	game_lsys : { type : 3, length : 5 },

	init : function() {
		this.do_test = 0;
		this.do_lines = false;
		this.do_textures = true;
		this.do_fog = 1;
		this.do_lsystem = true;
	}
};
