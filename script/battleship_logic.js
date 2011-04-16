/**
 * @fileOverview
 *
 * Contains the logic portion of the Battleship game.
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
Battleship.Logic = {
	BATTLESHIP_MOUSE_LEFT : 1,
	BATTLESHIP_MOUSE_MIDDLE : 2,
	BATTLESHIP_MOUSE_RIGHT : 4,

	init : function() {
		Battleship.View.init();

		this._mouse_x = 0;
		this._mouse_y = 0;
		this._mouse_mod = {
			alt : false,
			ctrl : false,
			shift : false,
			meta : false };
		this._mouse_button = 0;
	},

	/** Handles mouse button releases.
	 *
	 *  This function should be called from the main file corrisponding to
	 *  a particular gui frontend.
	 *
	 *  This function should be called whenever a mouse button is released.
	 *
 	 *  @param button	The button which was released. This value should
	 *					corrispond to one of the BATTLESHIP_MOUSE_* values.
	 *  @param mod		What modifiers are were pressed. An object
	 *					{ shift : bool, ctrl : bool, alt : bool, meta : bool }
	 *  @param x		The x coordinate of the mouse event.
	 *  @param y		The y coordinate of the mouse event.
	 */
	mouse_up : function(button, mod, x, y) {
		this._mouse_button ^= (1 << (button - 1));
		this._mouse_mod = mod;
	},

	/** Handles mouse button presses.
	 *
	 *  This function should be called from the main file corrisponding to
	 *  a particular gui frontend.
	 *
	 *  This function should be called whenever a mouse button is pressed.
	 *
	 *  @param button	The button which was released. An object
	 *					{ left : bool, right : bool, middle : bool }
	 *  @param mod		What modifiers are were pressed. An object
	 *					{ shift : bool, ctrl : bool, alt : bool, meta : bool }
	 *  @param x		The x coordinate of the mouse event.
	 *  @param y		The y coordinate of the mouse event.
	 */
	mouse_down : function(button, mod, x, y) {
		this._mouse_button |= (1 << (button - 1));
		this._mouse_mod = mod;
		this._mouse_x = x;
		this._mouse_y = y;
	},

	/** Handles mouse movement.
	 *
	 *  This function should be called from the main file corrisponding to
	 *  a particular gui frontend.
	 *
	 *  This function should be called whenever the mouse moves inside the
	 *  window.
	 *
	 *  @param x The x coordinate of the mouse motion
	 *  @param y The y coordinate of the mouse motion
	 */
	mouse_move : function(x, y) {
		var size = Battleship.View.getsize();
		var diffx = (x - this._mouse_x) / size.width;
		var diffy = (y - this._mouse_y) / size.height;

		var needRefresh = false;
		if (this._mouse_mod.shift)
		{
			var tdiffx = diffx * 15.0;
			var tdiffy = diffy * 15.0;
			if (this._mouse_button & this.BATTLESHIP_MOUSE_LEFT)
			{
				Battleship.View.set_translate(0, tdiffx, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_MIDDLE)
			{
				Battleship.View.set_translate(1, -tdiffy, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_RIGHT)
			{
				Battleship.View.set_translate(2, tdiffy, 'U');
			}
			needRefresh = true;
		}
		if (this._mouse_mod.ctrl)
		{
			var rdiffx = diffx * 360;
			var rdiffy = diffy * 360;
			if (this._mouse_button & this.BATTLESHIP_MOUSE_LEFT)
			{
				Battleship.View.set_rotate(1, rdiffx, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_MIDDLE)
			{
				Battleship.View.set_rotate(0, rdiffy, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_RIGHT)
			{
				Battleship.View.set_rotate(2, -rdiffx, 'U');
			}
			needRefresh = true;
		}

		this._mouse_x = x;
		this._mouse_y = y;

		if (needRefresh) {
			Battleship.View.refresh();
		}
	},

	keypress : function(key, mod) {
		var needRefresh = false;

		var size = Battleship.View.getsize();
		var rdiff = 10/size.width * 360;
		switch (key) {
			case 'r':
				Battleship.View.set_rotate(0, 0, 'u');
				Battleship.View.set_rotate(1, 0, 'u');
				Battleship.View.set_rotate(2, 0, 'u');
				Battleship.View.set_translate(0, 0, 'u');
				Battleship.View.set_translate(1, 0, 'u');
				Battleship.View.set_translate(2, 0, 'u');
			break;
			case 'x':
				if (mod.ctrl) {
					Battleship.View.set_translate(0, rdiff, 'U');
				} else {
					Battleship.View.set_rotate(0, rdiff, 'U');
				}
				needRefresh = true;
			break;
			case 'y':
				if (mod.ctrl) {
					Battleship.View.set_translate(1, rdiff, 'U');
				} else {
					Battleship.View.set_rotate(1, rdiff, 'U');
				}
				needRefresh = true;
			break;
			case 'z':
				if (mod.ctrl) {
					Battleship.View.set_translate(2, -rdiff, 'U');
				} else {
					Battleship.View.set_rotate(2, -rdiff, 'U');
				}
				needRefresh = true;
			break;
			case 'X':
				if (mod.ctrl) {
					Battleship.View.set_translate(0, -rdiff, 'U');
				} else {
					Battleship.View.set_rotate(0, -rdiff, 'U');
				}
				needRefresh = true;
			break;
			case 'Y':
				if (mod.ctrl) {
					Battleship.View.set_translate(1, -rdiff, 'U');
				} else {
					Battleship.View.set_rotate(1, -rdiff, 'U');
				}
				needRefresh = true;
			break;
			case 'Z':
				if (mod.ctrl) {
					Battleship.View.set_translate(2, rdiff, 'U');
				} else {
					Battleship.View.set_rotate(2, rdiff, 'U');
				}
				needRefresh = true;
			break;
		}

		if (needRefresh) {
			Battleship.View.refresh();
		}
	}
};
