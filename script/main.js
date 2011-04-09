/**
 * @fileOverview
 *
 * Contains main initilization logic and user input logic.
 *
 * Provides helper methods related to webgl. Most methods can be used on their
 * own or as extension methods on the webgl context.
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

function _getQueryArg(key, def) {
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

function main() {
    var canvas = document.getElementById('battleship');
	var gl = webgl_ext.initWebGL(
		canvas,
		'script/vshader.vs',
		'script/fshader.fs',
		[ 'vNormal', 'vColor', 'vPosition'] );
	if (gl) {
		webgl_ext.extend(gl);

		gl.clearColor(0, 0, 0.5, 1);
		gl.clearDepth(10009);

		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.enable(gl.TEXTURE_2D);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		// Enable all of the vertex attribute arrays.
		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(2);

		Battleship.init(gl, canvas);

		var animateLoop = function() {
			try {
				Battleship.draw();
				window.requestAnimFrame(animateLoop, canvas);
			} catch (e) {
				console.log('animateLoop', e);
			}
		}
		animateLoop();
	}
}
