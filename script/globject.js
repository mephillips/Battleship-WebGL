GLObject = function(id) {
	this._id = id;
	this._stored = false;

	// The current draw type as passed to begin()
	this._type = null;

	// The current normal and tex coord
	this._normal = [1, 0, 0];
	this._texCoord = [0, 0];

	this._nMatrix = new J3DIMatrix4();
	this._mvMatrix = new J3DIMatrix4();
	this._mvStack = [];

	// Hold GLVertexData objects while drawing
	this._currentData = null;
	// Reserve 0 for tringles and 1 for lines
	this._vertexData = [null, null];

	// Holds the stored GLVertexObjects
	this._vertexObjects = [];
}

GLObject.GL_LINES = 1;
GLObject.GL_LINE_LOOP = 2;
GLObject.GL_TRIANGLES = 4;
GLObject.GL_TRIANGLE_FAN = 6;
GLObject.GL_QUADS = 7;
GLObject.GL_QUAD_STRIP = 8;

GLObject.prototype.setNormal = function(x,y,z) {
	this._normal = [ x, y, z ];
}

GLObject.prototype.setTexCoord = function(tx, ty) {
	this._texCoord = [ tx, ty ];
}
/**
 * Begin a drawing type
 */
GLObject.prototype.begin = function(type) {
	if (this._stored) {
		throw Error('GLObject ' + this._id + ' has already been stored');
	}
	this._type = type;
	switch (type) {
		case GLObject.GL_QUADS:
		case GLObject.GL_QUAD_STRIP:
		case GLObject.GL_TRIANGLES:
		case GLObject.GL_TRIANGLE_FAN:
			// These draw types are just tringles so we can reuse the same
			// object
			if (this._vertexData[0] === null) {
				this._vertexData[0] = new GLVertexData(GLObject.GL_TRIANGLES, this._id + '0');
			}
			this._currentData = this._vertexData[0];
			this._currentData.drawType = type;
		break;
		case GLObject.GL_LINES:
		case GLObject.GL_LINE_LOOP:
			// These draw types are just lines so we can reuse the same
			// object
			if (this._vertexData[1] === null) {
				this._vertexData[1] = new GLVertexData(GLObject.GL_LINES, this._id + '1');
			}
			this._currentData = this._vertexData[1];
			this._currentData.drawType = type;
		break;
		default:
			throw Error('GLObject ' + this._id + ' unknown type ' + type);
		break;
	}
}
/**
 * End the current drawing type
 */
GLObject.prototype.end = function() {
	this._type = null;
	this._currentData.generateIndices();
	this._currentData = null;
};
/**
 * Add a vertex to this object
 */
GLObject.prototype.vertex = function(x, y, z) {
	if (!this._currentData) {
		throw Error('GLObject ' + this._id + ' has not had begin called');
	}

	var normal = new J3DIVector3(this._normal);
	normal.multVecMatrix(this._nMatrix);
	var vertex = new J3DIVector3(x, y, z);
	vertex.multVecMatrix(this._mvMatrix);

	this._currentData.normals.push(normal[0]);
	this._currentData.normals.push(normal[1]);
	this._currentData.normals.push(normal[2]);
	this._currentData.vertices.push(vertex[0]);
	this._currentData.vertices.push(vertex[1]);
	this._currentData.vertices.push(vertex[2]);
	this._currentData.texCoords.push(this._texCoord[0]);
	this._currentData.texCoords.push(this._texCoord[1]);
}
GLObject.prototype.pushMatrix = function() {
	this._mvStack.push(new J3DIMatrix4(this._mvMatrix));
}
GLObject.prototype.popMatrix = function() {
	if (this._mvStack.length > 0) {
		this._mvMatrix.load(this._mvStack.pop());
		this._updateNormal();
	}
}
GLObject.prototype.translate = function(x, y, z) {
	this._mvMatrix.translate(x, y, z);
	this._updateNormal();
}
GLObject.prototype.rotate = function(x, y, z) {
	this._mvMatrix.rotate(x, y, z);
	this._updateNormal();
}
GLObject.prototype._updateNormal = function() {
	this._nMatrix = new J3DIMatrix4(this._mvMatrix);
	this._nMatrix.invert();
	this._nMatrix.transpose();
}
/**
 * Generate vertex buffers for the data in this object.
 * Called automatically by draw.
 */
GLObject.prototype.store = function(gl) {
	if (this._stored) { return; }
	if (this._currentData) {
		throw Error('GLObject ' + this._id + ' end has not been called');
	}

	var i;
	for (i = 0; i < this._vertexData.length; ++i) {
		var vertexData = this._vertexData[i];
		if (vertexData) {
			var vertexObject = vertexData.store(gl);
			this._vertexObjects.push(vertexObject);
		}
	}

	this._stored = true;
};
/**
 * Draw this object to the screen
 */
GLObject.prototype.draw = function(gl) {
	if (!this._stored) {
		this.store(gl);
	}

	var i;
	for (i = 0; i < this._vertexObjects.length; ++i) {
		this._vertexObjects[i].draw(gl);
	}
}
/**
 * Free any vertex buffers help by this object.
 */
