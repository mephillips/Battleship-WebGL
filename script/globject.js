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
			for (i = this._startI; i < newVertex; ++i) {
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
	console.log('GLObject.store numNormals: %i, numVertixes: %i, numIndices: %i',
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
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array(this._indices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	this._numIndices = this._indices.length;
	this._indices = [];
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