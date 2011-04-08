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

Battleship = {
	__canvasId : 'battleship',

	__canvas : null,
	__gl : null,

	__width : null,
	__height : null,

	init : function() {
		this.__canvas = document.getElementById(this.__canvasId);
		this.__canvas.width = 640;
		this.__canvas.height = 480;

		this.__gl = this.__initGL();
		if (this.__gl) {
			this.__framerate = new Framerate("framerate");
			this.__animate();
		}
	},

	__initGL : function() {
		// Initialize
		var gl = initWebGL(
			// The id of the Canvas Element
			this.__canvasId,
			// The ids of the vertex and fragment shaders
			"vshader", "fshader",
			// The vertex attribute names used by the shaders.
			// The order they appear here corresponds to their index
			// used later.
			[ "vNormal", "vColor", "vPosition"],
			// The clear color and depth values
			[ 0, 0, 0.5, 1 ], 10000);
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
		gl.setMatrixUniforms = function() {
			// Construct the normal matrix from the model-view matrix and pass it in
			this.normalMatrix.load(this.mvMatrix);
			this.normalMatrix.invert();
			this.normalMatrix.transpose();
			this.normalMatrix.setUniform(this, this.u_normalMatrixLoc, false);

			// Construct the model-view * projection matrix and pass it in
			this.mvpMatrix.load(this.perspectiveMatrix);
			this.mvpMatrix.multiply(this.mvMatrix);
			this.mvpMatrix.setUniform(this, this.u_modelViewProjMatrixLoc, false);
		}
		if (!gl) {
			return;
		}

		// Set some uniform variables for the shaders
		gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), 0, 0, 1);
		gl.uniform1i(gl.getUniformLocation(gl.program, "sampler2d"), 0);

		// Enable texturing
		gl.enable(gl.TEXTURE_2D);

		// Load an image to use. Returns a WebGLTexture object
		spiritTexture = loadImageTexture(gl, "images/spirit.jpg");

		// Create some matrices to use later and save their locations in the shaders
		gl.mvMatrix = new J3DIMatrix4();
		gl.u_normalMatrixLoc = gl.getUniformLocation(gl.program, "u_normalMatrix");
		gl.normalMatrix = new J3DIMatrix4();
		gl.u_modelViewProjMatrixLoc =
				gl.getUniformLocation(gl.program, "u_modelViewProjMatrix");
		gl.mvpMatrix = new J3DIMatrix4();

		// Enable all of the vertex attribute arrays.
		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(2);

		return gl;
	},

	__reshape : function(gl) {
		var canvas = document.getElementById(this.__canvasId);
		if (canvas.width === this.__width && canvas.height === this.__height)
			return;

		this.__width = canvas.width;
		this.__height = canvas.height;

		// Set the viewport and projection matrix for the scene
		gl.viewport(0, 0, this.__width, this.__height);
		gl.perspectiveMatrix = new J3DIMatrix4();
		gl.perspectiveMatrix.perspective(30, this.__width/this.__height, 30.0, 500);
		gl.perspectiveMatrix.lookat(0, 0, 7, 0, 0, 0, 0, 1, 0);
	},

	__animate : function() {
		try {
			Battleship.__drawPicture(Battleship.__gl);
			window.requestAnimFrame(Battleship.__animate, Battleship.__canvas);
		} catch (e) {
			console.log(e);
		}
	},

	__drawPicture : function(gl) {
		this.__reshape(gl);

		// Clear the canvas
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.mvMatrix.makeIdentity();

		gl.mvMatrix.translate(0, 0, -50);
		gl.setMatrixUniforms();
		if (!this.__disk) {
			this.__disk = this.__createDisk(gl, 10);
		}
		gl.bindTexture(gl.TEXTURE_2D, spiritTexture);
		//this.__drawDisk(gl, this.__disk);
		this.__disk.draw(gl);

		// Bind the texture to use
		//this.__disk.draw(gl);
		//this.__box.draw(gl);

		// Show the framerate
		this.__framerate.snapshot();
	},

	__createDisk : function(gl, radius) {
		var detail = 5;
		var NUM_POINTS = detail*10;

		var o = new GLObject();

		o.begin(GLObject.GL_TRIANGLE_FAN);
		o.setNormal(0.0, 0.0, 1.0);
		o.setTexCoord(0.5, 0,5);
		o.vertex(0.0, 0.0, 0.0);
		var i;
		for (i = 0; i <= NUM_POINTS; ++i) {
			var tx = 0.5 + 0.5*Math.cos(2.0*i*Math.PI/NUM_POINTS);
			var ty = 0.5 + 0.5*Math.sin(2.0*i*Math.PI/NUM_POINTS);
			o.setTexCoord(tx, ty);
			var x = radius * Math.cos(2.0*i*Math.PI/NUM_POINTS);
			var y = radius * Math.sin(2.0*i*Math.PI/NUM_POINTS);
			o.vertex(x, y, 0.0);
		}
		o.end();
//		o.store(gl);

		var detail = 5;
		var NUM_POINTS = detail*10;

		var vertices = [];
		var normals = [];
		var texCoords = [];
		var indices = [];
		
		normals.push(0.0); normals.push(0.0); normals.push(1.0);
		texCoords.push(0.5); texCoords.push(0.5);
		vertices.push(0.0); vertices.push(0.0); vertices.push(0.0);
		var i;
		for (i = 0; i <= NUM_POINTS; ++i) {
			normals.push(0.0);
			normals.push(0.0);
			normals.push(1.0);
			texCoords.push(0.5 + 0.5*Math.cos(2.0*i*Math.PI/NUM_POINTS));
			texCoords.push(0.5 + 0.5*Math.sin(2.0*i*Math.PI/NUM_POINTS));
			var x = radius * Math.cos(2.0*i*Math.PI/NUM_POINTS);
			var y = radius * Math.sin(2.0*i*Math.PI/NUM_POINTS);
			vertices.push(x);
			vertices.push(y);
			vertices.push(0.0);
		}

		for (i = 0; i < NUM_POINTS; ++i) {
			indices.push(0);
			indices.push(i);
			indices.push(i + 1);
		}
		indices.push(0);
		indices.push(NUM_POINTS);
		indices.push(1);

	/*
		vertices = Float32Array(vertices);
		normals = Float32Array(normals);
		texCoords = Float32Array(texCoords);
		indices = Uint8Array(indices);
		*/

	/*
		var retval = { };

		retval.normalObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, retval.normalObject);
		gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

		retval.texCoordObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, retval.texCoordObject);
		gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

		retval.vertexObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, retval.vertexObject);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		retval.indexObject = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, retval.indexObject);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		retval.numIndices = indices.length;
		*/

		//return retval;
//		o._vertices = vertices;
//		o._normals = normals;
		o._texCoords = texCoords;
//		o._indices = indices;
		o.store(gl);

		//0, 0, 1, 0, 1, 2, 0, 2, 3 ... 0 49 50 0 50 1

		return o;
	},

	__drawDisk : function(gl, obj) {
        // Set up all the vertex attributes for vertices, normals and texCoords
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexObject);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalObject);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordObject);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        // Bind the index array
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexObject);

        // Draw the cube
        gl.drawElements(gl.TRIANGLES, obj.numIndices, gl.UNSIGNED_BYTE, 0);
	},

	__createBox : function(gl) {
		var o = new GLObject();
		o.addBox(0, 0, 0, 10, 10, 10);
		o.store(gl);
		return o;
	},

	__createCarrier : function(gl) {
		var o = new GLObject();

		var G = 0.1;

		//Back
		o.setNormal(0, 0, -1);
		o.setTexCoord(0, 0);
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

		var G2 = 0.2;
		o.addBox(-PEG_DIAM_1, 
						SHIP_HULL_HEIGHT + SHIP_DECK_HEIGHT, 
						BLOCK_REAL_DIM*2,
						G2, G2, BLOCK_REAL_DIM);
		o.addBox(-PEG_DIAM_1, 
						SHIP_HULL_HEIGHT + SHIP_DECK_HEIGHT + G2, 
						BLOCK_REAL_DIM*2.5 - G2/2.0,
						G2, G2, G2);

		o.store(gl);

		return o;
	},
};