GLObject.prototype.destroy = function(gl) {
	var i;

	for (i = 0; i < this._vertexObjects.length; ++i) {
		this._vertexObjects[i].destroy(gl);
	}
	this._vertexObjects = [];
	this._vertexData = [];
}

/**
 * A class which handles storing of vertex information and generation of
 * vertex buffers from it.
 */
GLVertexData = function(type, id) {
	this.reset();
	this._finalType = type;
	this._id = id;
}
/**
 * After this function is called this GLVetexData object is safe to reuse.
 */
GLVertexData.prototype.reset = function() {
	this.vertices = [];
	this.texCoords = [];
	this.normals = [];
	this._indices = [];
	this._firstVertex = 0;
}
/**
 * Using the current vertex data generate generate vertex buffers.
 *
 * @return GLVertexBuffer	A GLVertexBuffer object that can be used to
 *							draw the data represented by this object.
 */
GLVertexData.prototype.store = function(gl) {
	console.log('GLVertexData.store id: %s, type: %s, normals: %i, vertixes: %i, indices: %i',
		this._id,
		this._finalType,
		this.normals.length/3,
		this.vertices.length/3,
		this._indices.length );

	var normalObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);

	var texCoordObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);

	var vertexObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	var indexObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexObject);
	if (this._indices.length < 256) {
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this._indices), gl.STATIC_DRAW);
	} else {
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indices), gl.STATIC_DRAW);
	}
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	var result = new GLVertexObject(
		this._id,
		vertexObject,
		normalObject,
		texCoordObject,
		indexObject,
		this._indices.length,
		this._finalType );
	this.reset();
	return result;
}
/**
 * Given the current set of vertex data generate an index list.
 *
 * GL_QUADS and GL_QUAD_STRIP seem not to exist in webgl so I have implemented
 * them with tringles.
 */
GLVertexData.prototype.generateIndices = function() {
	var i;
	var base = this._firstVertex/3;
	var newVertex = (this.vertices.length - this._firstVertex)/3;
	if (newVertex === 0) { return; }
	switch (this.drawType) {
		case GLObject.GL_QUADS:
			var numQuads = Math.floor(newVertex / 4);
			for (i = 0; i < numQuads; ++i) {
				this._indices.push(base);
				this._indices.push(base + 1);
				this._indices.push(base + 3);
				this._indices.push(base + 3);
				this._indices.push(base + 2);
				this._indices.push(base + 1);
				base += 4;
			}
		break;
		case GLObject.GL_QUAD_STRIP:
			var numQuads = Math.floor((newVertex - 2) / 2);
			for (i = 0; i < numQuads; ++i) {
				this._indices.push(base);
				this._indices.push(base + 1);
				this._indices.push(base + 2);
				this._indices.push(base + 2);
				this._indices.push(base + 1);
				this._indices.push(base + 3);
				base += 2;
			}
		break;
		case GLObject.GL_TRIANGLE_FAN:
			var numTriangles = newVertex - 1;
			for (i = 0; i < numTriangles; ++i) {
				this._indices.push(base);
				this._indices.push(base + i);
				this._indices.push(base + i + 1);
			}
		break;
		case GLObject.GL_LINE_LOOP:
			var numLoops = newVertex - 1;
			for (i = 0; i < numLoops; ++i) {
				this._indices.push(base + i);
				this._indices.push(base + i + 1);
			}
		break;
		case GLObject.GL_LINES:
		case GLObject.GL_TRIANGLES:
			for (i = 0; i < newVertex; ++i) {
				this._indices.push(base + i);
			}
		break;
	}
	this._firstVertex = this.vertices.length;
	this.drawType = null;
}

/**
 * A class which handles storing and drawing of vertex buffer data
 */
GLVertexObject = function(id, vertexObject, normalObject, texCoordObject, indexObject, numIndices, type) {
	this._id = id;
	this._vertexObject = vertexObject;
	this._normalObject = normalObject;
	this._texCoordObject = texCoordObject;
	this._indexObject = indexObject;
	this._numIndices = numIndices;
	this._type = type;
}
/**
 * Draw the vertex data represented by this object
 */
GLVertexObject.prototype.draw = function(gl) {
	if (!this._type) { return; }

	// Set up all the vertex attributes for vertices, normals and texCoords
	gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexObject);
	gl.vertexAttribPointer(gl.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this._normalObject);
	gl.vertexAttribPointer(gl.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordObject);
	gl.vertexAttribPointer(gl.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

	// Bind the index array
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexObject);

	// Draw
	var dataSize;
	if (this._numIndices < 256) {
		dataSize = gl.UNSIGNED_BYTE;
	} else {
		dataSize = gl.UNSIGNED_SHORT;
	}
	gl.drawElements(this._type, this._numIndices, dataSize, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}
/**
 * Free vertex buffes held by this object
 */
GLVertexObject.prototype.destroy = function(gl) {
	console.log('GLVertexObject.destroy id: %s', this._id);

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
	this._type = null;
	this._numIndices = null;
}
