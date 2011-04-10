/** Increaseing this value will move the two players boards apart */
BOARD_GAP = 0;

/** How far up on the board to draw the vertical grid */
GRID_TOP_Y = 2.0;  	// - For the normal on the diagonl stuff. This 
/** How far out fromt he origin to draw the vertical gird */
GRID_TOP_Z = 0.5;
/** How far up on the board to draw the horizontal grid */
GRID_BOTTOM_Y = -1.5; 
/** How far out fromt he origin to draw the horizonal gird */
GRID_BOTTOM_Z = 2.0;  	// - And this should be equal

/** The depth of grid blocks */
BLOCK_DEPTH = 0.8;
/** The heigh/width of grid blocks */
BLOCK_DIM = 0.9;
/** Grid blocks are drawn with some space around them, this value is how
 *  height/wide they are including that space.
 */
BLOCK_REAL_DIM = 1.0;

/** Width of the overhang at the top of the game */
BORDER_TOP_WIDTH = 1.5;
/** Amount of space between top of grid and top of game */
BORDER_TOP_GAP = 0.5;
/** Amount of space between front of horizontal grid and front of game */
BORDER_BOTTOM_GAP = 0;
/** Width of the cubes that make up the border */
BORDER_WIDTH = 0.2;

/** The width of the slots at the side of the board */
SLOT_WIDTH = 4;
/** The height (along z) of thelarger slot on the right side of the board */
SLOT_HEIGHT = 6;

/** Length of wide part of a peg */
PEG_LEN_1 = BLOCK_DEPTH; 
/** Length of the skinny part of a peg */
PEG_LEN_2 = (BLOCK_DEPTH - 0.2);
/** Diameter of the wide part of a peg */
PEG_DIAM_1 = 0.3;
/** Diameter of the skinny part of a peg */
PEG_DIAM_2 = 0.15;

/** The height of a ships Hull */
SHIP_HULL_HEIGHT = 0.4;
/** The diameter of the ships hull */
SHIP_HULL_DIAM = 0.15;
/** The height of a ships deck */
SHIP_DECK_HEIGHT = 0.2;

/** The left of the screen, for writting font */
FONT_X0 = -16;
/** The right of the screen, for writting font */
FONT_X1 = 16;
/** The top of the screen, for writting font */
FONT_Y0 = 11;
/** The bottom of the screen, for writting font */
FONT_Y1 = -12;

/** The width of the picture frame */
PICTURE_FRAME_R = 0.5;
/** The width/height of the picture */
PICTURE_DIM = 4;

/** The width of the table the game board sits on */
TABLE_WIDTH = 30;
/** The height of the table the game board sits on */
TABLE_HEIGHT = 1.0; 
/** The depth of the table the game board sits on */
TABLE_DEPTH = 26; 
/** The top o the table */
TABLE_TOP = (-(BLOCK_DEPTH/2.0+BORDER_WIDTH) + GRID_BOTTOM_Y);

/** The size of the room width/depth the game is being played in */
ROOM_DIM = 60; 

/** The size of the room height the game is being played in */
ROOM_HEIGHT = 55;

/** The height of the fog cube */
FOG_HEIGHT = (PEG_LEN_2);

/** X Location of light used to cast shadows */
LIGHT_X = 0; 
/** Y Location of light used to cast shadows */
LIGHT_Y = (ROOM_HEIGHT/2.0);
/** Z Location of light used to cast shadows */
LIGHT_Z = 0;

Battleship.View = {
	__canvasId : 'battleship',

	__canvas : null,
	__gl : null,

	__width : null,
	__height : null,

	init : function(gl, canvas) {
		this.__gl = gl;
		this.__canvas = canvas;

		this._curr_menu = null;
		this._userTranslate = [ 0, 0, -50 ];
		this._userRotate = [ 0, 0, 0 ];
		this._gameTranslate = [ 0, 0, 0 ];
		this._gameRotate = [ 0, 0, 0 ];

		this.__initGL(gl);
	},

	/** Gets the current size of the window
	 *
	 *  Used in some places by the game logic.
	 *
	 *  @return	An object { width, height }
	 */
	getsize : function() {
		return { width : this.__canvas.width, height : this.__canvas.height };
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

	__initGL : function(gl) {
		gl.__mvs = [];
		gl.pushMatrix = function() {
			this.__mvs.push(new J3DIMatrix4(this.mvMatrix));
		}
		gl.popMatrix = function() {
			if (this.__mvs.length > 0) {
				this.mvMatrix.load(this.__mvs.pop());
			}
			this.setMatrixUniforms();
		}
		if (!gl) {
			return;
		}

		// Set some uniform variables for the shaders
		gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), 0, 0, 1);
		gl.uniform1i(gl.getUniformLocation(gl.program, "sampler2d"), 0);

		// Load an image to use. Returns a WebGLTexture object
		spiritTexture = gl.loadImageTexture("images/spirit.jpg");

		return gl;
	},

	set_perspective : function(gl) {
		if (this.__canvas.width !== this.__width && this.__canvas.height !== this.__height) {

			this.__width = this.__canvas.width;
			this.__height = this.__canvas.height;

			// Set the viewport and projection matrix for the scene
			gl.viewport(0, 0, this.__width, this.__height);
			gl.perspectiveMatrix = new J3DIMatrix4();
			gl.perspectiveMatrix.perspective(30, this.__width/this.__height, 30.0, 500);
			gl.perspectiveMatrix.lookat(0, 0, 7, 0, 0, 0, 0, 1, 0);
		}

		gl.mvMatrix.makeIdentity();

		if (this._curr_menu) {
			gl.clearColor(0.0, 0.0, 0.4, 1.0);
		} else {
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
		}

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	},

	draw : function() {
		var gl = this.__gl;

		this.set_perspective(gl);

		// Translation
		if (!this._curr_menu)
		{
			//user rotation
			gl.mvMatrix.rotate(this._userRotate[0], 0, 0);
			gl.mvMatrix.rotate(0, this._userRotate[1], 0);
			gl.mvMatrix.rotate(0, 0, this._userRotate[2]);
			gl.mvMatrix.translate(
				this._userTranslate[0],
				this._userTranslate[1],
				this._userTranslate[2]);
		}
		gl.setMatrixUniforms();

		if (!this.__disk) {
			this.__disk = glprimitive.disk(10, 5);
			this.__disk.store(gl);
		}
		gl.bindTexture(gl.TEXTURE_2D, spiritTexture);
		this.__disk.draw(gl);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
};
