/**
 * @fileOverview
 *
 * Contains main initilization logic and user input logic.
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

/**
 * @namespace
 */
Battleship = {
	_canvas : null,
	_gl : null,
	_timers : {},

	main : function() {
		var canvas = document.getElementById('battleship');
		var gl = webgl_ext.initWebGL(canvas, 'script/vshader.vs', 'script/fshader.fs' );
		if (!gl) { return; }

		this._canvas = canvas;
		this._gl = gl;

		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		// Set up input event listeners
		canvas.onmouseup = this._mouseup.bind(this);
		canvas.onmousedown = this._mousedown.bind(this);
		canvas.onmousemove = this._motion.bind(this);
		window.onkeydown = this._keypress.bind(this);

		// Setup implementation specific methods
		Battleship.View.refresh = this._view_refresh.bind(this);
		Battleship.Logic.start_timer = this._start_timer.bind(this);
		Battleship.Logic.stop_timers = this._stop_timers.bind(this);

		Battleship.Logic.init();

		// Game parameters
		var do_test = this._getQueryArg('do_test', 'None');
		Battleship.Model.do_test = do_test;
		var do_lines = (this._getQueryArg('do_lines', 'false') === 'true');
		Battleship.View._do_lines = do_lines;

		this._draw();
	},

	/** Foreces redraw (implementation dependent)
	 *
	 *  This function should be implement in the main file corrispoding
	 *  to a particualr gui frontend.
	 *
	 *  This fuction causes the window to redraw.
	 *
	 */
	_view_refresh : function() {
		window.requestAnimFrame(this._draw.bind(this), this._canvas);
	},

	/** Start a timer (implementation dependent)
	 *
	 *  This function should be implement in the main file corrispoding
	 *  to a particualr gui frontend.
	 *
	 *  The function should start a timer. The timer will call the
	 *  given function every delay ms until the function returns false.
	 *
	 *  @param delay How often to call the timer
	 *  @param func The function to call
	 */
	_start_timer : function(delay, func) {
		var id = window.setInterval(function() {
			var success = false;
			try {
				success = func();
			} catch (e) {
				console.log('Exception during timer callback:', e);
			}
			if (!success) {
				window.clearInterval(id);
				delete this._timers[id];
			}
		}.bind(this), delay);
		this._timers[id] = id;
	},

	/** Stops all timers (implementation dependent)
	 *
	 *  This function should be implement in the main file corrispoding
	 *  to a particualr gui frontend.
	 *
	 *  The function should stop all current timers. As quickly as possible.
	 *
	 */
	_stop_timers : function() {
		for (var key in this._timers) {
			if (this._timers.hasOwnProperty(key)) {
				window.clearInterval(key);
			}
		}
	},

	/**
	 * Render a single frame
	 */
	_draw : function() {
		Battleship.View.draw(this._gl, this._canvas.width, this._canvas.height);
	},

	_mouseup : function(evt) {
		this._mouse(true, evt);
		return false;
	},

	_mousedown : function(evt) {
		this._mouse(false, evt);
		return false;
	},

	_mouse : function(up, evt) {
		evt = evt || window.event;
		var button = evt.which;
		var mods = {
			alt : evt.altKey,
			ctrl : evt.ctrlKey,
			shift : evt.shiftKey,
			meta : evt.metaKey
		};
		var x = evt.clientX;
		var y = evt.clientY;
		if (up) {
			Battleship.Logic.mouse_up(button, mods, x, y);
		} else {
			Battleship.Logic.mouse_down(button, mods, x, y);
		}
	},

	_motion : function(evt) {
		evt = evt || window.event;
		Battleship.Logic.mouse_move(evt.clientX, evt.clientY);
	},

	_keypress : function(evt) {
		evt = evt || window.event;
		var mods = {
			alt : evt.altKey,
			ctrl : evt.ctrlKey,
			shift : evt.shiftKey,
			meta : evt.metaKey
		};
		var key = this._mapKey(evt.which || evt.keyCode);
		// Cancel this event if we have handled the key
		return !Battleship.Logic.keypress(key, mods);
	},

	_mapKey : function(key) {
		switch (key) {
			case 81: key = Battleship.Logic.enum_key.QUIT; break;
			case 114: key = Battleship.Logic.enum_key.RESET; break;
			case 38: key = Battleship.Logic.enum_key.UP; break;
			case 40: key = Battleship.Logic.enum_key.DOWN; break;
			case 37: key = Battleship.Logic.enum_key.LEFT; break;
			case 39: key = Battleship.Logic.enum_key.RIGHT; break;
			case 102: key = Battleship.Logic.enum_key.ROTATE; break;
			case 13: key = Battleship.Logic.enum_key.ENTER; break;
			case 27: key = Battleship.Logic.enum_key.ESC; break;
			case 8: key = Battleship.Logic.enum_key.BACKSPACE; break;
			case 88: key = Battleship.Logic.enum_key.X; break;
			case 70: key = Battleship.Logic.enum_key.Y; break;
			case 90: key = Battleship.Logic.enum_key.Z; break;
			default: key = String.fromCharCode(key); break;
		}
		return key;
	},

	_getQueryArg : function(key, def) {
		var value;

		var regex = new RegExp(key + '=([^&]*)');
		var match = regex.exec(window.location.search);
		if (match) {
			value = unescape(match[1]);
		} else {
			value = def;
		}

		return value;
	}
};
