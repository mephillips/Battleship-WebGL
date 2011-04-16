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
	 *
	 */
	initWebGL : function(canvas, vshaderUrl, fshaderUrl) {
		var gl = WebGLUtils.setupWebGL(canvas);
		if (!gl) {
			console.log('initWebGL failed');
			return null;
		}

		var program = this._loadShadersUrl(gl, vshaderUrl, fshaderUrl);
		if (!program) {
			return null;
		}
		this._loadShaderParameters(gl, program);
		gl.program = program;

		// Create modle matrices
		gl.mvMatrix = new J3DIMatrix4();
		gl.mvChanged = true;
		gl.perspectiveMatrix = new J3DIMatrix4();
		gl.mvStack = [];

		// Add methods
		gl.loadImageTexture = this.loadImageTexture;
		gl.setMatrixUniforms = this.setMatrixUniforms;
		gl.setPerspective = this.setPerspective;
		gl.identity = this.identity;
		gl.translate = this.translate;
		gl.rotate = this.rotate;
		gl.scale = this.scale;
		gl.pushMatrix = this.pushMatrix;
		gl.popMatrix = this.popMatrix;
		gl.draw = this.draw;
		gl.setLightPositon = this.setLightPositon;
		gl.setAmbientColor = this.setAmbientColor;
		gl.setDiffuseColor = this.setDiffuseColor;
		gl.setSpecularColor = this.setSpecularColor;
		gl.setMaterialShininess = this.setMaterialShininess;

		return gl;
	},

	/**
	 * Set the perspective matrix.
	 */
	setPerspective : function(fovy, aspect, zNear, zFar) {
		this.perspectiveMatrix.perspective(fovy, aspect, zNear, zFar);
		//this.perspectiveMatrix.lookat(0, 0, 7, 0, 0, 0, 0, 1, 0);
		this.perspectiveMatrix.setUniform(this, this.pMatrixUniform, false);
	},

	/**
	 * Push the current model view matrix onto the stack for reuse later
	 */
	pushMatrix : function() {
		this.mvStack.push(new J3DIMatrix4(this.mvMatrix));
	},

	/**
	 * Restore a previous pushed modle view matrix
	 */
	popMatrix : function() {
		if (this.mvStack.length > 0) {
			this.mvMatrix.load(this.mvStack.pop());
			this.mvChanged = true;
		}
	},

	/**
	 * Restore the model view matrix to the identity
	 */
	identity : function() {
		this.mvMatrix.makeIdentity();
		this.mvChanged = true;
	},

	/**
	 * Translate the model view matrix
	 */
	translate : function(x, y, z) {
		this.mvMatrix.translate(x, y, z);
		this.mvChanged = true;
	},

	/**
	 * Rotate the model view matrix
	 */
	rotate : function(x, y, z) {
		this.mvMatrix.rotate(x, y, z);
		this.mvChanged = true;
	},

	/**
	 * Scale the model view matrix
	 */
	scale : function(x, y, z) {
		this.mvMatrix.scale(x, y, z);
		this.mvChanged = true;
	},

	/**
	 *	Update shader program with current modle view matrix.
	 */
	setMatrixUniforms : function() {
		if (this.mvChanged) {
			this.mvMatrix.setUniform(this, this.mvMatrixUniform, false);

			var normalMatrix4 = new J3DIMatrix4(this.mvMatrix);
			normalMatrix4.invert();
			normalMatrix4.transpose();
			var a = normalMatrix4.getAsArray();
			var normalMatrix3 = [
				a[0], a[1], a[2],
				a[4], a[5], a[6],
				a[8], a[9], a[10]
			];
			this.uniformMatrix3fv(this.nMatrixUniform, false, new Float32Array(normalMatrix3));

			this.mvChanged = false;
		}
	},

	/**
	 * Draw the given globject
	 */
	draw : function(globject) {
		this.setMatrixUniforms();
		globject.draw(this);
	},

	setLightPositon : function(x, y, z) {
		var v = webgl_ext._3fto3v(x, y, z);
		this.uniform3fv(this.pointLightingLocationUniform, v);
	},
	setAmbientColor : function(x, y, z) {
		var v = webgl_ext._3fto3v(x, y, z);
		this.uniform3fv(this.ambientColorUniform, v);
	},
	setDiffuseColor : function(x, y, z) {
		var v = webgl_ext._3fto3v(x, y, z);
		this.uniform3fv(this.pointLightingDiffuseColorUniform, v);
	},
	setSpecularColor : function(x, y, z) {
		var v = webgl_ext._3fto3v(x, y, z);
		this.uniform3fv(this.pointLightingSpecularColorUniform, v);
	},
	setMaterialShininess : function(s) {
		this.uniform1f(this.materialShininessUniform, s);
	},

	/**
	 * Create a new WebGLTexture using the image at the given url.
	 *
	 * @param url	URL to a source image.
	 */
	loadImageTexture : function(url) {
		var texture = this.createTexture();
		var image = new Image();
		image.texture = texture;
		image.gl = this;
		image.onload = webgl_ext._loadImageTexture;
		image.src = url;
		return texture;
	},

	/**
	 * This function will be called with an image as the context
	 *
	 * @private
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
	 * Load the vertex and fragment shader scripts
	 *
	 * @param gl			A webgl context
	 * @param vshasderUrl	Url to vshader script
	 * @param fshasderUrl	Url to fshader script
	 *
	 * @private
	 */
	_loadShadersUrl : function(gl, vshaderUrl, fshaderUrl) {
		// create our shaders
		var vertexShader = this._loadShaderUrl(gl, gl.VERTEX_SHADER, vshaderUrl);
		var fragmentShader = this._loadShaderUrl(gl, gl.FRAGMENT_SHADER, fshaderUrl);
		if (!vertexShader || !fragmentShader) {
			console.log('One or more shaders failed to load');
			return null;
		}

		// Create the program object
		var program = gl.createProgram();
		if (!program) {
			console.log('Failed to create program');
			return null;
		}

		// Attach our two shaders to the program
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);

		// Link the program
		gl.linkProgram(program);

		// Check the link status
		var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!linked) {
			// something went wrong with the link
			var error = gl.getProgramInfoLog(program);
			console.log('Error in program linking: ', error);

			gl.deleteProgram(program);
			gl.deleteProgram(fragmentShader);
			gl.deleteProgram(vertexShader);

			return null;
		}

		gl.useProgram(program);

		return program;
	},

	/**
	 * Get references to all of the shader parameters and store them for later
	 * use.
	 *
	 * @private
	 */
	_loadShaderParameters : function(gl, program) {
		gl.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
		gl.enableVertexAttribArray(gl.vertexPositionAttribute);

		gl.vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
		gl.enableVertexAttribArray(gl.vertexNormalAttribute);

		gl.textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
		gl.enableVertexAttribArray(gl.textureCoordAttribute);


		gl.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
		gl.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
		gl.nMatrixUniform = gl.getUniformLocation(program, "uNMatrix");
		gl.samplerUniform = gl.getUniformLocation(program, "uSampler");
		gl.materialShininessUniform = gl.getUniformLocation(program, "uMaterialShininess");
		gl.showSpecularHighlightsUniform = gl.getUniformLocation(program, "uShowSpecularHighlights");
		gl.useTexturesUniform = gl.getUniformLocation(program, "uUseTextures");
		gl.useLightingUniform = gl.getUniformLocation(program, "uUseLighting");
		gl.ambientColorUniform = gl.getUniformLocation(program, "uAmbientColor");
		gl.pointLightingLocationUniform = gl.getUniformLocation(program, "uPointLightingLocation");
		gl.pointLightingSpecularColorUniform = gl.getUniformLocation(program, "uPointLightingSpecularColor");
		gl.pointLightingDiffuseColorUniform = gl.getUniformLocation(program, "uPointLightingDiffuseColor");
	},

	/**
	 * Load a shader with the given type using the soucre at the given url
	 *
	 * @param gl			The webgl graphics context.
	 * @param shaderType	The webgl shadder type (ex gl.VERTEX_SHADER).
	 * @param url			The url to the shader script.
	 *
	 * @private
	 */
	_loadShaderUrl : function(gl, shaderType, url)
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
	},

	/**
	 * Takes the given parameters which may be:
	 * 	array, undefined, undefiend or
	 * 	x, y, z
	 * And generates an array [x, y, z]
	 */
	_3fto3v : function(x, y, z) {
		if (x && x.length && x.length === 3) {
			return x;
		} else {
			return [x, y, z];
		}
	}
};
