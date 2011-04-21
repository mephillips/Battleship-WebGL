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
 * Contains rendering portion of the Battleship game.
 *
 */

/** How far up on the board to draw the vertical grid */
var GRID_TOP_Y = 2.0;  	// - For the normal on the diagonl stuff. This
/** How far out fromt he origin to draw the vertical gird */
var GRID_TOP_Z = 0.5;
/** How far up on the board to draw the horizontal grid */
var GRID_BOTTOM_Y = -1.5;
/** How far out fromt he origin to draw the horizonal gird */
var GRID_BOTTOM_Z = 2.0;  	// - And this should be equal

/** The depth of grid blocks */
var BLOCK_DEPTH = 0.8;
/** The heigh/width of grid blocks */
var BLOCK_DIM = 0.9;
/** Grid blocks are drawn with some space around them, this value is how
 *  height/wide they are including that space.
 */
var BLOCK_REAL_DIM = 1.0;

/** Width of the overhang at the top of the game */
var BORDER_TOP_WIDTH = 1.5;
/** Amount of space between top of grid and top of game */
var BORDER_TOP_GAP = 0.5;
/** Amount of space between front of horizontal grid and front of game */
var BORDER_BOTTOM_GAP = 0;
/** Width of the cubes that make up the border */
var BORDER_WIDTH = 0.2;

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

/** The left of the screen, for writting font */
var FONT_X0 = -16;
/** The right of the screen, for writting font */
var FONT_X1 = 16;
/** The top of the screen, for writting font */
var FONT_Y0 = 11;
/** The bottom of the screen, for writting font */
var FONT_Y1 = -12;

/** The width of the table the game board sits on */
var TABLE_WIDTH = 30;
/** The height of the table the game board sits on */
var TABLE_HEIGHT = 1.0;
/** The depth of the table the game board sits on */
var TABLE_DEPTH = 26;
/** The top o the table */
var TABLE_TOP = (-(BLOCK_DEPTH/2.0+BORDER_WIDTH) + GRID_BOTTOM_Y);

/** The size of the room width/depth the game is being played in */
var ROOM_DIM = 60;

/** The size of the room height the game is being played in */
var ROOM_HEIGHT = 55;

/** The height of the fog cube */
var FOG_HEIGHT = PEG_LEN_2;

/** X Location of light used to cast shadows */
var LIGHT_X = 0
/** Y Location of light used to cast shadows */
var LIGHT_Y = (ROOM_HEIGHT/2.0)
/** Z Location of light used to cast shadows */
var LIGHT_Z = 0

 /**
  * @namespace
  */
