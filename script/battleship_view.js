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

/** Increaseing this value will move the two players boards apart */
var BOARD_GAP = 0;

/** How far up on the board to draw the vertical grid */
var GRID_TOP_Y = 2.0;
/** How far out fromt he origin to draw the vertical gird */
var GRID_TOP_Z = 0.5;
/** How far up on the board to draw the horizontal grid */
var GRID_BOTTOM_Y = -1.5;
/** How far out fromt he origin to draw the horizonal gird */
var GRID_BOTTOM_Z = 2.0;

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

/** The width of the slots at the side of the board */
var SLOT_WIDTH = 4;
/** The height (along z) of thelarger slot on the right side of the board */
var SLOT_HEIGHT = 6;

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

/** The width of the picture frame */
var PICTURE_FRAME_R = 0.5;
/** The width/height of the picture */
var PICTURE_DIM = 4;

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
var LIGHT_X = 0;
/** Y Location of light used to cast shadows */
var LIGHT_Y = (ROOM_HEIGHT/2.0);
/** Z Location of light used to cast shadows */
var LIGHT_Z = 0;

	/** The number of points in a rocket path */
var PATH_SIZE = 5;

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

	/** The rocket paths used by the game
	 *  Note thate the first path in this array (which would corrispond to
	 *  ROCKET_OFF is used by the rocket menu
	 */
	rocket_path : [
		[
			PATH_SIZE,
			6.0, -10, 0.0,
			3.0, -4, 0.0,
			3.0, 0, 0.0,
			3.0, 4, 0.0,
			6.0, 10, 0.0
		],
		[
			PATH_SIZE,
			0, TABLE_TOP - 2, GRID_BOTTOM_Z + Battleship.Model.GRID_DIM*BLOCK_REAL_DIM,
			0, 14, GRID_BOTTOM_Z + Battleship.Model.GRID_DIM*BLOCK_REAL_DIM*0.5,
			0, 15, 0.0,
			0, 14, -(GRID_BOTTOM_Z + Battleship.Model.GRID_DIM*BLOCK_REAL_DIM*0.5),
			0, TABLE_TOP + BLOCK_DEPTH, 0
		],
		[
			PATH_SIZE,
			0, TABLE_TOP - 2, GRID_BOTTOM_Z + Battleship.Model.GRID_DIM*BLOCK_REAL_DIM,
			10, 8, GRID_BOTTOM_Z + Battleship.Model.GRID_DIM*BLOCK_REAL_DIM*0.5,
			10, 8, 0,
			10, 8, -(GRID_BOTTOM_Z + Battleship.Model.GRID_DIM*BLOCK_REAL_DIM + 2),
			0, TABLE_TOP + BLOCK_DEPTH, 0
		]
	],

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
	_coffeeObject : null,
	_borderMain : null,
	_borderLeft : null,
	_borderRight : null,

	/** Image Textures */
	_textures : {},
	/** Generated textures */
	_fogTexture : null,
	_lsysTexture : null,

	/** State */
	/** @private The value of do_fog used to generat the current texture */
	_fogType : null,
	/** @private The value of game_lsys used to generat the current lsys tex */
	_lastLsys : null,
	/** @private Used by the rocket test to move the rocket */
	_rocketTestCount : 0,

	init : function() {
		this._menuTranslate = [ 0, 0, 0 ];
		this._menuRotate = [ 0, 0, 0 ];
		this._userTranslate = [ 0, 0, 0 ];
		this._userRotate = [ 0, 0, 0 ];
		this._gameTranslate = [ 0, 0, 0 ];
		this._gameRotate = [ 0, 0, 0 ];

		if (!this._first_time) {
			this._first_time = false;
			Battleship.Rocket.init();
			Battleship.Rocket.set_detail(0.1);
			this.ready_rocket();
		}
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
		if (axis < 0 || axis > 2) {
			console.log("View.set_translate: Invalid axis %s.", axis);
			return;
		}

		switch (type) {
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
		if (axis < 0 || axis > 2) {
			console.log("View.set_rotate: Invalid axis %s.", axis);
			return;
		}

		switch (type) {
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

	get_translate : function(axis, type) {
		if (axis < 0 || axis > 2) {
			console.log("Invalid axis to get translate.\n");
			return 0.0;
		}
		var r = 0.0;
		switch (type) {
			case 'u' :
				if (Battleship.Menu.curr_menu) {
					r = this._menuTranslate[axis];
				} else {
					r = this._userTranslate[axis];
				}
			break;
			case 'g' :
				r = this._gameTranslate[axis];
			break;
			default:
				console.log("Unknow type to get translate.\n");
			break;
		}
		return r;
	},

	get_rotate : function(axis, type) {
		if (axis < 0 || axis > 2) {
			console.log("Invalid axis to get rotate.\n");
			return 0.0;
		}
		var r = 0.0;
		switch (type) {
			case 'u' :
				if (Battleship.Menu.curr_menu) {
					r = this._menuRotate[axis];
				} else {
					r = this._userRotate[axis];
				}
			break;
			case 'g' :
				r = this._gameRotate[axis];
			break;
			default:
				console.log("Unknow type to get rotate.\n");
			break;
		}
		return r;
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

		gl.identity();
		gl.translate(0, 0, -50);
	},

	draw : function(gl, width, height) {
		this.set_perspective(gl, width, height);

		// Translation
		if (!Battleship.Menu.curr_menu)
		{
			if (Battleship.Model.do_test === Battleship.Model.enum_testtype.NONE) {
				this._drawStatus(gl);
				gl.translate(this._gameTranslate[0], this._gameTranslate[1] - 4, this._gameTranslate[2]);
				gl.rotate(this._gameRotate[0], 0, 0);
				gl.rotate(0, this._gameRotate[1], 0);
				gl.rotate(0, 0, this._gameRotate[2]);
			}
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

		gl.setDiffuseColor(this._diff_w);
		gl.setSpecularColor(this._spec_w);
		gl.setMaterialShininess(this._shinny_w);

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
				this._drawShips(gl, 0);
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
			case Battleship.Model.enum_testtype.ROCKET:
				Battleship.Rocket.draw(gl, true);
				++this._rocketTestCount;
				if (this._rocketTestCount > 10) {
					this._rocketTestCount = 0;
					if (!Battleship.Rocket.move()) {
						Battleship.Model.game_rocket.type = (Battleship.Model.game_rocket.type + 1) % Battleship.Model.NUM_ROCKET_TYPES;
						this.ready_rocket();
					}
				}
			break;
			default:
				if (Battleship.Menu.curr_menu) {
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
							gl.translate(7.0, 0.0, 0);
							//gl.rotate(0.0, -90, 0.0);
							this._drawRocket(gl);
							if (!Battleship.Rocket.move()) {
								Battleship.Rocket.reset();
							}
						}
					}
				} else {
					//if (do_shadows[SHADOW_ALL]) { drawShadows(); }
					this._drawGame(gl);
				}
			break;
		}
		gl.finish();
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
		// Draw the room
		this._drawCeiling(gl);
		this._drawFloor(gl);
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
		this._drawClock(gl);
		this._drawMug(gl);

		var p;
		var game_state = Battleship.Model.game_state;
		for (p = 0; p < 2; p++)
		{
			gl.translate(0.0, 0.0, BOARD_GAP);

			this._drawPegs(gl, p);
			this._drawExtraPegs(gl, p);
			this._drawBorder(gl);
			this._drawShips(gl, p);

			gl.pushMatrix();
				gl.translate(0.0, GRID_TOP_Y, GRID_TOP_Z);
				if (game_state === Battleship.Model.enum_gamestate.PLAYING ||
					game_state === Battleship.Model.enum_gamestate.AI_PLAYING)
				{
					this._drawGridSelect(gl, p);
				}
				this._drawGrid(gl);

				gl.translate(0.0, -GRID_TOP_Y + GRID_BOTTOM_Y, -GRID_TOP_Z + GRID_BOTTOM_Z);
				gl.rotate(90, 0, 0);
				gl.rotate(0, 180, 0);
				this._drawGrid(gl);

				//fog
				if (Battleship.Model.player[p].fog &&
					!(game_state === Battleship.Model.enum_gamestate.PLACE_SHIPS && p === Battleship.Model.curr_player))
				{
					this._drawFog(gl);
				}
			gl.popMatrix();

			this._drawPicture(gl, p);

			if (p === Battleship.Model.curr_player && Battleship.Model.game_state === Battleship.Model.enum_gamestate.FIREING) {
				this._drawRocket(gl);
			}

			gl.rotate(0, 180, 0);
		}
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
						o.vertex(0, 0, BLOCK_DEPTH);
						o.vertex(BLOCK_DIM, 0, BLOCK_DEPTH);
						o.vertex(BLOCK_DIM, BLOCK_DIM, BLOCK_DEPTH);
						o.vertex(0, BLOCK_DIM, BLOCK_DEPTH);
						//Left
						if (x === 0)
						{
							o.setNormal(-1, 0, 0);
							o.vertex(0, 0, 0);
							o.vertex(0, 0, BLOCK_DEPTH);
							o.vertex(0, BLOCK_DIM, BLOCK_DEPTH);
							o.vertex(0, BLOCK_DIM, 0);
						}
						//Rigt
						if (x === GRID_DIM - 1)
						{
							o.setNormal(1, 0, 0);
							o.vertex(BLOCK_DIM, 0, BLOCK_DEPTH);
							o.vertex(BLOCK_DIM, 0, 0);
							o.vertex(BLOCK_DIM, BLOCK_DIM, 0);
							o.vertex(BLOCK_DIM, BLOCK_DIM, BLOCK_DEPTH);
						}
						//Top
						if (y === GRID_DIM - 1)
						{
							o.setNormal(0, 1, 0);
							o.vertex(0, BLOCK_DIM, 0);
							o.vertex(0, BLOCK_DIM, BLOCK_DEPTH);
							o.vertex(BLOCK_DIM, BLOCK_DIM, BLOCK_DEPTH);
							o.vertex(BLOCK_DIM, BLOCK_DIM, 0);
						}
						//Bottom
						if (y === 0)
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
		var shinny_water = 1;

		gl.setDiffuseColor(diff_water);
		gl.setSpecularColor(spec_water);
		gl.setMaterialShininess(shinny_water);
		gl.setFragmentColor(1.0, 1.0, 1.0, 0.4);
		gl.draw(this._grid);
		gl.setFragmentColor(1.0, 1.0, 1.0, 1.0);
	},

	_drawGridSelect : function(gl, pnum) {
		var diff = [0.0, 0.2, 0.9];
		var spec = [0.0, 0.0, 0.0];
		var shinny = 1;

		if (!this._gridSelector) {
			var o = new GLObject('grid_selector');
			this._gridSelector = o;
			o.pushMatrix();
				glprimitive.box(o, 0, 0, 0, BLOCK_DIM, BLOCK_DIM, BLOCK_DEPTH);
			o.popMatrix();
		}
		gl.setDiffuseColor(diff);
		gl.setSpecularColor(spec);
		gl.setMaterialShininess(shinny);
		gl.pushMatrix();
			gl.translate(
				-Battleship.Model.GRID_DIM/2.0 + BLOCK_REAL_DIM * Battleship.Model.player[pnum].sel_x,
				BLOCK_REAL_DIM * (Battleship.Model.GRID_DIM - 1)-BLOCK_REAL_DIM * Battleship.Model.player[pnum].sel_y,
				-BLOCK_DEPTH/2.0);
			gl.draw(this._gridSelector);
		gl.popMatrix();
	},

	_drawBorder : function(gl) {
		var diff = [0.1, 0.1, 0.1];
		var spec = [0.1, 0.1, 0.1];
		var shinny = 1;

		if (!this._borderMain) {
			var GRID_DIM = Battleship.Model.GRID_DIM;
			var G = BORDER_WIDTH;
			var left = -GRID_DIM/2.0 * BLOCK_REAL_DIM - SLOT_WIDTH + G;
			var bottom = GRID_BOTTOM_Y - BLOCK_DEPTH/2.0 - G;
			var top = GRID_TOP_Y + GRID_DIM * BLOCK_REAL_DIM + BORDER_TOP_GAP + G;

			//Top
			var o = new GLObject('border_main');
			this._borderMain = o;
			//Left Side
			glprimitive.box(o, left, bottom, 0, G, top - bottom, BORDER_TOP_WIDTH);
			//Right Side
			glprimitive.box(o, -left - G, bottom, 0, G, top - bottom, BORDER_TOP_WIDTH);
			//Top
			glprimitive.box(o, left, top - G, 0, -2*left, G, BORDER_TOP_WIDTH);
			//Planes in the Middle of top Board (or the back)
			//char 0 to -G if BOARD_GAP != 0
			glprimitive.box(o, left, bottom, 0, 2*-left, top - bottom, G);
			//Bottom
			top = 0;
			var front = GRID_DIM * BLOCK_REAL_DIM + GRID_BOTTOM_Z + G + BORDER_BOTTOM_GAP;
			//Left Side
			glprimitive.box(o, left, bottom, 0, G, top - bottom, front);
			//Right
			glprimitive.box(o, -left - G, bottom, 0, G, top - bottom, front);
			//Bottom
			glprimitive.box(o, left, bottom, 0, -2*left, G, front);
			top = GRID_BOTTOM_Y + BLOCK_DEPTH/2.0;
			//front
			glprimitive.box(o, left, bottom, front - G, -2*left, top - bottom, G);
			//Peg Divider Front facing player
			glprimitive.box(o, -left - SLOT_WIDTH + G, bottom, SLOT_HEIGHT - G, SLOT_WIDTH - G, top - bottom, G);
			//Status thing
			o.begin(GLObject.GL_QUADS);
				o.setNormal(0, 1, 1);
				o.vertex(left + G, bottom + G, GRID_BOTTOM_Z);
				o.vertex(-left - G, bottom + G, GRID_BOTTOM_Z);
				o.vertex(-left - G, GRID_TOP_Y, G);
				o.vertex(left + G, GRID_TOP_Y, G);
			o.end();

			//Right decal
			left = -GRID_DIM/2.0*BLOCK_REAL_DIM - SLOT_WIDTH + BLOCK_REAL_DIM;
			top = GRID_TOP_Y + GRID_DIM*BLOCK_REAL_DIM - 0.1;
			bottom = GRID_TOP_Y + 0.1;
			front = GRID_TOP_Z;
			o = new GLObject('border_right');
			this._borderRight = o;
			o.begin(GLObject.GL_QUADS);
				o.setNormal(0, 0, 1);
				o.setTexCoord(0.0, 0.0);
				o.vertex(left, top, front);
				o.setTexCoord(0.0, 1.0);
				o.vertex(left, bottom, front);
				o.setTexCoord(1.0, 1.0);
				o.vertex(left + 2.5*BLOCK_REAL_DIM, bottom, front);
				o.setTexCoord(1.0, 0.0);
				o.vertex(left + 2.5*BLOCK_REAL_DIM, top, front);
			o.end();

			//Left decal
			left = GRID_DIM/2.0*BLOCK_REAL_DIM+SLOT_WIDTH/2.0-1.5*BLOCK_REAL_DIM;
			o = new GLObject('border_left');
			this._borderLeft = o;
			o.begin(GLObject.GL_QUADS);
				o.setNormal(0, 0, 1);
				o.setTexCoord(0.0, 0.0);
				o.vertex(left, top, front);
				o.setTexCoord(0.0, 1.0);
				o.vertex(left, bottom, front);
				o.setTexCoord(1.0, 1.0);
				o.vertex(left + 2.5*BLOCK_REAL_DIM, bottom, front);
				o.setTexCoord(1.0, 0.0);
				o.vertex(left + 2.5*BLOCK_REAL_DIM, top, front);
			o.end();
		}

		gl.setDiffuseColor(diff);
		gl.setSpecularColor(spec);
		gl.setMaterialShininess(shinny);
		gl.draw(this._borderMain);

		gl.setDiffuseColor(this._diff_w);
		gl.setSpecularColor(this._spec_w);
		gl.setMaterialShininess(this._shinny_w);
		this._enableTexture(gl, this._loadImageTexture(gl, 'left'));
		gl.draw(this._borderLeft);
		this._enableTexture(gl, this._loadImageTexture(gl, 'right'));
		gl.draw(this._borderRight);
		this._disableTexture(gl);
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

	_drawPegs : function(gl, pnum) {
		var white = true;
		var GRID_DIM = Battleship.Model.GRID_DIM;
		pnum = 1 - pnum; //want other players stats

		//set default material
		gl.setDiffuseColor(this._diff_w);
		gl.setSpecularColor(this._spec_w);
		gl.setMaterialShininess(this._shinny_w);

		gl.pushMatrix();
		//Go to top left
		gl.translate(-(GRID_DIM/2.0)*BLOCK_REAL_DIM + BLOCK_REAL_DIM/2.0,
			GRID_DIM*BLOCK_REAL_DIM + GRID_TOP_Y - BLOCK_REAL_DIM/2.0,
			GRID_TOP_Z + BLOCK_DEPTH/2.0 - PEG_LEN_2);
		var x, y;
		for (x = 0; x < GRID_DIM; x++)
		{
			gl.pushMatrix();
			for (y = 0; y < GRID_DIM; y++)
			{
				//check for miss/hit
				var miss = Battleship.Model.player[pnum].grid[x][y] === Battleship.Model.enum_gridstate.MISS;
				var hit = Battleship.Model.player[pnum].grid[x][y] === Battleship.Model.enum_gridstate.HIT;

				//set colour
				if (miss && !white)
				{
					gl.setDiffuseColor(this._diff_w);
					gl.setSpecularColor(this._spec_w);
					gl.setMaterialShininess(this._shinny_w);
					white = true;
				}
				else if (hit && white)
				{
					gl.setDiffuseColor(this._diff_r);
					gl.setSpecularColor(this._spec_r);
					gl.setMaterialShininess(this._shinny_w);
					white = false;
				}

				//draw peice
				if (miss || hit) {
					this._drawPeg(gl);
				}

				gl.translate(0.0, -BLOCK_REAL_DIM, 0.0);
			}
			gl.popMatrix();
			gl.translate(BLOCK_REAL_DIM, 0.0, 0.0);
		}
		gl.popMatrix();
	},

	_drawExtraPegs : function(gl, pnum) {
		//desribes location of red pegs, each location is reltitive to the privious
		var GRID_DIM = Battleship.Model.GRID_DIM;
		var MAX_HITS = Battleship.Model.MAX_HITS;
		var MAX_MISSES = Battleship.Model.MAX_MISSES;
		var red =
		[
			[((GRID_DIM+1)/2.0)*BLOCK_REAL_DIM, GRID_BOTTOM_Y, GRID_BOTTOM_Z, 0, 0, 0],
			[0, 0, PEG_DIAM_1, 0, 90, 0],
			[-0.5, 0, 0.5, 0, -45, 0],
			[-0.5, 0, PEG_LEN_1 + PEG_LEN_2, 0, -45, 0],
			[-0.5, 0, 0, 0, 0, 0],
			[-0.5, 0, -0.5, 0, 0, 0],
			[0.6, PEG_DIAM_2, 0, 0, -45, 0],
			[0, 0, 0, 0, -100, 0],
			[-2.2, -2*PEG_DIAM_2, -0.6, 0, 55, 0],
			[1.0, 0, 0.0, 0, 0, 0],
			[0.5, 0, 0, 0, 45, 0],
			[-0.5, 0.5, 0, 15, 0, 0],
			[-0.8, -0.2, 0.2, 0, -160, 0],
			[0.5, 0.5, -1, 15, 250, 0],
			[0.5, 0.2, -0.2, 0, 120, 0],
			[0.4, 0, -0.4, 0, 185, 0],
			[2.4, 0.0, 0.5, 0, 240, 0]
		];

		var num_hit_pegs = MAX_HITS - Battleship.Model.player[pnum].num_hits;
		var num_miss_pegs = (MAX_MISSES - (MAX_HITS) - Battleship.Model.player[pnum].num_misses)/2;

		//red pegs
		gl.setDiffuseColor( this._diff_r );
		gl.setSpecularColor( this._spec_r );
		gl.setMaterialShininess( this._shinny_r );
		gl.pushMatrix();
		var i;
		for (i = 0; i < num_hit_pegs; i++) {
			gl.translate(red[i][0], red[i][1], red[i][2]);
			gl.rotate(red[i][3], 0, 0);
			gl.rotate(0, red[i][4], 0);
			gl.rotate(0, 0, red[i][5]);
			this._drawPeg(gl);
		}
		gl.popMatrix();

		//white pegs
		gl.setDiffuseColor( this._diff_w );
		gl.setSpecularColor( this._spec_w );
		gl.setMaterialShininess( this._shinny_w );
		gl.pushMatrix();
		gl.translate(0.0, 0.0, SLOT_HEIGHT - GRID_BOTTOM_Z);
		var j;
		for (i = 0, j = 0; i < MAX_HITS && j < num_miss_pegs; i++, j++) {
			gl.translate(red[i][0], red[i][1], red[i][2]);
			gl.rotate(red[i][3], 0, 0);
			gl.rotate(0, red[i][4], 0);
			gl.rotate(0, 0, red[i][5]);
			this._drawPeg(gl);
		}
		gl.popMatrix();
		gl.pushMatrix();
		gl.translate(0.0, 0.0, SLOT_HEIGHT);
		for (i = 0; i < MAX_HITS && j < num_miss_pegs; i++, j++) {
			gl.translate(red[i][0], red[i][1], red[i][2]);
			gl.rotate(red[i][3], 0, 0);
			gl.rotate(0, red[i][4], 0);
			gl.rotate(0, 0, red[i][5]);
			this._drawPeg(gl);
		}
		gl.popMatrix();
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
			case Battleship.Model.enum_shiptype.CARRIER: this._drawCarrier(gl); break;
			case Battleship.Model.enum_shiptype.BATTLESHIP: this._drawBattleship(gl); break;
			case Battleship.Model.enum_shiptype.DESTROYER: this._drawDestroyer(gl); break;
			case Battleship.Model.enum_shiptype.SUB: this._drawSub(gl); break;
			case Battleship.Model.enum_shiptype.PT: this._drawPT(gl); break;
			default:
				console.log("Invalid ship to drawShip %i\n", snum);
			break;
		}
	},

	_drawShips : function(gl, pnum) {
		var SHIP_LOC =
		[
			[-BLOCK_REAL_DIM/2.0, 0, 0, 0, 0, 0],
			[-BLOCK_REAL_DIM/2.0-BLOCK_REAL_DIM, 0, BLOCK_REAL_DIM*3, 0, 0, 0],
			[-BLOCK_REAL_DIM/2.0-BLOCK_REAL_DIM*2, 0, 0, 0, 0, 0],
			[-BLOCK_REAL_DIM/2.0, 0, BLOCK_REAL_DIM*(Battleship.Model.MAX_SHIP_LEN+1), 0, 0, 0],
			[-BLOCK_REAL_DIM/2.0-BLOCK_REAL_DIM*2, 0, BLOCK_REAL_DIM*Battleship.Model.MAX_SHIP_LEN+1, 0, 0, 0]
		];

		var i;
		for (i = 0; i < Battleship.Model.NUM_SHIPS; i++)
		{
			gl.pushMatrix();

			//move to orign of grid
			gl.translate(-(Battleship.Model.GRID_DIM/2.0)*BLOCK_REAL_DIM,
				GRID_BOTTOM_Y + BLOCK_DEPTH/2.0,
				GRID_BOTTOM_Z + BLOCK_REAL_DIM/2.0);

			//draw ships that are on the grid
			if (Battleship.Model.player[pnum].ship[i].state !== Battleship.Model.enum_shipstate.NOT_PLACED) {
				if (Battleship.Model.player[pnum].ship[i].state === Battleship.Model.enum_shipstate.SHIP_PLACING) {
					gl.translate(0.0, 1.0, 0.0);
				}

				if (Battleship.Model.player[pnum].ship[i].down) {
					//translate to right grid
					gl.translate(
						Battleship.Model.player[pnum].ship[i].x*BLOCK_REAL_DIM + BLOCK_REAL_DIM/2.0,
						0.0,
						Battleship.Model.player[pnum].ship[i].y*BLOCK_REAL_DIM - BLOCK_REAL_DIM/2.0);
				} else {
					gl.translate(
						Battleship.Model.player[pnum].ship[i].x*BLOCK_REAL_DIM,
						0.0,
						Battleship.Model.player[pnum].ship[i].y*BLOCK_REAL_DIM);
					//rotate ship
					gl.rotate(0.0, 90, 0.0);
				}
			} else {
				//draw ships that are in the holder
				//move to other players holder
				gl.translate(SHIP_LOC[i][0], SHIP_LOC[i][1], SHIP_LOC[i][2]);
				gl.rotate(SHIP_LOC[i][3], 0, 0);
				gl.rotate(0, SHIP_LOC[i][4], 0);
				gl.rotate(0, 0, SHIP_LOC[i][5]);
			}

			//don't draw the ship if fog is on
			if (!Battleship.Model.player[pnum].fog ||
				(Battleship.Model.game_state === Battleship.Model.enum_gamestate.PLACE_SHIPS && pnum === Battleship.Model.curr_player))
			{
				gl.setDiffuseColor(this._diff_ship);
				gl.setSpecularColor(this._spec_ship);
				gl.setMaterialShininess(this._shinny_ship);
				this._drawShip(gl, i);
			}

			//draw hit pegs
			//translate to center of square
			if (Battleship.Model.player[pnum].ship[i].down) {
				gl.translate(0.0, 0.0, BLOCK_REAL_DIM/2.0);
			} else {
				gl.translate(0.0, 0.0, BLOCK_REAL_DIM/2.0);
			}
			gl.rotate(-90, 0, 0);

			var j;
			var hscale = (Battleship.Model.player[pnum].ship[i].down) ? 0 : 1;
			var vscale = (Battleship.Model.player[pnum].ship[i].down) ? 1 : 0;

			//get peg ready
			gl.setDiffuseColor( this._diff_r );
			gl.setSpecularColor( this._spec_r );
			gl.setMaterialShininess( this._shinny_r );
			var player, x, y;
			for (j = 0; j < Battleship.Model.player[pnum].ship[i].length; j++) {
				player = Battleship.Model.player[pnum];
				x = player.ship[i].x + j*hscale;
				y = player.ship[i].y + j*vscale;
				if (player.grid[x][y] === Battleship.Model.enum_gridstate.HIT) {
					this._drawPeg(gl);
				}
				gl.translate(0.0, -BLOCK_REAL_DIM, 0.0);
			}

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
		for (i = 0; i < menu.size; i++) {
			if (menu.item[i]) {
				len = menu.item[i].name.length;
				if (menu.item[i].svalue) {
					len += menu.item[i].svalue.length + 2;
				}
				max_len = (max_len < len) ? len : max_len;
			}
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
			var o;
			var len = Battleship.Menu.name_selector.name.length;
			if (len < Battleship.Model.MAX_NAME_LEN) {
				if (!this._nameSelectorCurr) {
					o = new GLObject('nameselector_curr');
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
				o = new GLObject('nameselector_container');
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
			this._enableTexture(gl, this._fogTexture);
		}
		gl.draw(this._fog);
		this._disableTexture(gl);
	},

	_drawPicture : function(gl, pnum) {
		var diff = [0.6, 0.4, 0.0];
		var spec = [0.1, 0.1, 0.1];
		var shinny = 1.0;
		var o;

		gl.pushMatrix();

		if (pnum === 0) {
			gl.translate(20, 6, ROOM_DIM/2.0 - 0.1);
		} else {
			gl.translate(-20, 8, ROOM_DIM/2.0 - 0.1);
		}

		//frame
		if (!this._pictureFrame) {
			o = new GLObject('picture_frame');
			this._pictureFrame = o;
			//left
			glprimitive.box(o, -PICTURE_DIM/2.0 - PICTURE_FRAME_R,
							-PICTURE_DIM/2.0 - PICTURE_FRAME_R,
							-PICTURE_FRAME_R,
							PICTURE_FRAME_R,
							PICTURE_DIM + PICTURE_FRAME_R*2.0,
							PICTURE_FRAME_R);
			//right
			glprimitive.box(o, PICTURE_DIM/2.0,
							-PICTURE_DIM/2.0 - PICTURE_FRAME_R,
							-PICTURE_FRAME_R,
							PICTURE_FRAME_R,
							PICTURE_DIM + PICTURE_FRAME_R * 2.0,
							PICTURE_FRAME_R);
			//top
			glprimitive.box(o, -PICTURE_DIM/2.0,
							PICTURE_DIM/2.0,
							-PICTURE_FRAME_R,
							PICTURE_DIM,
							PICTURE_FRAME_R, PICTURE_FRAME_R);
			//top
			glprimitive.box(o, -PICTURE_DIM/2.0,
							-PICTURE_DIM/2.0 - PICTURE_FRAME_R,
							-PICTURE_FRAME_R,
							PICTURE_DIM,
							PICTURE_FRAME_R, PICTURE_FRAME_R);
		}
		gl.setDiffuseColor( diff );
		gl.setSpecularColor( spec );
		gl.setMaterialShininess( shinny );
		this._enableTexture(gl, this._loadImageTexture(gl, 'table'));
		gl.draw(this._pictureFrame);

		//picture
		if (!this._pictureCanvas) {
			o = new GLObject('picture_canvas');
			this._pictureCanvas = o;
			o.begin(GLObject.GL_QUADS);
				o.setNormal(0.0, 0.0, -1.0);
				o.setTexCoord(0, 0);
				o.vertex(-PICTURE_DIM/2.0, PICTURE_DIM/2.0, -PICTURE_FRAME_R/2.0);
				o.setTexCoord(0, 1);
				o.vertex(-PICTURE_DIM/2.0, -PICTURE_DIM/2.0, -PICTURE_FRAME_R/2.0);
				o.setTexCoord(1, 1);
				o.vertex(PICTURE_DIM/2.0, -PICTURE_DIM/2.0, -PICTURE_FRAME_R/2.0);
				o.setTexCoord(1, 0);
				o.vertex(PICTURE_DIM/2.0, PICTURE_DIM/2.0, -PICTURE_FRAME_R/2.0);
			o.end();
		}
		gl.setDiffuseColor( this._diff_w );
		gl.setSpecularColor( this._spec_w );
		gl.setMaterialShininess( this._shinny_w );
		if (pnum === 0) {
			this._enableTexture(gl, this._loadImageTexture(gl, 'pic1'));
		} else {
			this._enableTexture(gl, this._loadImageTexture(gl, 'pic2'));
		}
		gl.draw(this._pictureCanvas);
		this._disableTexture(gl);
		gl.popMatrix();
	},

	_drawTable : function(gl) {
		var ypos = -TABLE_HEIGHT + TABLE_TOP;
		var o;

		if (!this._tableTop) {
			o = new GLObject('table_top');
			this._tableTop = o;
			glprimitive.box(o, -TABLE_WIDTH/2.0,
							ypos,
							-TABLE_DEPTH/2.0,
							TABLE_WIDTH, TABLE_HEIGHT, TABLE_DEPTH);
		}

		if (!this._tableLegs) {
			o = new GLObject('table_legs');
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
		this._enableTexture(gl, this._loadImageTexture(gl, 'table'));
		gl.draw(this._tableTop);
		this._disableTexture(gl);

		//legs
		gl.setDiffuseColor([0.1, 0.1, 0.1]);
		gl.setSpecularColor([0.1, 0.1, 0.1]);
		gl.setMaterialShininess(1);
		gl.draw(this._tableLegs);
	},

	_drawStatus : function(gl) {
		var size = 0.8;
		var w = glfont.char_width(size);
		var player = Battleship.Model.player[Battleship.Model.curr_player];
		var text;
		var len;
		gl.pushMatrix();
		switch (Battleship.Model.game_state) {
			case Battleship.Model.enum_gamestate.PLACE_SHIPS:
				//Draw text
				text = "Place Your Ships";
				len = text.length;
				gl.translate(-w*len/2.0, glfont.char_height(size)*1.5, 5.0);
				glfont.draw_string(gl, text, size);

				//Draw player name
				var len2 = player.name.length;
				gl.translate(w*(len/2.0 - len2/2.0), glfont.char_height(size)*2.0, 0.0);
				glfont.draw_string(gl, player.name, size);
			break;
			case Battleship.Model.enum_gamestate.PLAYING:
			case Battleship.Model.enum_gamestate.AI_PLAYING:
				//Draw message
				gl.translate(FONT_X0, FONT_Y0 + 1, 0.0);
				glfont.draw_string(gl, "Ready to fire!", size);
				//Draw grid coordinate
				gl.translate(0.0, -glfont.char_height(size)*2.0, 0.0);
				var c = ['(', '\0', '-', '\0', ')', '\0'];
				c[1] = String.fromCharCode(player.sel_x + 65);
				c[3] = String.fromCharCode(player.sel_y + 48);
				glfont.draw_string(gl, c.join(), size);

				//Draw player name
				len = player.name.length;
				gl.translate(-FONT_X0 + FONT_X1 - len* w,
								glfont.char_height(size)*2.0, 0.0);
				glfont.draw_string(gl, player.name, size);
				gl.translate(len*w, -glfont.char_height(size)*2.0, 0.0);

				//Draw player type
				text = Battleship.Model.aitype_s[player.ai];
				len = text.length;
				gl.translate(-w*len, 0.0, 0.0);
				glfont.draw_string(gl, text, size);
			break;
			case Battleship.Model.enum_gamestate.MESSAGE:
			case Battleship.Model.enum_gamestate.GAME_OVER:
				var diff_water = [0.0, 0.2, 0.9];
				var spec_water = [0.0, 0.0, 0.0];
				var shinny_water = 1;

				var game_message = Battleship.Model.game_message;

				size = 0.4*game_message.size;
				w = glfont.char_width(size);

				if (game_message.type === Battleship.Model.enum_gridstate.MISS) {
					gl.setDiffuseColor(diff_water);
					gl.setSpecularColor(spec_water);
					gl.setMaterialShininess(shinny_water);
					gl.setFragmentColor(1.0, 1.0, 1.0, 0.8);
				} else {
					gl.setDiffuseColor( this._diff_r );
					gl.setSpecularColor( this._spec_r );
					gl.setMaterialShininess( this._shinny_r );
				}

				gl.translate(0.0, 0.0, Battleship.Model.GRID_DIM*BLOCK_REAL_DIM + SLOT_WIDTH);
				text = null;
				if (Battleship.Model.game_message.ship) {
					text = "Sunk!";
					len = Battleship.Model.game_message.ship.length;
					gl.translate(-w*len/2.0,
							glfont.char_height(size)*1.5,
							0.0);
					glfont.draw_string(gl, Battleship.Model.game_message.ship, size);
					gl.translate(w*len/2.0 - w*text.length/2.0,
							-glfont.char_height(size)*2.0,
							0.0);
					glfont.draw_string(gl, text, size);
				} else if (Battleship.Model.game_message.type === Battleship.Model.enum_gridstate.EMPTY) {
					//Game over
					text = "Game Over";
					len = text.length;
					gl.translate(-w*len/2.0,
							glfont.char_height(size)*2.5,
							0.0);
					glfont.draw_string(gl, text, size);
					//Players name
					gl.translate(w*len/2.0 - w*player.name.length/2.0,
							-glfont.char_height(size)*2.0,
							0.0);
					glfont.draw_string(gl, player.name, size);
					//Wins
					text = "Wins!";
					gl.translate(w*player.name.length/2.0 -w*text.length/2.0,
								-glfont.char_height(size)*2.0,
								0.0);
					glfont.draw_string(gl, text, size);
				} else {
					if (game_message.type === Battleship.Model.enum_gridstate.MISS) {
						text = "Miss";
					} else {
						text = "Hit";
					}
					gl.translate(-w*text.length/2.0, 0.0, 0.0);
					glfont.draw_string(gl, text, size);
				}

				gl.setFragmentColor(1.0, 1.0, 1.0, 1.0);
			break;
		}
		gl.popMatrix();
	},

	_drawClock : function(gl) {
		gl.pushMatrix();
			gl.translate(
				-Battleship.Model.GRID_DIM/2.0 * BLOCK_REAL_DIM - SLOT_WIDTH - 2,
				0.0,
				1 + GRID_BOTTOM_Z );
			gl.rotate(0.0, 40, 0.0);
			gl.translate(-1.0, 0.2, 0.0);
			glprimitive.clock(gl, 2.0, 15);
		gl.popMatrix();
	},

	_drawMug : function(gl) {
		gl.pushMatrix();
			gl.translate(
				Battleship.Model.GRID_DIM/2.0 * BLOCK_REAL_DIM + SLOT_WIDTH + 2,
				0.0,
				-2 - GRID_BOTTOM_Z );
			gl.rotate(0.0, 30, 0.0);
			glprimitive.mug(gl, 2.0, 15);
			if (Battleship.Model.do_textures) {
				if (!this._coffeeObject) {
					this._coffeeObject = new GLObject('coffee');
					glprimitive.disk(this._coffeeObject, 2.0, 15);
				}
				this._enableTexture(gl, this._loadImageTexture(gl, 'coffee'));
				gl.setDiffuseColor([0.6, 0.3, 0.1]);
				gl.setSpecularColor([0.1, 0.1, 0.1]);
				gl.setMaterialShininess(1);
				gl.rotate(-90, 0.0, 0.0);
				gl.translate(0.0, 0.0, 2.1);
				gl.draw(this._coffeeObject);
				this._disableTexture(gl);
			}
		gl.popMatrix();
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

		this._enableTexture(gl, this._loadImageTexture(gl, 'ceiling'));
		gl.draw(this._ceiling);
		this._disableTexture(gl);
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

		this._enableTexture(gl, this._loadImageTexture(gl, 'floor'));
		gl.draw(this._floor);
		this._disableTexture(gl);
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
			this._enableTexture(gl, this._lsysTexture);
		}
		gl.draw(this._wall);
		this._disableTexture(gl);
	},

	ready_rocket : function() {
		if (Battleship.Model.game_rocket.type === Battleship.Model.enum_rockettype.OFF) { return; }

		var path = this.rocket_path[Battleship.Model.game_rocket.type];
		path[(PATH_SIZE*3 + 1) - 1] =
		-(GRID_BOTTOM_Z + BLOCK_REAL_DIM * Battleship.Model.player[Battleship.Model.curr_player].sel_y)
		- BLOCK_REAL_DIM*0.5;
		path[(PATH_SIZE*3 + 1) - 3] =
		(Battleship.Model.GRID_DIM*0.5 - Battleship.Model.player[Battleship.Model.curr_player].sel_x)*BLOCK_REAL_DIM
		- BLOCK_REAL_DIM*0.5;

		Battleship.Rocket.set_path(path);
	},

	_drawRocket : function(gl) {
		if (Battleship.Model.game_rocket.type === Battleship.Model.enum_rockettype.OFF) { return; }
		Battleship.Rocket.draw(gl, Battleship.Model.game_rocket.show_path);
	},

	_loadImageTexture : function(gl, id) {
		if (Battleship.Model.do_textures && !this._textures[id]) {
			this._textures[id] = gl.loadImageTexture('data/' + id + '.png', Battleship.View.refresh);
		}
		return this._textures[id];
	},

	_enableTexture : function(gl, texture) {
		if (Battleship.Model.do_textures) {
			gl.uniform1i(gl.useTexturesUniform, true);
			gl.bindTexture(gl.TEXTURE_2D, texture);
		}
	},

	_disableTexture : function(gl) {
		if (Battleship.Model.do_textures) {
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
				data[di] = 200;
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
