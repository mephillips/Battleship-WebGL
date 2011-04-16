/**
 * @fileOverview
 *
 * Contains rendering portion of the Battleship game.
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

/** The depth of grid blocks */
var BLOCK_DEPTH = 0.8;

/** Length of wide part of a peg */
var PEG_LEN_1 = BLOCK_DEPTH;
/** Length of the skinny part of a peg */
var PEG_LEN_2 = (BLOCK_DEPTH - 0.2);
/** Diameter of the wide part of a peg */
var PEG_DIAM_1 = 0.3;
/** Diameter of the skinny part of a peg */
var PEG_DIAM_2 = 0.15;

 /**
  * @namespace
  */
Battleship.View = {
	_canvas : null,
	_gl : null,

	_width : null,
	_height : null,

	_do_lines : false,

	init : function() {
		this._curr_menu = null;
		this._userTranslate = [ 0, 0, 0 ];
		this._userRotate = [ 0, 0, 0 ];
		this._gameTranslate = [ 0, 0, 0 ];
		this._gameRotate = [ 0, 0, 0 ];
	},

	/**
	 * Provides the graphics context and canvas to the view
	 *
	 * @param gl		A webgl graphics context
	 * @param canvas	A canvas DOM element
	 */
	set_context : function(gl, canvas) {
		this._gl = gl;
		this._canvas = canvas;
	},

	/** Gets the current size of the window
	 *
	 *  Used in some places by the game logic.
	 *
	 *  @return	An object { width, height }
	 */
	getsize : function() {
		return { width : this._canvas.width, height : this._canvas.height };
	},

	/** Translates the view
	 *
	 *  @param axis 0 = x, 1 = y, 2 = z
	 *  @param amount Amount to increase the translation by
	 *  @param type u = User translation, g = game translation
	 *  (captial U and G to increment instead of set)
	 */
	set_translate : function(axis, amount, type) {
		if (axis < 0 || axis > 2)
		{
			console.log("View.set_translate: Invalid axis %s.", axis);
			return;
		}

		switch (type)
		{
			case 'u' :
				if (this._curr_menu)
					this._menuTranslate[axis] = amount;
				else
					this._userTranslate[axis] = amount;
			break;
			case 'U' :
				if (this._curr_menu)
					this._menuTranslate[axis] += amount;
				else
					this._userTranslate[axis] += amount;
			break;
			case 'g' : this._gameTranslate[axis] = amount; break;
			case 'G' : this._gameTranslate[axis] += amount; break;
			default:
				console.log("View.set_translate: Unknow type %s.", type);
			break;
		}
	},

	/** Rotates the view
	 *
	 *  @param axis 0 = x, 1 = y, 2 = z
	 *  @param amount Amount to increase the rotation by
	 *  @param type u = User rotate, g = game rotate
	 *  (captial U and G to increment instead of set)
	 */
	set_rotate : function(axis, amount, type) {
		if (axis < 0 || axis > 2)
		{
			console.log("View.set_rotate: Invalid axis %s.", axis);
			return;
		}

		switch (type)
		{
			case 'u' :
				if (this._curr_menu)
					this._menuRotate[axis] = amount;
				else
					this._userRotate[axis] = amount;
			break;
			case 'U' :
				if (this._curr_menu)
					this._menuRotate[axis] += amount;
				else
					this._userRotate[axis] += amount;
			break;
			case 'g' : this._gameRotate[axis] = amount; break;
			case 'G' : this._gameRotate[axis] += amount; break;
			default:
				console.log("View.set_rotate: Unknow type %s.", type);
			break;
		}
	},

	set_perspective : function(gl) {
		if (this._canvas.width !== this._width && this._canvas.height !== this._height) {

			this._width = this._canvas.width;
			this._height = this._canvas.height;

			// Set the viewport and projection matrix for the scene
			gl.viewport(0, 0, this._width, this._height);
			gl.setPerspective(30, this._width/this._height, 30.0, 500);
		}

		gl.clearColor(0.0, 0.0, 0.4, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Lighting
		gl.uniform1i(gl.samplerUniform, 0);
		gl.uniform1i(gl.showSpecularHighlightsUniform, true);
		gl.uniform1i(gl.useTexturesUniform, false);
		gl.uniform1i(gl.useLightingUniform, true);
		gl.setAmbientColor(0.2, 0.2, 0.2);
		gl.setLightPositon(0.0, 10.0, 0.0);

		gl.identity();
		gl.translate(0, 0, -50);
	},

	draw : function() {
		var gl = this._gl;

		this.set_perspective(gl);

		// Translation
		if (!this._curr_menu)
		{
			//user rotation
			gl.rotate(this._userRotate[0], 0, 0);
			gl.rotate(0, this._userRotate[1], 0);
			gl.rotate(0, 0, this._userRotate[2]);
			gl.translate(
				this._userTranslate[0],
				this._userTranslate[1],
				this._userTranslate[2]);
		}

		// Draw axis
		if (this._do_lines) {
			this._drawLines(gl);
		}

		switch (Battleship.Model.get_test())
		{
			case Battleship.Model.TEST_PRIMITIVE:
				glprimitive.test(gl, 4.0, 15);
			break;
			case Battleship.Model.TEST_CLOCK:
				glprimitive.clock(gl, 8.0, 15);
			break;
			case Battleship.Model.TEST_MUG:
				glprimitive.mug(gl, 8.0, 15);
			break;
			case Battleship.Model.TEST_PEG:
				gl.setDiffuseColor( 1.0, 1.0, 1.0 );
				gl.setSpecularColor( 1.0, 1.0, 1.0 );
				gl.setMaterialShininess( 1.0 );
				gl.scale(4.0, 4.0, 4.0);
				this._drawPeg(gl);
			break;
			default:
				if (!this.__disk) {
					spiritTexture = gl.loadImageTexture("images/spirit.jpg");
					this.__disk = new GLObject('Spirit');
					glprimitive.disk(this.__disk, 10, 5);
					this.__disk.store(gl);
				}
				gl.uniform1i(gl.useTexturesUniform, true);
				gl.uniform1i(gl.useLightingUniform, false);
				gl.bindTexture(gl.TEXTURE_2D, spiritTexture);
				gl.draw(this.__disk);
				gl.bindTexture(gl.TEXTURE_2D, null);
			break;
		}
	},

	_drawLines : function(gl) {
		if (!this._lines) {
			var o = new GLObject('lines');
			o.begin(GLObject.GL_LINES);
			o.vertex(0.0, 50.0, 0.0);
			o.vertex(0.0, -50.0, 0.0);
			o.vertex(-50.0, 0.0, 0.0);
			o.vertex(50, 0.0, 0.0);
			o.vertex(0.0, 0.0, 50.0);
			o.vertex(0.0, 0.0, -50.0);
			o.end();
			this._lines = o;
		}
		gl.setDiffuseColor( 1.0, 1.0, 1.0 );
		gl.setSpecularColor( 1.0, 1.0, 1.0 );
		gl.setMaterialShininess( 1.0 );
		gl.draw(this._lines);
	},

	_drawPeg : function(gl) {
		if (!this._peg) {
			var o = new GLObject('peg');
			glprimitive.cylinder(o, PEG_DIAM_2, PEG_LEN_2);
			o.translate(0.0, 0.0, PEG_LEN_2);
			glprimitive.cylinder(o, PEG_DIAM_1, PEG_LEN_1);
			o.translate(0.0, 0.0, PEG_LEN_1);
			glprimitive.disk(o, PEG_DIAM_1);
			o.translate(0.0, 0.0, -PEG_LEN_1);
			o.rotate(0.0, 180.0, 0.0);
			glprimitive.disk(o, PEG_DIAM_1);
			o.translate(0.0, 0.0, PEG_LEN_2);
			glprimitive.disk(o, PEG_DIAM_2);
			this._peg = o;
		}
		gl.draw(this._peg);
	}
};
