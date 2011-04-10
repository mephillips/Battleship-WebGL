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

	init : function() {
		this._do_test = 0;
	},

	/**
	 * Enable drawing test mode and draws the given test
	 *
	 * @param test	The test to draw
	 */
	set_test : function(test) { this._do_test = test; },

	/**
	 * Checks whether a drawing test is active.
	 * @return	The active drawing test.
	 */
	get_test : function() { return this._do_test; },
};