GLObject = function() {
	// The current drawing type
	this._type = null; 
	// The current normal
	this._normal = [0, 0, 0];
	this._texCoord = [0, 0];

	// Hold arrays of things while we are drawing
	this._vertices = [];
	this._texCoords = []
	this._normals = [];
	this._indices = [];

	// Hold references to things once drawing has been stored
	this._vertexObject = null;
	this._texCoordObject = null;
	this._normalObject = null;
	this._indexObject = null;
}

GLObject.GL_QUADS = 'quads';
GLObject.GL_TRIANGLES = 'tri';
GLObject.GL_TRIANGLE_FAN = 'trifan';

GLObject.prototype.setNormal = function(x,y,z) {
	this._normal = [ x, y, z ];
}

GLObject.prototype.setTexCoord = function(tx, ty) {
	this._texCoord = [ tx, ty ];
}

GLObject.prototype.begin = function(type) {
	this._type = type;
	this._startI = this._vertices.length / 3;
}

GLObject.prototype.end = function() {
	var i;
	var count = 0;
	var totalVertex = this._vertices.length/3;
	var newVertex = totalVertex - this._startI;
	switch (this._type) {
		case GLObject.GL_QUADS:
			for (i = this._startI; i < this._vertices.length; ++i) {
				if (count == 3) {
					this.i.push(i - 3);
					this.i.push(i - 1);
					this.i.push(i);
					count = 0;
				}  else {
					this._indices.push(i);
					++count;
				}
			}
		break;	
		case GLObject.GL_TRIANGLES:
			for (i = this._startI; i < this._vertices.length; ++i) {
				this._indices.push(i);
			}
		break;
		case GLObject.GL_TRIANGLE_FAN:
			console.log(this._startI, newVertex, totalVertex, this._vertices.length);
			for (i = this._startI; i < newVertex - 1; ++i) {
				this._indices.push(this._startI);
				this._indices.push(i);
				this._indices.push(i + 1);
			}
			this._indices.push(this._startI);
			this._indices.push(totalVertex - 1);
			this._indices.push(this._startI + 1);
		break;
	}
	this._type = null;
};

