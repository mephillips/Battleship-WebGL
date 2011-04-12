GLObject = function(id) {
	this._id = id;
	this._stored = false;

	// The current drawing type
	this._type = null;
	// The current normal
	this._normal = [1, 0, 0];
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

GLObject.GL_QUADS = 'quads'
GLObject.GL_QUAD_STRIP = 'quadstrip';
GLObject.GL_TRIANGLES = 'tri';
GLObject.GL_TRIANGLE_FAN = 'trifan';
GLObject.GL_LINES = 'lines';
GLObject.GL_LINE_LOOP = 'lineloop';

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
			i = this._startI;
			var numQuads = Math.floor(newVertex / 4);
			var quadNum;
			for (quadNum = 0; quadNum < numQuads; ++quadNum) {
				this._indices.push(i);
				this._indices.push(i + 1);
				this._indices.push(i + 3);
				this._indices.push(i);
				this._indices.push(i + 3);
				this._indices.push(i + 2);
				i += 4;
			}
		break;
		case GLObject.GL_QUAD_STRIP:
			i = this._startI;
			var numQuads = Math.floor((newVertex - 2) / 2);
			var quadNum;
			for (quadNum = 0; quadNum < numQuads; ++quadNum) {
				this._indices.push(i);
				this._indices.push(i + 1);
				this._indices.push(i + 3);
				this._indices.push(i);
				this._indices.push(i + 3);
				this._indices.push(i + 2);
				i += 2;
			}
		break;
		case GLObject.GL_LINES:
			for (i = this._startI; i < newVertex - 1; ++i) {
				this._indices.push(i);
				this._indices.push(i);
				this._indices.push(i + 1);
			}
		break;
		case GLObject.GL_TRIANGLES:
			for (i = this._startI; i < newVertex; ++i) {
				this._indices.push(i);
			}
		break;
		case GLObject.GL_TRIANGLE_FAN:
			for (i = this._startI; i < newVertex - 1; ++i) {
				this._indices.push(this._startI);
				this._indices.push(i);
				this._indices.push(i + 1);
			}
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

GLObject.prototype.store = function(gl) {
	console.log('GLObject.store id: %s, numNormals: %i, numVertixes: %i, numIndices: %i',
		this._id,
		this._normals.length,
		this._vertices.length,
		this._indices.length );

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
	if (this._indices.length < 256) {
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array(this._indices), gl.STATIC_DRAW);
	} else {
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array(this._indices), gl.STATIC_DRAW);
	}
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	this._numIndices = this._indices.length;
	this._indices = [];

	this._stored = true;
};

GLObject.prototype.draw = function(gl) {
	if (!this._stored) {
		this.store(gl);
	}

	// Set up all the vertex attributes for vertices, normals and texCoords
	gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexObject);
	gl.vertexAttribPointer(gl.vertexAttribPointer, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this._normalObject);
	gl.vertexAttribPointer(gl.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordObject);
	gl.vertexAttribPointer(gl.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

	// Bind the index array
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexObject);

	// Draw
	if (this._numIndices < 256) {
		gl.drawElements(gl.TRIANGLES, this._numIndices, gl.UNSIGNED_BYTE, 0);
	} else {
		gl.drawElements(gl.TRIANGLES, this._numIndices, gl.UNSIGNED_SHORT, 0);
	}
}

GLObject.prototype.destroy = function(gl) {
	this._normals = null;
	this._texCoords = null;
	this._vertices = null;
	this._indices = null;

	this._texCoord = null;
	this._normal = null;

	if (this._vertexObject) {
		gl.deleteBuffer(this._vertexObject);
		this._vertexObject = null;
	}
	if (this._normalObject) {
		gl.deleteBuffer(this._normalObject);
		this._normalObject = null;
	}
	if (this._texCoordObject) {
		gl.deleteBuffer(this._texCoordObject);
		this._texCoordObject = null;
	}
	if (this._indexObject) {
		gl.deleteBuffer(this._indexObject);
		this._indexObject = null;
	}
}
