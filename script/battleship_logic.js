/*
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
/**
 * @fileOverview
 *
 * Contains the logic portion of the Battleship game.
 */
 /**
  * @namespace
  */
Battleship.Logic = {
	BATTLESHIP_MOUSE_LEFT : 1,
	BATTLESHIP_MOUSE_MIDDLE : 2,
	BATTLESHIP_MOUSE_RIGHT : 4,

	enum_key : {
		QUIT : 'quit',
		RESET : 'reset',
		LEFT : 'left',
		RIGHT : 'right',
		DOWN : 'down',
		UP : 'up',
		ROTATE : 'rotate',
		ENTER : 'enter',
		ESC : 'esc',
		BACKSPACE : 'backspace',
		X : 'x',
		Y : 'y',
		Z : 'z'
	},

	init : function() {
		Battleship.Model.init();
		Battleship.View.init();
		Battleship.Menu.init();

		this._mouse_x = 0;
		this._mouse_y = 0;
		this._mouse_mod = {
			alt : false,
			ctrl : false,
			shift : false,
			meta : false };
		this._mouse_button = 0;

		Battleship.Menu.load(Battleship.Menu.main_menu);
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
		if (this._mouse_mod.alt) {
			var tdiffx = diffx * 15.0;
			var tdiffy = diffy * 15.0;
			if (this._mouse_button & this.BATTLESHIP_MOUSE_LEFT) {
				Battleship.View.set_translate(0, tdiffx, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_MIDDLE) {
				Battleship.View.set_translate(1, -tdiffy, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_RIGHT) {
				Battleship.View.set_translate(2, tdiffy, 'U');
			}
			needRefresh = true;
		}
		if (this._mouse_mod.ctrl) {
			var rdiffx = diffx * 360;
			var rdiffy = diffy * 360;
			if (this._mouse_button & this.BATTLESHIP_MOUSE_LEFT) {
				Battleship.View.set_rotate(1, rdiffx, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_MIDDLE) {
				Battleship.View.set_rotate(0, rdiffy, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_RIGHT) {
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
		var needRefresh = this._handleGlobalKeypress(key, mod);
		if (!needRefresh) {
			if (Battleship.Menu.curr_menu) {
				needRefresh = Battleship.Menu.keypress(key, mod);
			} else {
				needRefresh = this._handleGameKeypress(key, mod);
			}
		}
		if (needRefresh) {
			Battleship.View.refresh();
		}
		return needRefresh;
	},

	_handleGlobalKeypress : function(key, mod) {
		var needRefresh = false;
		var size = Battleship.View.getsize();
		var rdiff = 10/size.width * 360;
		if (mod.shift) { rdiff *= -1; }
		switch (key) {
			case this.enum_key.QUIT:
				Battleship.Logic.quit();
				needRefresh = true;
			break;
			case this.enum_key.RESET:
				Battleship.View.set_rotate(0, 0, 'u');
				Battleship.View.set_rotate(1, 0, 'u');
				Battleship.View.set_rotate(2, 0, 'u');
				Battleship.View.set_translate(0, 0, 'u');
				Battleship.View.set_translate(1, 0, 'u');
				Battleship.View.set_translate(2, 0, 'u');
				needRefresh = true;
			break;
			case this.enum_key.X:
				if (mod.alt) {
					Battleship.View.set_translate(0, rdiff, 'U');
					needRefresh = true;
				} else if (mod.ctrl) {
					Battleship.View.set_rotate(0, rdiff, 'U');
					needRefresh = true;
				}
			break;
			case this.enum_key.Y:
				if (mod.alt) {
					Battleship.View.set_translate(1, rdiff, 'U');
					needRefresh = true;
				} else if (mod.ctrl) {
					Battleship.View.set_rotate(1, rdiff, 'U');
					needRefresh = true;
				}
			break;
			case this.enum_key.Z:
				if (mod.alt) {
					Battleship.View.set_translate(2, -rdiff, 'U');
					needRefresh = true;
				} else if (mod.ctrl) {
					Battleship.View.set_rotate(2, -rdiff, 'U');
					needRefresh = true;
				}
			break;
		}
		return needRefresh;
	},

	_handleGameKeypress : function(key, mod) {
		return false;
	}
};