GLObject.prototype.vertex = function(x, y, z) {
	this._normals.push(this._normal[0]);
	this._normals.push(this._normal[1]);
	this._normals.push(this._normal[2]);
	this._texCoords.push(this._texCoord[0]);
	this._texCoords.push(this._texCoord[1]);
	this._vertices.push(x);
	this._vertices.push(y);
	this._vertices.push(z);
}

GLObject.prototype.addBox = function(x, y, z, w, h, d) {
	var s = 1.0/(h + w);
	var t = 1.0/(d + h);

	//Back
	this.setNormal(0, 0, -1);
	this.setTexCoord(1, 1); 
	this.vertex(x, y + h, z);
	this.setTexCoord(h*s, 1);
	this.vertex(x + w, y + h, z);
	this.setTexCoord(h*s, d*t);
	this.vertex(x + w, y, z);
	this.setTexCoord(1, d*t);
	this.vertex(x, y, z);
	//Front
	this.setNormal(0, 0, 1);
	this.setTexCoord(h*s, 1);
	this.vertex(x, y, z + d);
	this.setTexCoord(1, 1);
	this.vertex(x + w, y, z + d);
	this.setTexCoord(1, d*t);
	this.vertex(x + w, y + h, z + d);
	this.setTexCoord(h*s, d*t);
	this.vertex(x, y + h, z + d);
	//Left
	this.setNormal(-1, 0, 0);
	this.setTexCoord(0, 0);
	this.vertex(x, y, z);
	this.setTexCoord(0, d*t);
	this.vertex(x, y, z + d);
	this.setTexCoord(h*s, d*t);
	this.vertex(x, y + h, z + d);
	this.setTexCoord(h*s, 0);
	this.vertex(x, y + h, z);
	//Right
	this.setNormal(1, 0, 0);
	this.setTexCoord(h*s, 0);
	this.vertex(x + w, y, z + d);
	this.setTexCoord(h*s, d*t);
	this.vertex(x + w, y, z);
	this.setTexCoord(0, d*t);
	this.vertex(x + w, y + h, z);
	this.setTexCoord(0, 0);
	this.vertex(x + w, y + h, z + d);
	//Top
	this.setNormal(0, 1, 0);
	this.setTexCoord(h*s, 0);
	this.vertex(x, y + h, z); 
	this.setTexCoord(h*s, d*t);
	this.vertex(x, y + h, z + d);
	this.setTexCoord(1, d*t);
	this.vertex(x + w, y + h, z +d);
	this.setTexCoord(1, 0);
	this.vertex(x + w, y + h, z);
	//Bottom
	this.setNormal(0, -1, 0);
	this.setTexCoord(h*s, d*t);
	this.vertex(x + w, y, z);
	this.setTexCoord(h*s, 0);
	this.vertex(x + w, y, z + d);
	this.setTexCoord(1, 0);
	this.vertex(x, y, z + d);
	this.setTexCoord(1, d*t);
	this.vertex(x, y, z);
},