Battleship.View = {
	/** @private The last recorded width of the canvas */
	_width : null,
	/** @private The last recorded height of the canvas */
	_height : null,

	/** @private Colour values for White */
	_diff_w : [ 1.0, 1.0, 1.0 ],
	_spec_w : [ 0.1, 0.1, 0.1 ],
	_shinny_w : 1,
	/** @private Colour values for Red */
	_diff_r : [1.0, 0.0, 0.0],
	_spec_r : [0.1, 0.1, 0.1],
	_shinny_r : 1,

	/** @private Colour values for ships */
	_diff_ship : [0.5, 0.5, 0.5],
	_spec_ship : [0.1, 0.1, 0.1],
	_shinny_ship : 1,


	/** Display objects */
	_lines : null,
	_wall : null,
	_fog : null,
	_grid : null,
	_peg : null,
	_carrier : null,
	_battleship : null,
	_destroyer : null,
	_sub : null,
	_ptBoat : null,
	_ceiling : null,
	_light : null,
	_floor : null,
	_tableLegs : null,
	_tableTop : null,

	/** Textures */
	_fogTexture : null,
	_lsysTexture : null,
	_floorTexture : null,
	_ceilingTexture : null,
	_tableTexture : null,

	/** State */
	/** @private The value of do_fog used to generat the current texture */
	_fogType : null,
	/** @private The value of game_lsys used to generat the current lsys tex */
	_lastLsys : null,

	init : function() {
		this._menuTranslate = [ 0, 0, 0 ];
		this._menuRotate = [ 0, 0, 0 ];
		this._userTranslate = [ 0, 0, 0 ];
		this._userRotate = [ 0, 0, 0 ];
		this._gameTranslate = [ 0, 0, 0 ];
		this._gameRotate = [ 0, 0, 0 ];
	},

	/** Gets the current size of the window
	 *
	 *  Used in some places by the game logic.
	 *
	 *  @return	An object { width, height }
	 */
	getsize : function() {
		return { width : this._width, height : this._height };
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
				if (Battleship.Menu.curr_menu) {
					this._menuTranslate[axis] = amount;
				} else {
					this._userTranslate[axis] = amount;
				}
			break;
			case 'U' :
				if (Battleship.Menu.curr_menu) {
					this._menuTranslate[axis] += amount;
				} else {
					this._userTranslate[axis] += amount;
				}
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
				if (Battleship.Menu.curr_menu) {
					this._menuRotate[axis] = amount;
				} else {
					this._userRotate[axis] = amount;
				}
			break;
			case 'U' :
				if (Battleship.Menu.curr_menu) {
					this._menuRotate[axis] += amount;
				} else {
					this._userRotate[axis] += amount;
				}
			break;
			case 'g' : this._gameRotate[axis] = amount; break;
			case 'G' : this._gameRotate[axis] += amount; break;
			default:
				console.log("View.set_rotate: Unknow type %s.", type);
			break;
		}
	},

	set_perspective : function(gl, width, height) {
		if (width !== this._width && height !== this._height) {

			this._width = width;
			this._height = height;

			// Set the viewport and projection matrix for the scene
			gl.viewport(0, 0, width, height);
			gl.setPerspective(30, width/height, 30.0, 500);
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
		gl.setLightPositon(LIGHT_X, LIGHT_Y, LIGHT_Z);
		gl.setDiffuseColor( this._diff_w );
		gl.setSpecularColor( this._spec_w );
		gl.setMaterialShininess( this._shinny_w );

		gl.identity();
		gl.translate(0, 0, -50);
	},

	draw : function(gl, width, height) {
		this.set_perspective(gl, width, height);

		// Translation
		if (!Battleship.Menu.curr_menu)
		{
			//user rotation
			gl.rotate(this._userRotate[0], 0, 0);
			gl.rotate(0, this._userRotate[1], 0);
			gl.rotate(0, 0, this._userRotate[2]);
			gl.translate(this._userTranslate[0], this._userTranslate[1], this._userTranslate[2]);
		} else {
			//user rotation of menu
			gl.rotate(this._menuRotate[0], 0, 0);
			gl.rotate(0, this._menuRotate[1], 0);
			gl.rotate(0, 0, this._menuRotate[2]);
			gl.translate(this._menuTranslate[0], this._menuTranslate[1], this._menuTranslate[2]);
		}

		// Draw axis
		if (this._do_lines) {
			this._drawLines(gl);
		}

		switch (Battleship.Model.do_test)
		{
			case Battleship.Model.enum_testtype.PRIMITIVE:
				glprimitive.test(gl, 4.0, 15);
			break;
			case Battleship.Model.enum_testtype.CLOCK:
				glprimitive.clock(gl, 8.0, 15);
			break;
			case Battleship.Model.enum_testtype.MUG:
				glprimitive.mug(gl, 8.0, 15);
			break;
			case Battleship.Model.enum_testtype.PEG:
				gl.scale(4.0, 4.0, 4.0);
				this._drawPeg(gl);
			break;
			case Battleship.Model.enum_testtype.SHIPS:
				gl.scale(2.0, 2.0, 2.0);
				gl.rotate(30, 0, 0);
				gl.translate(0.0, 2, -3);
				this._drawShips(gl);
				gl.translate(0.0, GRID_BOTTOM_Y, -GRID_TOP_Z + GRID_BOTTOM_Z);
				gl.rotate(90, 0, 0);
				gl.rotate(0, 180, 0);
				this._drawGrid(gl);
			break;
			case Battleship.Model.enum_testtype.FONT:
				gl.translate(-14, 8, 0);
				glfont.test(gl, 3, 0, 0);
			break;
			case Battleship.Model.enum_testtype.FOG:
				gl.translate(0.0, -5.0, 15.0);
				this._drawGrid(gl);
				this._drawFog(gl);
			break;
			case Battleship.Model.enum_testtype.LSYSTEM:
				gl.rotate(0.0, 180, 0.0);
				gl.translate(0.0, 0.0, 40);
				this._drawWall(gl);
			break;
			default:
				if (false) {//Battleship.Menu.curr_menu) {
					if (Battleship.Menu.name_selector.enabled) {
						this._drawNameSelector(gl);
					} else {
						this._drawMenu(gl);
						var menuName = Battleship.Menu.curr_menu.name;
						if (menuName === "Fog") {
							this._drawFog(gl);
						} else if (menuName === "L-Systems") {
							gl.rotate(0.0, 180, 0.0);
							gl.translate(0.0, 30.0, 200);
							this._drawWall(gl);
						} else if (menuName === "Rocket" || menuName === "Fire") {
							/*
							gl.translatef(7.0, 0.0, 0);
							if (battleship_rocket_get_path() != rocket_path[0])
								battleship_rocket_set_path(rocket_path[0]);
							//glRotatef(-90, 0.0, 1.0, 0.0);
							drawRocket();
							if (!battleship_rocket_move())
								battleship_rocket_reset();
							*/
						}
					}
				} else {
					//if (do_shadows[SHADOW_ALL]) { drawShadows(); }
					this._drawGame(gl);
				}
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

	_drawGame : function(gl) {
		this._drawCeiling(gl);
		this._drawFloor(gl);

		//Draw walls
		gl.pushMatrix();
			this._drawWall(gl);
			gl.rotate(0.0, 90, 0.0);
			this._drawWall(gl);
			gl.rotate(0.0, 90, 0.0);
			this._drawWall(gl);
			gl.rotate(0.0, 90, 0.0);
			this._drawWall(gl);
		gl.popMatrix();

		this._drawTable(gl);
	},

	_drawGrid : function(gl) {
		if (!this._grid) {
			var o = new GLObject('grid');
			this._grid = o;

			var GRID_DIM = Battleship.Model.GRID_DIM;
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
		var ship = Battleship.Model.enum_shiptype[Battleship.Model.SHIP_IDS[snum]];
		switch (ship)
		{
			case Battleship.Model.enum_shiptype.CARRIER: this._drawCarrier(gl); break;
			case Battleship.Model.enum_shiptype.BATTLESHIP: this._drawBattleship(gl); break;
			case Battleship.Model.enum_shiptype.DESTROYER: this._drawDestroyer(gl); break;
			case Battleship.Model.enum_shiptype.SUB: this._drawSub(gl); break;
			case Battleship.Model.enum_shiptype.PT: this._drawPT(gl); break;
			default:
				console.log("Invalid ship to drawShip %i %s\n", snum, Battleship.Model.SHIP_IDS[snum]);
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

	_drawMenu : function(gl) {
		var size = 1.5;
		var menu = Battleship.Menu.curr_menu;
		var w = glfont.char_width(size)*menu.name.length/2.0;

		gl.pushMatrix();

		//Center title horizontally (and put it at top)
		gl.pushMatrix();
			gl.setDiffuseColor( this._diff_r );
			gl.setSpecularColor( this._spec_r );
			gl.setMaterialShininess( this._shinny_r );

			gl.translate(-w, FONT_Y0, 0.0);
			glfont.draw_string(gl, menu.name, size);

			gl.setDiffuseColor( this._diff_w );
			gl.setSpecularColor( this._spec_w );
			gl.setMaterialShininess( this._shinny_w );
		gl.popMatrix();

		//find max lengthed menu item
		var i;
		var len = 0;
		var max_len = 0;
		for (i = 0; i < menu.size; i++)
		{
			if (!menu.item[i]) { continue; }
			len = menu.item[i].name.length;
			if (menu.item[i].svalue) {
				len += menu.item[i].svalue.length + 2;
			}
			max_len = (max_len < len) ? len : max_len;
		}

		//Options are smaller than title
		size = 1.0;
		//Center items
		w = glfont.char_width(size)*max_len/2.0;
		var h = glfont.char_height(size);
		gl.translate(-w, h*menu.size/2.0 + h*(menu.size + 1)/2.0, 0.0);

		w = glfont.char_width(size);
		h *= 2.0; //double space
		//double space
		for (i = 0; i < menu.size; i++) {
			gl.translate(0.0, -h, 0.0);

			//separator
			if (!menu.item[i]) {
				gl.pushMatrix();
					var j;
					for (j = 0; j < max_len - 1; j++) {
						glfont.draw_string(gl, "-", size);
						gl.translate(w, 0.0, 0.0);
					}
				gl.popMatrix();
				continue;
			}

			//draw selection
			if (Battleship.Menu.curr_menu_sel === i) {
				gl.pushMatrix();
					gl.setDiffuseColor( this._diff_r );
					gl.setSpecularColor( this._spec_r );
					gl.setMaterialShininess( this._shinny_r );
					gl.rotate(0.0, -90, 0.0);
					gl.translate(0.0, h/4.0, w/4.0);
					this._drawPeg(gl);
					gl.setDiffuseColor( this._diff_w );
					gl.setSpecularColor( this._spec_w );
					gl.setMaterialShininess( this._shinny_w );
				gl.popMatrix();
			}

			//draw name
			glfont.draw_string(gl, menu.item[i].name, size);
			if (menu.item[i].svalue) {
				//draw value
				gl.pushMatrix();
					gl.translate(w * menu.item[i].name.length, 0.0, 0.0);
					glfont.draw_string(gl, ":", size);
					gl.translate(w, 0.0, 0.0);
					glfont.draw_string(gl, menu.item[i].svalue, size);
				gl.popMatrix();
			} else if (menu.item[i].size > 0) {
				//draw plus for submenus
				gl.pushMatrix();
					gl.translate(w * menu.item[i].name.length, 0.0, 0.0);
					glfont.draw_string(gl, "+", size);
				gl.popMatrix();
			}
		}
		gl.popMatrix();

		//Help text
		gl.pushMatrix();
			size = 0.8;
			w = glfont.char_width(size);
			var text;
			if (menu.item[Battleship.Menu.curr_menu_sel].svalue) {
				text = "(Left/Right to change)";
			} else {
				text = "(Enter to select)";
			}
			gl.translate(-w*text.length/2.0, FONT_Y1, 0.0);
			glfont.draw_string(gl, text, size);
		gl.popMatrix();
	},

	_drawNameSelector : function(gl) {
		var size = 1.5;

		//Center title horizontally (and put it at top)
		gl.pushMatrix();
			var text = "Select Name";
			var w = glfont.char_width(size)*text.length/2.0;
			gl.setDiffuseColor( this._diff_r );
			gl.setSpecularColor( this._spec_r );
			gl.setMaterialShininess( this._shinny_r );

			//title
			gl.translate(-w, FONT_Y0, 0.0);
			glfont.draw_string(gl, text, size);

			gl.setDiffuseColor( this._diff_w );
			gl.setSpecularColor( this._spec_w );
			gl.setMaterialShininess( this._shinny_w );

			//draw name
			size = 1.2;
			var w2 = glfont.char_width(size)*Battleship.Model.MAX_NAME_LEN/2.0;
			var h = -2.5 * glfont.char_height(size);
			gl.translate(w - w2, h, 0.0);
			glfont.draw_string(gl, Battleship.Menu.name_selector.name, size);

			//Draw bar under current letter
			var g = 0.2;
			var len = Battleship.Menu.name_selector.name.length;
			if (len < Battleship.Model.MAX_NAME_LEN) {
				if (!this._nameSelectorCurr) {
					var o = new GLObject('nameselector_curr');
					this._nameSelectorCurr = o;
					glprimitive.box(o, 0, 0, 0, glfont.char_width(size), g, g);
				}
				gl.pushMatrix();
					gl.translate(len * glfont.char_width(size), 0, 0);
					gl.draw(this._nameSelectorCurr);
				gl.popMatrix();
			}

			//draw box around name
			h = glfont.char_height(size);
			var diff = h - size;
			if (!this._nameSelectorContainer) {
				var o = new GLObject('nameselector_container');
				this._nameSelectorContainer = o;
				//left
				glprimitive.box(o, -size/2.0 - g, -size/2.0 - g, 0.0,
								g, h + size - diff + g*2.0, g);
				//right
				glprimitive.box(o, 2.0*w2 + size/2.0, -size/2.0 - g, 0.0,
									g, h + size - diff + g*2.0, g);
				//top
				glprimitive.box(o, -size/2.0, h + size/2.0 - diff, 0.0,
								2.0*w2 + size, g, g);
				//bottom
				glprimitive.box(o, -size/2.0, -size/2.0 - g, 0.0,
								2.0*w2 + size, 0.2, g);
			}
			gl.draw(this._nameSelectorContainer);
		gl.popMatrix();

		gl.pushMatrix();
			size = 2.0;
			gl.translate(-glfont.TEST_WIDTH*glfont.char_width(size)/2.0,
						glfont.char_height(size),
						0.0);
			glfont.test(gl, size, Battleship.Menu.name_selector.x, Battleship.Menu.name_selector.y);
		gl.popMatrix();
	},

	_drawFog : function(gl) {
		if (Battleship.Model.do_fog === Battleship.Model.enum_fogtype.OFF) { return; }

		var d = Battleship.Model.GRID_DIM*BLOCK_REAL_DIM;
		var s = 1.0/(d + 2.0*FOG_HEIGHT);

		if (!this._fog) {
			var o = new GLObject('fog');
			this._fog = o;

			o.begin(GLObject.GL_QUADS);
				//Top
				o.setNormal(0.0, 0.0, 1.0);
				o.setTexCoord(FOG_HEIGHT*s, FOG_HEIGHT*s);
				o.vertex(d/2.0, 0.0, FOG_HEIGHT + BLOCK_DEPTH/2.0);
				o.setTexCoord(FOG_HEIGHT*s, (FOG_HEIGHT + d)*s);
				o.vertex(d/2.0, d, FOG_HEIGHT + BLOCK_DEPTH/2.0);
				o.setTexCoord((FOG_HEIGHT+d)*s, (FOG_HEIGHT + d)*s);
				o.vertex(-d/2.0, d, FOG_HEIGHT + BLOCK_DEPTH/2.0);
				o.setTexCoord((FOG_HEIGHT+d)*s, FOG_HEIGHT*s);
				o.vertex(-d/2.0, 0.0, FOG_HEIGHT + BLOCK_DEPTH/2.0);
				//Left
				o.setNormal(1.0, 0.0, 0.0);
				o.setTexCoord(FOG_HEIGHT*s, FOG_HEIGHT*s);
				o.vertex(d/2.0, 0.0, FOG_HEIGHT + BLOCK_DEPTH/2.0);
				o.setTexCoord(0, FOG_HEIGHT*s);
				o.vertex(d/2.0, 0.0, BLOCK_DEPTH/2.0);
				o.setTexCoord(0, (FOG_HEIGHT + d)*s);
				o.vertex(d/2.0, d, BLOCK_DEPTH/2.0);
				o.setTexCoord(FOG_HEIGHT*s, (FOG_HEIGHT+d)*s);
				o.vertex(d/2.0, d, FOG_HEIGHT + BLOCK_DEPTH/2.0);
				//Right
				o.setNormal(-1.0, 0.0, 0.0);
				o.setTexCoord((FOG_HEIGHT + d)*s, FOG_HEIGHT*s);
				o.vertex(-d/2.0, 0.0, FOG_HEIGHT + BLOCK_DEPTH/2.0);
				o.setTexCoord((FOG_HEIGHT + d)*s, (FOG_HEIGHT + d)*s);
				o.vertex(-d/2.0, d, FOG_HEIGHT + BLOCK_DEPTH/2.0);
				o.setTexCoord(1, (FOG_HEIGHT+d)*s);
				o.vertex(-d/2.0, d, BLOCK_DEPTH/2.0);
				o.setTexCoord(1, FOG_HEIGHT*s);
				o.vertex(-d/2.0, 0.0, BLOCK_DEPTH/2.0);
				//Back
				o.setNormal(0.0, -1.0, 0.0);
				o.setTexCoord((FOG_HEIGHT + d)*s, 0);
				o.vertex(-d/2.0, 0.0, BLOCK_DEPTH/2.0);
				o.setTexCoord(FOG_HEIGHT*s, 0);
				o.vertex(d/2.0, 0.0, BLOCK_DEPTH/2.0);
				o.setTexCoord(FOG_HEIGHT*s, FOG_HEIGHT*s);
				o.vertex(d/2.0, 0.0, FOG_HEIGHT + BLOCK_DEPTH/2.0);
				o.setTexCoord((FOG_HEIGHT + d)*s, FOG_HEIGHT*s);
				o.vertex(-d/2.0, 0.0, FOG_HEIGHT + BLOCK_DEPTH/2.0);
				//Front
				o.setNormal(0.0, 1.0, 0.0);
				o.setTexCoord(FOG_HEIGHT*s, (FOG_HEIGHT + d)*s);
				o.vertex(d/2.0, d, FOG_HEIGHT + BLOCK_DEPTH/2.0);
				o.setTexCoord(FOG_HEIGHT*s, 1);
				o.vertex(d/2.0, d, BLOCK_DEPTH/2.0);
				o.setTexCoord((FOG_HEIGHT + d)*s, 1);
				o.vertex(-d/2.0, d, BLOCK_DEPTH/2.0);
				o.setTexCoord((FOG_HEIGHT + d)*s, (FOG_HEIGHT+d)*s);
				o.vertex(-d/2.0, d, FOG_HEIGHT + BLOCK_DEPTH/2.0);
			o.end();
		}

		gl.setDiffuseColor( this._diff_w );
		gl.setSpecularColor( this._spec_w );
		gl.setMaterialShininess( this._shinny_w );
		if (Battleship.Model.do_textures) {
			//Generate (if needed)
			this._generateFog(gl);

			gl.uniform1i(gl.useTexturesUniform, true);
			gl.bindTexture(gl.TEXTURE_2D, this._fogTexture);
		}
		gl.draw(this._fog);
		if (Battleship.Model.do_textures) {
			gl.uniform1i(gl.useTexturesUniform, false);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	},

	_drawTable : function(gl) {
		var ypos = -TABLE_HEIGHT + TABLE_TOP;

		if (!this._tableTop) {
			var o = new GLObject('table_top');
			this._tableTop = o;
			glprimitive.box(o, -TABLE_WIDTH/2.0,
							ypos,
							-TABLE_DEPTH/2.0,
							TABLE_WIDTH, TABLE_HEIGHT, TABLE_DEPTH);
		}

		if (!this._tableLegs) {
			var o = new GLObject('table_legs');
			this._tableLegs = o;
			var r = 0.5;
			var b = 3.0;
			var i;
			for (i = 0; i < 2; i++) {
				o.pushMatrix();
					if (i === 1) { o.rotate(0.0, 180, 0.0); }
					o.translate(-TABLE_WIDTH/2.0 + b, ypos - r, -TABLE_DEPTH/2.0 + b);
					glprimitive.cylinder(o, r, TABLE_DEPTH - 2.0*b);
					o.translate(0.0, 0.0, 3.0*r);
					o.rotate(90, 0.0, 0.0);
					glprimitive.cylinder(o, r, ROOM_HEIGHT/2.0 + ypos - r);
					o.translate(0.0, TABLE_DEPTH - 2.0*b - 6.0*r, 0.0);
					glprimitive.cylinder(o, r, ROOM_HEIGHT/2.0 + ypos -r);
				o.popMatrix();
			}
		}

		//top
		if (Battleship.Model.do_textures) {
			if (!this._tableTexture) {
				this._tableTexture = gl.loadTextureDataUrl('data/table.rgb', 256, 256);
			}
			gl.uniform1i(gl.useTexturesUniform, true);
			gl.bindTexture(gl.TEXTURE_2D, this._fogTexture);
		}
		gl.draw(this._tableTop);
		if (Battleship.Model.do_textures) {
			gl.uniform1i(gl.useTexturesUniform, false);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}

		//legs
		gl.setDiffuseColor([0.1, 0.1, 0.1]);
		gl.setSpecularColor([0.1, 0.1, 0.1]);
		gl.setMaterialShininess(1);
		gl.draw(this._tableLegs);
	},

	_drawCeiling : function(gl) {
		var s = ROOM_DIM/5.0;
		if (!this._ceiling) {
			var o = new GLObject('cieling');
			this._ceiling = o;
			o.begin(GLObject.GL_QUADS);
				o.setNormal(0.0, -1.0, 0.0);
				o.setTexCoord(0, 0);
				o.vertex(-ROOM_DIM/2.0, ROOM_HEIGHT/2.0, -ROOM_DIM/2.0);
				o.setTexCoord(s, 0);
				o.vertex(ROOM_DIM/2.0, ROOM_HEIGHT/2.0, -ROOM_DIM/2.0);
				o.setTexCoord(s, s);
				o.vertex(ROOM_DIM/2.0, ROOM_HEIGHT/2.0, ROOM_DIM/2.0);
				o.setTexCoord(0, s);
				o.vertex(-ROOM_DIM/2.0, ROOM_HEIGHT/2.0, ROOM_DIM/2.0);
			o.end();

			o = new GLObject('light');
			this._light = o;
			//draw light
			var g = 3.0;
			glprimitive.box(o, LIGHT_X - g/2.0, LIGHT_Y - 0.5, LIGHT_Z - g/2.0, g, 0.5, g);
		}

		if (Battleship.Model.do_textures) {
			if (!this._ceilingTexture) {
				this._ceilingTexture = gl.loadTextureDataUrl('data/ceiling.rgb', 64, 64);
			}
			gl.uniform1i(gl.useTexturesUniform, true);
			gl.bindTexture(gl.TEXTURE_2D, this._ceilingTexture);
		}
		gl.draw(this._ceiling);
		if (Battleship.Model.do_textures) {
			gl.uniform1i(gl.useTexturesUniform, false);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		gl.draw(this._light);
	},

	_drawFloor : function(gl) {
		var s = ROOM_DIM/5.0;
		if (!this._floor) {
			var o = new GLObject('floor');
			this._floor = o;
			o.begin(GLObject.GL_QUADS);
				o.setNormal(0.0, 1.0, 0.0);
				o.setTexCoord(0, s);
				o.vertex(-ROOM_DIM/2.0, -ROOM_HEIGHT/2.0, ROOM_DIM/2.0);
				o.setTexCoord(s, s);
				o.vertex(ROOM_DIM/2.0, -ROOM_HEIGHT/2.0, ROOM_DIM/2.0);
				o.setTexCoord(s, 0);
				o.vertex(ROOM_DIM/2.0, -ROOM_HEIGHT/2.0, -ROOM_DIM/2.0);
				o.setTexCoord(0, 0);
				o.vertex(-ROOM_DIM/2.0, -ROOM_HEIGHT/2.0, -ROOM_DIM/2.0);
			o.end();
		}

		if (Battleship.Model.do_textures) {
			if (!this._floorTexture) {
				this._floorTexture = gl.loadTextureDataUrl('data/floor.rgb', 64, 64);
			}
			gl.uniform1i(gl.useTexturesUniform, true);
			gl.bindTexture(gl.TEXTURE_2D, this._floorTexture);
		}
		gl.draw(this._floor);
		if (Battleship.Model.do_textures) {
			gl.uniform1i(gl.useTexturesUniform, false);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	},

	_drawWall : function(gl) {
		if (!this._wall) {
			var o = new GLObject('wall');
			this._wall = o;

			o.pushMatrix();
				o.translate(0.0, 0.0, ROOM_DIM/2.0);
				o.begin(GLObject.GL_QUADS);
					o.setNormal(0.0, 0.0, -1.0);
					o.setTexCoord(1.0, 0.0);
					o.vertex(-ROOM_DIM/2.0, -ROOM_HEIGHT/2.0, 0.0);
					o.setTexCoord(0.0, 0.0);
					o.vertex(ROOM_DIM/2.0, -ROOM_HEIGHT/2.0, 0.0);
					o.setTexCoord(0.0, 1.0);
					o.vertex(ROOM_DIM/2.0, ROOM_HEIGHT/2.0, 0.0);
					o.setTexCoord(1.0, 1.0);
					o.vertex(-ROOM_DIM/2.0, ROOM_HEIGHT/2.0, 0.0);
				o.end();
			o.popMatrix();
		}

		if (Battleship.Model.do_textures && Battleship.Model.do_lsystem) {
			//Generate (if needed)
			this._generateLsystem(gl);

			gl.uniform1i(gl.useTexturesUniform, true);
			gl.bindTexture(gl.TEXTURE_2D, this._lsysTexture);
		}
		gl.draw(this._wall);
		if (Battleship.Model.do_textures && Battleship.Model.do_lsystem) {
			gl.uniform1i(gl.useTexturesUniform, false);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	},

	_generateLsystem : function(gl) {
		var lsys = Battleship.Model.game_lsys;
		if (this._lastLsys && this._lastLsys.type === lsys.type && this._lastLsys.length === lsys.length) { return; }

		var w = 512;
		var h = 512;
		var start = new Date().getTime();
		var data = lsystem.test(lsys.type, lsys.length, w, h);
		console.log("Generate lsystem: %ims", new Date().getTime() - start);
		this._lastLsys = { type : lsys.type, length : lsys.length };

		if (this._lsysTextureTexture) {
			gl.deleteTexture(this._lsysTexture);
		}
		this._lsysTexture = gl.loadTextureData(data, w, h, false);
	},

	_generateFog : function(gl) {
		if (this._fogType === Battleship.Model.do_fog) { return; }

		if (Battleship.Model.do_fog === Battleship.Model.enum_fogtype.REGEN) {
			Battleship.Model.do_fog = this._fogType;
		} else {
			this._fogType = Battleship.Model.do_fog;
		}

		var w = 128;
		var h = 128;
		var data = new Array(w*h*4);

		//ready perlin
		var p = {};
		p.freq = 0.15;
		p.pers = 0.65;
		p.octaves = 3;
		//deterine density
		var density;
		switch (Battleship.Model.do_fog)
		{
			case Battleship.Model.enum_fogtype.REGEN:
			case Battleship.Model.enum_fogtype.OFF:
				density = 0.0;
			break;
			case Battleship.Model.enum_fogtype.LIGHT:
				density = 255.0;
			break;
			case Battleship.Model.enum_fogtype.MEDIUM:
				density = 200.0;
			break;
			case Battleship.Model.enum_fogtype.HEAVY:
				density = 125.0;
				p.freq = 0.15;
			break;
		}

		var i, j;
		var di = 0;
		var start = new Date().getTime();
		perlin.init(w, h);
		for (i = 0; i < w; i++)
		{
			for (j = 0; j < h; j++)
			{
				var val = perlin.perlin2d(p, i, j);
				var n = Math.floor((val + 1.0)/2.0*density);
				data[di + 0] = 200;
				data[di + 1] = 200;
				data[di + 2] = 200;
				data[di + 3] = 255 - n;
				di += 4;
			}
		}
		console.log("Generate fog: %ims", new Date().getTime() - start);
		perlin.destroy();

		if (this._fogTexture) {
			gl.deleteTexture(this._fogTexture);
		}
		this._fogTexture = gl.loadTextureData(data, w, h, true);
	}
};
