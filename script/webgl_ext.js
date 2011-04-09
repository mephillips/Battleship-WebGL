/**
 * @fileOverview
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

/**
 * @namespace
 */
webgl_ext = {
	/**
	 * Initilze the webgl context and shapers.
	 *
	 * @param canvas		A dom element represeting the canvas to initilize.
	 * @param vshaderUrl	Url to the vertex shader script.
	 * @param fshaderUrl	Url to the fragment shader script.
	 * @param attributes	An array of shader attributes to bind
	 *
	 * Based off the one found at:
	 * https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/demos/webkit/SpiritBox.html
	 *
	 */
	initWebGL : function(canvas, vshaderUrl, fshaderUrl, attributes) {
		var gl = WebGLUtils.setupWebGL(canvas);
		if (!gl) {
			console.log('setupWebGL failed');
			return null;
		}

		// create our shaders
		var vertexShader = this._loadShader(gl, gl.VERTEX_SHADER, vshaderUrl);
		var fragmentShader = this._loadShader(gl, gl.FRAGMENT_SHADER, fshaderUrl);
		if (!vertexShader || !fragmentShader) {
			console.log('One or more shaders failed to load');
			return null;
		}

		// Create the program object
		gl.program = gl.createProgram();
		if (!gl.program) {
			console.log('Failed to create program');
			return null;
		}

		// Attach our two shaders to the program
		gl.attachShader(gl.program, vertexShader);
		gl.attachShader(gl.program, fragmentShader);

		// Bind attributes
		var i;
		for (i = 0; i < attributes.length; ++i) {
			gl.bindAttribLocation(gl.program, i, attributes[i]);
		}

		// Link the program
		gl.linkProgram(gl.program);

		// Check the link status
		var linked = gl.getProgramParameter(gl.program, gl.LINK_STATUS);
		if (!linked) {
			// something went wrong with the link
			var error = gl.getProgramInfoLog(gl.program);
			console.log('Error in program linking: ', error);

			gl.deleteProgram(gl.program);
			gl.deleteProgram(fragmentShader);
			gl.deleteProgram(vertexShader);

			return null;
		}

		gl.useProgram(gl.program);

		return gl;
	},

	/**
	 * Add helper methods to the given webgl context 
	 */
	extend : function(gl) {
		// Create modle matrices
		gl.mvMatrix = new J3DIMatrix4();
		gl.u_normalMatrixLoc = gl.getUniformLocation(gl.program, "u_normalMatrix");

		gl.normalMatrix = new J3DIMatrix4();
		gl.u_modelViewProjMatrixLoc = gl.getUniformLocation(gl.program, "u_modelViewProjMatrix");

		gl.mvpMatrix = new J3DIMatrix4();
		gl.perspectiveMatrix = new J3DIMatrix4();

		// Add methods
		gl.loadImageTexture = function(url) { return webgl_ext.loadImageTexture(this, url); };
		gl.setMatrixUniforms = function(url) { return webgl_ext.setMatrixUniforms(this); };
	},

	/** 
	 * I don't quite get this yet
	 */
	setMatrixUniforms : function(gl) {
		// Construct the normal matrix from the model-view matrix and pass it in
		gl.normalMatrix.load(gl.mvMatrix);
		gl.normalMatrix.invert();
		gl.normalMatrix.transpose();
		gl.normalMatrix.setUniform(gl, gl.u_normalMatrixLoc, false);

		// Construct the model-view * projection matrix and pass it in
		gl.mvpMatrix.load(gl.perspectiveMatrix);
		gl.mvpMatrix.multiply(gl.mvMatrix);
		gl.mvpMatrix.setUniform(gl, gl.u_modelViewProjMatrixLoc, false);
	},

	/**
	 * Create a new WebGLTexture using the image at the given url.
	 * 
	 * @param gl	The webgl context.
	 * @param url	URL to a source image.
	 */
	loadImageTexture : function(gl, url) {
		var texture = gl.createTexture();
		var image = new Image();
		image.texture = texture;
		image.gl = gl;
		image.onload = this._loadImageTexture;
		image.src = url;
		return texture;
	},

	/**
	 * @private
	 *
	 * This function will be called with an image as the context
	 */
	_loadImageTexture : function() {
		try {
			var gl = this.gl;
			var texture = this.texture;
			var image = this;

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.bindTexture(gl.TEXTURE_2D, null);
		} catch (e) {
			console.log('webgl_ext', e);
		}
	},

	/**
	 * @private
	 *
	 * Load a shader with the given type using the soucre at the given url
	 *
	 * @param gl			The webgl graphics context.
	 * @param shaderType	The webgl shadder type (ex gl.VERTEX_SHADER).
	 * @param url			The url to the shader script.
	 */
	_loadShader : function(gl, shaderType, url)
	{
		var shader = null;

		var request = new XMLHttpRequest();
		request.open('GET', url, false);
		request.onreadystatechange = function() {
			try {
				if (request.readyState === 4) {
					shader = gl.createShader(shaderType);
					if (shader == null) {
						console.log('Failed to create shader: ', shaderType);
						shader = null;
					}
					gl.shaderSource(shader, request.responseText);
					gl.compileShader(shader);

					// Check the compile status
					var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
					if (!compiled) {
						var error = gl.getShaderInfoLog(shader);
						console.log('Failed to compile shader ', shaderType);
						gl.deleteShader(shader);
						shader = null;
					}
				}
			} catch (e) {
				console.log('Failed to fetch loader script: ', e);
			}
		}
		request.send();

		return shader;
	}
}