GLObject.prototype.store = function(gl) {
	console.log('GLObject.store numNormals: %i, numVertixes: %i, numIndices: %i\n\tnormals: %o\n\tvertexes %o\n\ttexCoords: %o\n\tindices: %o',
		this._normals.length,
		this._vertices.length,
		this._indices.length,
		this._normals,
		this._vertices,
		this._texCoords,
		this._indices );

	this._normalObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this._normalObject);
	gl.bufferData(gl.ARRAY_BUFFER, Float32Array(this._normals), gl.STATIC_DRAW);
	this._normals = [];

	this._texCoordObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordObject);
	gl.bufferData(gl.ARRAY_BUFFER, Float32Array(this._texCoords), gl.STATIC_DRAW);
	this._texCoords = [];

	this._vertexObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexObject);
	gl.bufferData(gl.ARRAY_BUFFER, Float32Array(this._vertices), gl.STATIC_DRAW);
	this._vertices = [];

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	this._indexObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array(this._indices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	this._numIndices = this._indices.length;
	this._indices = [];

	console.log(this._numIndices, this._normalObject, this._vertexObject, this._texCoordObject, this._indexObject);
};

GLObject.prototype.draw = function(gl) {
	// Set up all the vertex attributes for vertices, normals and texCoords
	gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexObject);
	gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this._normalObject);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordObject);
	gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

	// Bind the index array
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexObject);

	// Draw 
	gl.drawElements(gl.TRIANGLES, this._numIndices, gl.UNSIGNED_BYTE, 0);
}

/**
 *
 * Compute lookup table of cos and sin values forming a cirle
 *
 * @param sint	An empty array in which to put sin values
 * @param cost	An empty array in which to put cos values
 * @param n		The size of the table
 *
 * Notes:
 *    The size of the table is (n+1) to form a connected loop
 *    The last entry is exactly the same as the first
 *    The sign of n can be flipped to get the reverse loop
 *
 * From:
 * freeglut_geometry.c
 *
 * Freeglut geometry rendering methods.
 *
 * Copyright (c) 1999-2000 Pawel W. Olszta. All Rights Reserved.
 * Written by Pawel W. Olszta, <olszta@sourceforge.net>
 * Creation date: Fri Dec 3 1999
 *
 **/
function fghCircleTable(sint, cost, n)
{
    var i;

    /* Table size, the sign of n flips the circle direction */
    const size = Math.abs(n);

    /* Determine the angle between samples */

    const angle = 2*Math.PI/( ( n == 0 ) ? 1.0 : n );

    /* Compute cos and sin around the circle */

    sint[0] = 0.0;
    cost[0] = 1.0;

    for (i=1; i<size; i++)
    {
        sint[i] = Math.sin(angle*i);
        cost[i] = Math.cos(angle*i);
    }

    /* Last sample is duplicate of the first */

    sint[size] = sint[0];
    cost[size] = cost[0];
}
