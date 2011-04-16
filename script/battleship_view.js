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
/** The heigh/width of grid blocks */
var BLOCK_DIM = 0.9;
/** Grid blocks are drawn with some space around them, this value is how
 *  height/wide they are including that space.
 */
var BLOCK_REAL_DIM = 1.0;

/** Length of wide part of a peg */
var PEG_LEN_1 = BLOCK_DEPTH;
/** Length of the skinny part of a peg */
var PEG_LEN_2 = (BLOCK_DEPTH - 0.2);
/** Diameter of the wide part of a peg */
var PEG_DIAM_1 = 0.3;
/** Diameter of the skinny part of a peg */
var PEG_DIAM_2 = 0.15;

/** The height of a ships Hull */
var SHIP_HULL_HEIGHT = 0.4;
/** The diameter of the ships hull */
var SHIP_HULL_DIAM = 0.15;
/** The height of a ships deck */
var SHIP_DECK_HEIGHT = 0.2;

 /**
  * @namespace
  */
Battleship.View = {
	/** @private A reference to the Canvas DOM element. */
	_canvas : null,
	/** @private The WegGL context used for rendering */
	_gl : null,
	/** @private The last recorded width of the canvas */
	_width : null,
	/** @private The last recorded height of the canvas */
	_height : null,

	/** @private Debug value used to draw axis */
	_do_lines : false,

	/** @private Colour values for White */
	_diff_w : [ 1.0, 1.0, 1.0 ],
	_spec_w : [ 0.1, 0.1, 0.1 ],
	_shinny_w : 1,

	/** @private Colour values for ships */
	_diff_ship : [0.5, 0.5, 0.5],
	_spec_ship : [0.1, 0.1, 0.1],
	_shinny_ship : 1,

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
		gl.setFragmentColor(1.0, 1.0, 1.0, 1.0);
		gl.setAmbientColor(0.2, 0.2, 0.2);
		gl.setLightPositon(0.0, 10.0, 0.0);
		gl.setDiffuseColor( this._diff_w );
		gl.setSpecularColor( this._spec_w );
		gl.setMaterialShininess( this._shinny_w );

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
				gl.scale(4.0, 4.0, 4.0);
				this._drawPeg(gl);
			break;
			case Battleship.Model.TEST_SHIPS:
				gl.scale(2.0, 2.0, 2.0);
				gl.rotate(30, 0, 0);
				gl.translate(0.0, 2, -3);
				this._drawShips(gl);
				gl.rotate(90, 0, 0);
				gl.rotate(0, 180, 0);
				this._drawGrid(gl);
			break;
			case Battleship.Model.TEST_FONT:
				gl.translate(-14, 8, 0);
				glfont.test(gl, 3, 0, 0);
			break;
			case Battleship.Model.TEST_FOG:
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
		gl.draw(this._lines);
	},

	_drawGrid : function(gl) {
		if (!this._grid) {
			var o = new GLObject('grid');
			this._grid = o;

			o.translate(-GRID_DIM/2.0, 0.0, -BLOCK_DEPTH/2.0);
			var x, y;
			for (x = 0; x < GRID_DIM; x++)
			{
				o.pushMatrix();
				for (y = 0; y < GRID_DIM; y++)
				{
					//Note i don't use my primitive here because I don't
					//need the back face. Its a good way to remove 400
					//faces
					o.begin(GLObject.GL_QUADS);
						//Front
						o.setNormal(0, 0, 1);
						o.vertex(0, 0, 0 + BLOCK_DEPTH);
						o.vertex(0 + BLOCK_DIM, 0, BLOCK_DEPTH);
						o.vertex(0 + BLOCK_DIM, BLOCK_DIM, BLOCK_DEPTH);
						o.vertex(0, 0 + BLOCK_DIM, 0 + BLOCK_DEPTH);
						//Left
						if (x == 0)
						{
							o.setNormal(-1, 0, 0);
							o.vertex(0, 0, 0);
							o.vertex(0, 0, BLOCK_DEPTH);
							o.vertex(0, BLOCK_DIM, 0 + BLOCK_DEPTH);
							o.vertex(0, BLOCK_DIM, 0);
						}
						//Rigt
						if (x == GRID_DIM - 1)
						{
							o.setNormal(1, 0, 0);
							o.vertex(BLOCK_DIM, 0, BLOCK_DEPTH);
							o.vertex(BLOCK_DIM, 0, 0);
							o.vertex(BLOCK_DIM, BLOCK_DIM, 0);
							o.vertex(BLOCK_DIM, BLOCK_DIM, 0 + BLOCK_DEPTH);
						}
						//Top
						if (y == GRID_DIM - 1)
						{
							o.setNormal(0, 1, 0);
							o.vertex(0, BLOCK_DIM, 0);
							o.vertex(0, BLOCK_DIM, BLOCK_DEPTH);
							o.vertex(BLOCK_DIM, BLOCK_DIM, BLOCK_DEPTH);
							o.vertex(BLOCK_DIM, BLOCK_DIM, 0);
						}
						//Bottom
						if (y == 0)
						{
							o.setNormal(0, -1, 0);
							o.vertex(0, 0, 0);
							o.vertex(0, 0, BLOCK_DEPTH);
							o.vertex(BLOCK_DIM, 0, BLOCK_DEPTH);
							o.vertex(BLOCK_DIM, 0, 0);
						}
					o.end();
					o.translate(0.0, BLOCK_REAL_DIM, 0.0);
				}
				o.popMatrix();
				o.translate(BLOCK_REAL_DIM, 0.0, 0.0);
			}
		}

		var diff_water = [0.0, 0.2, 0.9 ];
		var spec_water = [0.0, 0.0, 0.0 ];
		var frag_water = [1.0, 1.0, 1.0, 0.4];
		var shinny_water = 1;

		gl.setDiffuseColor(diff_water);
		gl.setSpecularColor(spec_water);
		gl.setMaterialShininess(shinny_water);
		gl.setFragmentColor(1.0, 1.0, 1.0, 0.4);
		gl.draw(this._grid);
		gl.setFragmentColor(1.0, 1.0, 1.0, 1.0);
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
	},

	_drawCarrier : function(gl) {
		var pegStart = BLOCK_REAL_DIM/2.0;
		var G = 0.1;

		if (!this._carrier) {
			var o = new GLObject('carrier');
			this._carrier = o;

			//Pegs
			o.pushMatrix();
				o.translate(0, -PEG_LEN_2, pegStart);
				o.rotate(-90, 0, 0);
				o.translate(0.0, -BLOCK_REAL_DIM, 0.0);
				glprimitive.cylinder(o, PEG_DIAM_2, PEG_LEN_2);
				o.translate(0.0, -(BLOCK_REAL_DIM*2), 0.0);
				glprimitive.cylinder(o, PEG_DIAM_2, PEG_LEN_2);
			o.popMatrix();
			o.begin(GLObject.GL_QUADS);
				//Back
				o.setNormal(0, 0, -1);
				o.vertex(SHIP_HULL_DIAM*2.0, SHIP_HULL_HEIGHT, G);
				o.vertex(SHIP_HULL_DIAM*2.0, 0, G);
				o.vertex(-SHIP_HULL_DIAM*2.0, 0, G);
				o.vertex(-SHIP_HULL_DIAM*2.0,SHIP_HULL_HEIGHT, G);
				//Left
				o.setNormal(-1, 0, 0);
				o.vertex(-SHIP_HULL_DIAM*2.0,SHIP_HULL_HEIGHT, G);
				o.vertex(-SHIP_HULL_DIAM*2.0, 0, G);
				o.vertex(-SHIP_HULL_DIAM*2.0, 0, BLOCK_REAL_DIM*5.0-G);
				o.vertex(-SHIP_HULL_DIAM*2.0,SHIP_HULL_HEIGHT,BLOCK_REAL_DIM*5.0-G);
				//Front
				o.setNormal(0, 0, 1);
				o.vertex(-SHIP_HULL_DIAM*2.0,SHIP_HULL_HEIGHT,BLOCK_REAL_DIM*5.0-G);
				o.vertex(-SHIP_HULL_DIAM*2.0, 0, BLOCK_REAL_DIM*5.0-G);
				o.vertex(SHIP_HULL_DIAM*2.0, 0, BLOCK_REAL_DIM*5.0-G);
				o.vertex(SHIP_HULL_DIAM*2.0,SHIP_HULL_HEIGHT,BLOCK_REAL_DIM*5.0-G);
				//Right
				o.setNormal(1, 0, 0);
				o.vertex(SHIP_HULL_DIAM*2.0, 0, G);
				o.vertex(SHIP_HULL_DIAM*2.0, SHIP_HULL_HEIGHT, G);
				o.vertex(SHIP_HULL_DIAM*2.0, SHIP_HULL_HEIGHT, BLOCK_REAL_DIM*5.0 - G);
				o.vertex(SHIP_HULL_DIAM*2.0, 0, BLOCK_REAL_DIM*5.0 - G);
			o.end();
			//The deck
			glprimitive.box(o, -BLOCK_DIM/2.0, SHIP_HULL_HEIGHT, 0,
							BLOCK_DIM, SHIP_DECK_HEIGHT, BLOCK_REAL_DIM*5);
			//Controll Tower
			var G2 = 0.2;
			glprimitive.box(o, -PEG_DIAM_1,
							SHIP_HULL_HEIGHT + SHIP_DECK_HEIGHT,
							BLOCK_REAL_DIM*2,
							G2, G2, BLOCK_REAL_DIM);
			glprimitive.box(o, -PEG_DIAM_1,
							SHIP_HULL_HEIGHT + SHIP_DECK_HEIGHT + G2,
							BLOCK_REAL_DIM*2.5 - G2/2.0,
							G2, G2, G2);
		}
		gl.draw(this._carrier);
	},

	_drawBattleship : function(gl) {
		var pegStart = BLOCK_REAL_DIM/2.0;

		if (!this._battleship) {
			var o = new GLObject('battleship');
			this._battleship = o;

			//Pegs
			o.pushMatrix();
				o.translate(0, -PEG_LEN_2, pegStart);
				o.rotate(-90, 1, 0, 0);
				o.translate(0.0, -BLOCK_REAL_DIM, 0.0);
				glprimitive.cylinder(o, PEG_DIAM_2, PEG_LEN_2);
				o.translate(0.0, -BLOCK_REAL_DIM, 0.0);
				glprimitive.cylinder(o, PEG_DIAM_2, PEG_LEN_2);
			o.popMatrix();
			o.pushMatrix();
				o.translate(0.0, 0.0, BLOCK_REAL_DIM*2.0);
				o.rotate(-90, 0.0, 0.0);
				//The hull
				o.pushMatrix();
					o.scale(1.0, BLOCK_REAL_DIM*6.0, 1.0);
					glprimitive.cylinder(o,SHIP_HULL_DIAM*2.1,SHIP_HULL_HEIGHT);
				o.popMatrix();
				//The deck
				o.pushMatrix();
					o.translate(0.0, 0.0, SHIP_HULL_HEIGHT);
					o.scale(1.0, BLOCK_REAL_DIM*6.0, 1.0);
					glprimitive.cylinder(o,SHIP_HULL_DIAM*2.2,SHIP_DECK_HEIGHT);
					o.translate(0.0, 0.0, SHIP_DECK_HEIGHT);
					glprimitive.disk(o,SHIP_HULL_DIAM*2.2);
				o.popMatrix();
			o.popMatrix();
			//Controll Tower
			var G2 = 0.2;
			glprimitive.box(o, -G2/2.0,
							SHIP_HULL_HEIGHT + SHIP_DECK_HEIGHT,
							BLOCK_REAL_DIM*2 - BLOCK_REAL_DIM/2.0,
							G2, G2, BLOCK_REAL_DIM);
		}
		gl.draw(this._battleship);
	},

	_drawDestroyer : function(gl) {
		var pegStart = BLOCK_REAL_DIM/2.0;

		if (!this._destroyer) {
			var o = new GLObject('destroyer');
			this._destroyer = o;

			//Pegs
			o.pushMatrix();
				o.translate(0, -PEG_LEN_2, pegStart);
				o.rotate(-90, 0, 0);
				glprimitive.cylinder(o, PEG_DIAM_2, PEG_LEN_2);
				o.translate(0.0, -BLOCK_REAL_DIM*2.0, 0.0);
				glprimitive.cylinder(o, PEG_DIAM_2, PEG_LEN_2);
			o.popMatrix();
			o.pushMatrix();
				o.translate(0.0, 0.0, BLOCK_REAL_DIM*1.5);
				o.rotate(-90, 0.0, 0.0);
				//The hull
				o.pushMatrix();
					o.scale(1.0, BLOCK_REAL_DIM*4.5, 1.0);
					glprimitive.cylinder(o,SHIP_HULL_DIAM*2.0,SHIP_HULL_HEIGHT);
				o.popMatrix();
				//The deck
				o.pushMatrix();
					o.translate(0.0, 0.0, SHIP_HULL_HEIGHT);
					o.scale(1.0, BLOCK_REAL_DIM*4.5, 1.0);
					glprimitive.cylinder(o,SHIP_HULL_DIAM*2.1,SHIP_DECK_HEIGHT);
					o.translate(0.0, 0.0, SHIP_DECK_HEIGHT);
					glprimitive.disk(o,SHIP_HULL_DIAM*2.1);
				o.popMatrix();
			o.popMatrix();
			//Controll Tower
			var G2 = 0.2;
			glprimitive.box(o, -G2/2.0,
							SHIP_HULL_HEIGHT + SHIP_DECK_HEIGHT,
							BLOCK_REAL_DIM,
							G2, G2, G2);
			glprimitive.box(o, -G2/2.0,
							SHIP_HULL_HEIGHT + SHIP_DECK_HEIGHT,
							BLOCK_REAL_DIM + PEG_DIAM_1*3,
							G2, G2, G2);
		}
		gl.draw(this._destroyer);
	},

	_drawSub : function(gl) {
		var pegStart = BLOCK_REAL_DIM/2.0;

		if (!this._sub) {
			var o = new GLObject('sub');
			this._sub = o;

			//Pegs
			o.pushMatrix();
				o.translate(0, -PEG_LEN_2, pegStart);
				o.rotate(-90, 0, 0);
				glprimitive.cylinder(o, PEG_DIAM_2, PEG_LEN_2);
				o.translate(0.0, -BLOCK_REAL_DIM*2.0, 0.0);
				glprimitive.cylinder(o, PEG_DIAM_2, PEG_LEN_2);
			o.popMatrix();
			o.translate(0.0, (SHIP_HULL_HEIGHT-SHIP_DECK_HEIGHT)/2.0, 0.0);
			//Hull
			o.pushMatrix();
				o.translate(0.0, 0.0, BLOCK_REAL_DIM*1.5);
				o.rotate(-90, 0.0, 0.0);
				o.pushMatrix();
					o.scale(1.0, BLOCK_REAL_DIM*4.5,
							(SHIP_HULL_HEIGHT+SHIP_DECK_HEIGHT)*2.5);
					glprimitive.sphere(o, SHIP_HULL_DIAM*2.0);
				o.popMatrix();
			o.popMatrix();
			//Controll Tower
			var G2 = 0.2;
			glprimitive.box(o, -G2/2.0,
							SHIP_HULL_HEIGHT,
							BLOCK_REAL_DIM,
							G2, G2, G2*2);
		}
		gl.draw(this._sub);
	},

	_drawPT : function(gl) {
		var pegStart = BLOCK_REAL_DIM/2.0;

		if (!this._ptBoat) {
			var o = new GLObject('ptBoat');
			this._ptBoat = o;

			//Pegs
			o.pushMatrix();
				o.translate(0, -PEG_LEN_2, pegStart);
				o.rotate(-90, 0, 0);
				glprimitive.cylinder(o, PEG_DIAM_2, PEG_LEN_2);
				o.translate(0.0, -BLOCK_REAL_DIM, 0.0);
				glprimitive.cylinder(o, PEG_DIAM_2, PEG_LEN_2);
			o.popMatrix();
			o.pushMatrix();
				o.translate(0.0, 0.0, BLOCK_REAL_DIM);
				o.rotate(-90, 0.0, 0.0);
				//The hull
				o.pushMatrix();
					o.scale(1.0, BLOCK_REAL_DIM*3.0, 1.0);
					glprimitive.cylinder(o,SHIP_HULL_DIAM*2.0,SHIP_HULL_HEIGHT);
				o.popMatrix();
				//The deck
				o.pushMatrix();
					o.translate(0.0, 0.0, SHIP_HULL_HEIGHT);
					o.scale(1.0, BLOCK_REAL_DIM*3.0, 1.0);
					glprimitive.cylinder(o,SHIP_HULL_DIAM*2.1,SHIP_DECK_HEIGHT);
					o.translate(0.0, 0.0, SHIP_DECK_HEIGHT);
					glprimitive.disk(o,SHIP_HULL_DIAM*2.1);
				o.popMatrix();
			o.popMatrix();
			var G2 = 0.2;
			glprimitive.box(o, -G2/2.0,
							SHIP_HULL_HEIGHT+SHIP_DECK_HEIGHT,
							BLOCK_REAL_DIM-G2,
							G2, G2, 2*G2);
		}
		gl.draw(this._ptBoat);
	},

	_drawShip : function(gl, snum) {
		switch (snum)
		{
			case Battleship.Model.SHIP_CARRIER: this._drawCarrier(gl); break;
			case Battleship.Model.SHIP_BATTLESHIP: this._drawBattleship(gl); break;
			case Battleship.Model.SHIP_DESTROYER: this._drawDestroyer(gl); break;
			case Battleship.Model.SHIP_SUB: this._drawSub(gl); break;
			case Battleship.Model.SHIP_PT: this._drawPT(gl); break;
			default:
				console.log("Invalid ship to drawShip %i\n", snum);
			break;
		}
	},

	_drawShips : function(gl) {
		var SHIP_LOC =
		[
			[-BLOCK_REAL_DIM/2.0, 0, 0, 0, 0, 0],
			[-BLOCK_REAL_DIM/2.0-BLOCK_REAL_DIM, 0, BLOCK_REAL_DIM*3, 0, 0, 0],
			[-BLOCK_REAL_DIM/2.0-BLOCK_REAL_DIM*2, 0, 0, 0, 0, 0],
			[-BLOCK_REAL_DIM/2.0, 0, BLOCK_REAL_DIM*(Battleship.Model.MAX_SHIP_LEN+1), 0, 0, 0],
			[-BLOCK_REAL_DIM/2.0-BLOCK_REAL_DIM*2, 0, BLOCK_REAL_DIM*Battleship.Model.MAX_SHIP_LEN+1, 0, 0, 0]
		];

		gl.setDiffuseColor(this._diff_ship);
		gl.setSpecularColor(this._spec_ship);
		gl.setMaterialShininess(this._shinny_ship);

		var i;
		for (i = 0; i < Battleship.Model.NUM_SHIPS; i++)
		{
			gl.pushMatrix();

			//move to other players holder
			gl.translate(SHIP_LOC[i][0], SHIP_LOC[i][1], SHIP_LOC[i][2]);
			gl.rotate(SHIP_LOC[i][3], 0, 0);
			gl.rotate(0, SHIP_LOC[i][4], 0);
			gl.rotate(0, 0, SHIP_LOC[i][5]);

			this._drawShip(gl, i);

			gl.popMatrix();
		}
	},

};
