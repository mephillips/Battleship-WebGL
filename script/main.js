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
	View : {},
	Logic : {},

	mouseup : function(evt) { this.mouse(true, evt); },

	mousedown : function(evt) { this.mouse(false, evt); },

	mouse : function(up, evt) {
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

	motion : function(evt) {
		evt = evt || window.event;
		Battleship.Logic.mouse_move(evt.clientX, evt.clientY);
	},

	/** Foreces redraw (implementation dependent)
	 *
	 *  This function should be implement in the main file corrispoding
	 *  to a particualr gui frontend.
	 *
	 *  This fuction causes the window to redraw.
	 *
	 */
	view_refresh : function() {
	},

	main : function() {
		var canvas = document.getElementById('battleship');
		var gl = webgl_ext.initWebGL(canvas, 'script/vshader.vs', 'script/fshader.fs' );
		if (!gl) { return; }

		gl.clearDepth(10000);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		//gl.enable(gl.TEXTURE_2D);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		// Enable the vertex attribute arrays that will be used throughout
		// the app
		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(2);

		// Set up input event listeners
		canvas.onmouseup = this.mouseup.bind(this);
		canvas.onmousedown = this.mousedown.bind(this);
		canvas.onmousemove = this.motion.bind(this);

		// Setup implementation specific methods
		Battleship.View.refresh = this.view_refresh;
		Battleship.View.set_context(gl, canvas);

		// Game parameters
		var do_test = parseInt(this._getQueryArg('do_test', '0'), 10) || 0;
		Battleship.Model.set_test(do_test);
		var do_lines = (this._getQueryArg('do_lines', 'false') === 'true');
		Battleship.View._do_lines = do_lines;

		Battleship.Logic.init();

		var animateLoop = function() {
			try {
				Battleship.View.draw();
				window.requestAnimFrame(animateLoop, canvas);
			} catch (e) {
				console.log('animateLoop', e);
			}
		}
		animateLoop();
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
