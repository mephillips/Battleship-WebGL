/**
 * @fileOverview
 *
 * Contains functions for creating drawing primitives.
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
 *
 *
 * Where noted code used from:
 * freeglut_geometry.c
 *
 * Freeglut geometry rendering methods.
 *
 * Copyright (c) 1999-2000 Pawel W. Olszta. All Rights Reserved.
 * Written by Pawel W. Olszta, <olszta@sourceforge.net>
 * Creation date: Fri Dec 3 1999
 */

/**
 * @namespace
 */
glprimitive = {
	/** @private The default detail level */
	_detail : 10,

	/** @private Holds a refrence do dispaly objects used to draw the clock */
	_clockData : null,

	test : function(gl, r, d) {
		if (!this._testObj) {
			this._testObj = {
				torus : new GLObject('glprimitive_test_torus'),
				cone : new GLObject('glprimitive_test_cone'),
				cylinder : new GLObject('glprimitive_test_cylinder'),
				disk : new GLObject('glprimitive_test_disk'),
				sphere : new GLObject('glprimitive_test_sphere')
			};

			this.torus(this._testObj.torus, r/2, r, d, d);
			this.cone(this._testObj.cone, r/2, r, r, d, d);
			this.cylinder(this._testObj.cylinder, r, r, d, d);
			this.disk(this._testObj.disk, r, d);
			this.sphere(this._testObj.sphere, r, d, d);
		}

		gl.setDiffuseColor( 1.0, 0.0, 0.0 );
		gl.setSpecularColor( 0.1, 0.1, 0.1 );
		gl.setMaterialShininess( 1.0 );

		gl.draw(this._testObj.torus);
		gl.translate(-2*r, 2*r, 0);
		gl.draw(this._testObj.cone);
		gl.translate(4*r, 0, 0);
		gl.draw(this._testObj.cylinder);
		gl.translate(0, -4*r, 0);
		gl.draw(this._testObj.disk);
		gl.translate(-4*r, 0, 0);
		gl.draw(this._testObj.sphere);
	},

	/** Draws a box.
	 *
	 *  The box is drawn with origin x,y,z. It moves away from the orign
	 *  by w along positive x, by h along positive y and by d along positive z.
	 *
	 *  @param o GLObject to draw box into
	 *  @param x X origin
	 *  @param y Y origin
	 *  @param z Z origin
	 *  @param w Width
	 *  @param h Height
	 *  @param d Depth
	 */
	box : function(o, x, y, z, w, h, d) {
		var s = 1.0/(h + w);
		var t = 1.0/(d + h);

		o.begin(GLObject.GL_QUADS);
			//Back
			o.setNormal(0, 0, -1);
			o.setTexCoord(1, 1); o.vertex(x, y + h, z);
			o.setTexCoord(h*s, 1); o.vertex(x + w, y + h, z);
			o.setTexCoord(h*s, d*t); o.vertex(x + w, y, z);
			o.setTexCoord(1, d*t); o.vertex(x, y, z);
			//Front
			o.setNormal(0, 0, 1);
			o.setTexCoord(h*s, 1); o.vertex(x, y, z + d);
			o.setTexCoord(1, 1); o.vertex(x + w, y, z + d);
			o.setTexCoord(1, d*t); o.vertex(x + w, y + h, z + d);
			o.setTexCoord(h*s, d*t); o.vertex(x, y + h, z + d);
			//Left
			o.setNormal(-1, 0, 0);
			o.setTexCoord(0, 0); o.vertex(x, y, z);
			o.setTexCoord(0, d*t); o.vertex(x, y, z + d);
			o.setTexCoord(h*s, d*t); o.vertex(x, y + h, z + d);
			o.setTexCoord(h*s, 0); o.vertex(x, y + h, z);
			//Right
			o.setNormal(1, 0, 0);
			o.setTexCoord(h*s, 0); o.vertex(x + w, y, z + d);
			o.setTexCoord(h*s, d*t); o.vertex(x + w, y, z);
			o.setTexCoord(0, d*t); o.vertex(x + w, y + h, z);
			o.setTexCoord(0, 0); o.vertex(x + w, y + h, z + d);
			//Top
			o.setNormal(0, 1, 0);
			o.setTexCoord(h*s, 0); o.vertex(x, y + h, z);
			o.setTexCoord(h*s, d*t); o.vertex(x, y + h, z + d);
			o.setTexCoord(1, d*t); o.vertex(x + w, y + h, z +d);
			o.setTexCoord(1, 0); o.vertex(x + w, y + h, z);
			//Bottom
			o.setNormal(0, -1, 0);
			o.setTexCoord(h*s, d*t); o.vertex(x + w, y, z);
			o.setTexCoord(h*s, 0); o.vertex(x + w, y, z + d);
			o.setTexCoord(1, 0); o.vertex(x, y, z + d);
			o.setTexCoord(1, d*t); o.vertex(x, y, z);
		o.end();
	},

	/**
	 * Draw a disk with the given radius
	 *
 	 * The disk will be on the x-y plane with normal along positive z.
	 *
	 * @param o			A GLObject to write the disk data into.
	 * @param radius	The radius of the disk to draw.
	 * @param slices	The number of tringles to use when drawing.
	 *
	 */
	disk : function(o, radius, slices) {
		slices = slices || this._detail;
		if (slices < 1) { slices = 1; }

		var i;

		var sint = [];
		var cost = [];
		this.fghCircleTable(sint,cost,-slices);

		o.begin(GLObject.GL_TRIANGLE_FAN);
		o.setNormal(0.0, 0.0, 1.0);
		o.setTexCoord(0.5, 0.5);
		o.vertex(0.0, 0.0, 0.0);
		for (i = 0; i <= slices; ++i) {
			o.setTexCoord(0.5 - 0.5*cost[i], 0.5 - 0.5*sint[i]);
			o.vertex(radius * cost[i], radius * sint[i], 0.0);
		}
		o.end();

		return o;
	},

	/**
	 * Draws a solid sphere.
	 *
	 * @param o			A GLObject to write the disk data into.
	 * @param radius	The radius of the sphere.
	 * @param slices    The number of divisions around the z axis.
     *					(latitudal)
     * @param stacks	The number of divisions along the z axis.
     *                   (longitudal)
	 *
 	 * freeglut_geometry.c
	 */
	sphere : function(o, radius, slices, stacks) {
		slices = slices || this._detail;
		if (slices < 1) { slices = 1; }
		stacks = stacks || this._detail;
		if (stacks < 1) { stacks = 1; }

		var i,j;

		// Adjust z and radius as stacks are drawn.
		var z0,z1;
		var r0,r1;

		// Pre-computed circle

		var sint1 = []; var cost1 = [];
		var sint2 = []; var cost2 = [];

		this.fghCircleTable(sint1,cost1,-slices);
		this.fghCircleTable(sint2,cost2,stacks*2);

		// The top stack is covered with a triangle fan

		z0 = 1.0;
		z1 = cost2[(stacks>0)?1:0];
		r0 = 0.0;
		r1 = sint2[(stacks>0)?1:0];

		o.begin(GLObject.GL_TRIANGLE_FAN);
			o.setNormal(0,0,1);
			o.vertex(0,0,radius);

			for (j=slices; j>=0; j--)
			{
				o.setNormal(cost1[j]*r1,        sint1[j]*r1,        z1       );
				o.vertex(cost1[j]*r1*radius, sint1[j]*r1*radius, z1*radius);
			}
		o.end();

		// Cover each stack with a quad strip, except the top and bottom stacks
		for( i=1; i<stacks-1; i++ )
		{
			z0 = z1; z1 = cost2[i+1];
			r0 = r1; r1 = sint2[i+1];

			o.begin(GLObject.GL_QUAD_STRIP);
				for(j=0; j<=slices; j++)
				{
					o.setNormal(cost1[j]*r1,        sint1[j]*r1,        z1       );
					o.vertex(cost1[j]*r1*radius, sint1[j]*r1*radius, z1*radius);
					o.setNormal(cost1[j]*r0,        sint1[j]*r0,        z0       );
					o.vertex(cost1[j]*r0*radius, sint1[j]*r0*radius, z0*radius);
				}
			o.end();
		}

		// The bottom stack is covered with a triangle fan
		z0 = z1;
		r0 = r1;
		o.begin(GLObject.GL_TRIANGLE_FAN);
			o.setNormal(0,0,-1);
			o.vertex(0,0,-radius);

			for (j=0; j<=slices; j++)
			{
				o.setNormal(cost1[j]*r0,        sint1[j]*r0,        z0       );
				o.vertex(cost1[j]*r0*radius, sint1[j]*r0*radius, z0*radius);
			}
		o.end();
	},

	/**
	 * Draws half solid sphere.
	 *
	 * The back (open part) of the sphere will be on the x-y plane with
	 * the drawn part along positive z
	 *
	 * @param o			A GLObject to write the disk data into.
	 * @param radius	The radius of the sphere.
	 * @param slices    The number of divisions around the z axis.
     *					(latitudal)
     * @param stacks	The number of divisions along the z axis.
     *                   (longitudal)
	 *
 	 * freeglut_geometry.c
	 */
	half_sphere : function(o, radius, slices, stacks) {
		slices = slices || this._detail;
		if (slices < 1) { slices = 1; }
		stacks = stacks || this._detail;
		if (stacks < 1) { stacks = 1; }

		var i,j;

		// Adjust z and radius as stacks are drawn.
		var z0,z1;
		var r0,r1;

		// Pre-computed circle

		var sint1 = []; var cost1 = [];
		var sint2 = []; var cost2 = [];

		this.fghCircleTable(sint1,cost1,-slices);
		this.fghCircleTable(sint2,cost2,stacks*2);

		// The top stack is covered with a triangle fan

		z0 = 1.0;
		z1 = cost2[(stacks>0)?1:0];
		r0 = 0.0;
		r1 = sint2[(stacks>0)?1:0];

		o.begin(GLObject.GL_TRIANGLE_FAN);
			o.setNormal(0,0,1);
			o.vertex(0,0,radius);

			for (j=slices; j>=0; j--)
			{
				o.setNormal(cost1[j]*r1,        sint1[j]*r1,        z1       );
				o.vertex(cost1[j]*r1*radius, sint1[j]*r1*radius, z1*radius);
			}
		o.end();

		// Cover each stack with a quad strip, except the top and bottom stacks
		var halfStacks = stacks/2;
		for( i = 1; i < halfStacks - 1; i++ )
		{
			z0 = z1; z1 = cost2[i+1];
			r0 = r1; r1 = sint2[i+1];

			o.begin(GLObject.GL_QUAD_STRIP);
				for(j=0; j<=slices; j++)
				{
					o.setNormal(cost1[j]*r1,        sint1[j]*r1,        z1       );
					o.vertex(cost1[j]*r1*radius, sint1[j]*r1*radius, z1*radius);
					o.setNormal(cost1[j]*r0,        sint1[j]*r0,        z0       );
					o.vertex(cost1[j]*r0*radius, sint1[j]*r0*radius, z0*radius);
				}
			o.end();
		}
	},

	/**
	 * Draws a solid cylinder.
	 *
 	 * The cylinder will be centered at the origin moving outward along
	 * positive z. It is oriented so that the whole in the center is on
	 * the x-y plane.
	 *
	 * @param o			A GLObject to write the disk data into.
	 * @param radius	The radius of the cylinder.
	 * @param len		The length of the cylinder
	 * @param slices    The number of divisions around the z axis.
     *					(latitudal). (Defaults to this._detail)
     * @param stacks	The number of divisions along the z axis.
     *                   (longitudal). (Defaults to this._detail)
	 *
 	 * freeglut_geometry.c
	 */
	cylinder : function(o, radius, len, slices, stacks) {
		slices = slices || this._detail;
		if (slices < 1 ) { slices = 1; }
		stacks = stacks || this._detail;
		if (stacks < 1) { stacks = 1; }

		var i,j;

		// Step in z and radius as stacks are drawn.
		var z0,z1;
		var r0,r1;

		var z0,z1;
		var zStep = len / stacks;


		// Pre-computed circle
		var sint = [];
		var cost = [];

		this.fghCircleTable(sint,cost,-slices);

		z0 = 0.0;
		z1 = zStep;

		for (i=1; i<=stacks; i++) {
			if (i==stacks)
				z1 = len;

			o.begin(GLObject.GL_QUAD_STRIP);
			for (j=0; j<=slices; j++ )
			{
				o.setNormal(cost[j],        sint[j],        0.0 );
				o.vertex(cost[j]*radius, sint[j]*radius, z0  );
				o.vertex(cost[j]*radius, sint[j]*radius, z1  );
			}
			o.end();

			z0 = z1; z1 += zStep;
		}
	},

	/*
	 * Draws a solid cone.
	 *
	 * The cone moves outward from the origin along positive z. It is oriented
	 * so that the whole in the center is on the x-y plane. The major radius
	 * is the radius of the opening on positive z and the minor radius is the
	 * radius at the origin.
	 *
	 * @param o				A GLObject to write the disk data into.
	 * @param majorRadius	The major radius of the cone
	 * @param minorRadius	The minor radius of the cone
 	 * @param len			The length
	 *
	 * Based on code from freeglut_geometry.c but alterned to match
	 * the functionality from my original code
	 */
	cone : function(o, majorRadius, minorRadius, len, slices, stacks )
	{
		slices = slices || this._detail;
		if (slices < 1 ) { slices = 1; }
		stacks = stacks || this._detail;
		if (stacks < 1) { stacks = 1; }

		var i,j;

		// Step in z and radius as stacks are drawn.
		var z0,z1;
		var r0,r1;

		var rStep = (majorRadius - minorRadius) / stacks;
		var zStep = len / stacks;

		// Scaling factors for vertex normals
		//TODO: Don't know if this is right
		var base = Math.max(majorRadius, minorRadius);
		var height = len;
		var cosn = ( height / Math.sqrt ( height * height + base * base ));
		var sinn = ( majorRadius / Math.sqrt ( height * height + base * base ));

		// Pre-computed circle
		var sint = [];
		var cost = [];

		this.fghCircleTable(sint,cost,-slices);

		z0 = 0.0;
		z1 = zStep;

		r0 = majorRadius;
		r1 = r0 - rStep;

		// Create "stacks" quad strips. Decreasing the radius as we go.
		// rStep and zStep are computed such that after "stacks" strips
		// we will have a radius of minorRadius
		for(i = 0; i < stacks; i++) {
			o.begin(GLObject.GL_QUAD_STRIP);
				for(j = 0; j <= slices; j++) {
					o.setNormal(cost[j]*sinn, sint[j]*sinn, cosn);
					o.vertex(cost[j]*r0,   sint[j]*r0,   z0  );
					o.vertex(cost[j]*r1,   sint[j]*r1,   z1  );
				}
				z0 = z1; z1 += zStep;
				r0 = r1; r1 -= rStep;
			o.end();
		}
	},

	/**
	 * Draw a torus
	 *
	 * The torus will be centered at the origin. It is oriented so that
	 * the whole in the center is on the x-y plane.
	 *
	 * @param o	A GLObject to write the disk data into.
     * @param	dInnerRadius    Radius of ``tube''
     * @param	dOuterRadius    Radius of ``path''
     * @param	nSides          Facets around ``tube''
     * @param	nRings          Joints along ``path''
	 *
 	 * freeglut_geometry.c
	 */
	torus : function(o, dInnerRadius, dOuterRadius, nSides, nRings) {
		nSides = nSides | this._detail;
		nRings = nRings | this._detail;
		if ( nSides < 1 ) nSides = 1;
		if ( nRings < 1 ) nRings = 1;

		var iradius = dInnerRadius;
		var oradius = dOuterRadius;
		var  phi, psi, dpsi, dphi;

		var vertex = [];
		var normal = [];
		var i, j;
		var spsi, cpsi, sphi, cphi;

		// Increment the number of sides and rings to allow for one more point than surface
		nSides ++;
		nRings ++;

		dpsi =  2.0 * Math.PI / (nRings - 1) ;
		dphi = -2.0 * Math.PI / (nSides - 1) ;
		psi  = 0.0;

		for( j=0; j<nRings; j++ )
		{
			cpsi = Math.cos ( psi ) ;
			spsi = Math.sin ( psi ) ;
			phi = 0.0;

			for( i=0; i<nSides; i++ )
			{
				var offset = 3 * ( j * nSides + i ) ;
				cphi = Math.cos( phi ) ;
				sphi = Math.sin( phi ) ;
				vertex[offset] = cpsi * ( oradius + cphi * iradius ) ;
				vertex[offset + 1] = spsi * ( oradius + cphi * iradius ) ;
				vertex[offset + 2] =                    sphi * iradius  ;
				normal[offset + 0] = cpsi * cphi ;
				normal[offset + 1] = spsi * cphi ;
				normal[offset + 2] =        sphi ;
				phi += dphi;
			}

			psi += dpsi;
		}

		o.begin( GLObject.GL_QUADS );
		for( i=0; i<nSides-1; i++ )
		{
			for( j=0; j<nRings-1; j++ )
			{
				var k = 3 * ( j * nSides + i ) ;
				o.setNormal(normal[k], normal[k+1], normal[k+2]);
				o.vertex(vertex[k], vertex[k+1], vertex[k+2]);

				var k2 = k + 3;
				o.setNormal(normal[k2], normal[k2+1], normal[k2+2]);
				o.vertex(vertex[k2], vertex[k2+1], vertex[k2+2]);

				var k3 = k + 3 * nSides + 3;
				o.setNormal(normal[k3], normal[k3+1], normal[k3+2]);
				o.vertex(vertex[k3], vertex[k3+1], vertex[k3+2]);

				var k4 = k + 3 * nSides;
				o.setNormal(normal[k4],normal[k4+1],normal[k4+2]);
				o.vertex(vertex[k4], vertex[k4+1], vertex[k4+2]);
			}
		}
		o.end();
	},

	/**
	 * Draws half a torus.
	 *
	 * The torus is draw the same as torus() but only the portion along positive
	 * y is drawn. Creating a u.
	 *
	 * @param o	A GLObject to write the disk data into.
     * @param	dInnerRadius    Radius of ``tube''
     * @param	dOuterRadius    Radius of ``path''
     * @param	nSides          Facets around ``tube''
     * @param	nRings          Joints along ``path''
	 *
 	 * freeglut_geometry.c
	 */
	half_torus1 : function(o, dInnerRadius, dOuterRadius, nSides, nRings) {
		nSides = nSides | this._detail;
		nRings = nRings | this._detail;
		if ( nSides < 1 ) nSides = 1;
		if ( nRings < 1 ) nRings = 1;

		var iradius = dInnerRadius;
		var oradius = dOuterRadius;
		var  phi, psi, dpsi, dphi;

		var vertex = [];
		var normal = [];
		var i, j;
		var spsi, cpsi, sphi, cphi;

		// Increment the number of sides and rings to allow for one more point than surface
		nSides ++;
		nRings ++;

		dpsi =  2.0 * Math.PI / (nRings - 1) ;
		dphi = -2.0 * Math.PI / (nSides - 1) ;
		psi  = 0.0;

		for( j=0; j<nRings; j++ )
		{
			cpsi = Math.cos ( psi ) ;
			spsi = Math.sin ( psi ) ;
			phi = 0.0;

			for( i=0; i<nSides; i++ )
			{
				var offset = 3 * ( j * nSides + i ) ;
				cphi = Math.cos( phi ) ;
				sphi = Math.sin( phi ) ;
				vertex[offset] = cpsi * ( oradius + cphi * iradius ) ;
				vertex[offset + 1] = spsi * ( oradius + cphi * iradius ) ;
				vertex[offset + 2] =                    sphi * iradius  ;
				normal[offset + 0] = cpsi * cphi ;
				normal[offset + 1] = spsi * cphi ;
				normal[offset + 2] =        sphi ;
				phi += dphi;
			}

			psi += dpsi;
		}

		o.begin( GLObject.GL_QUADS );
		for( i=0; i<nSides-1; i++ )
		{
			var max = nRings - Math.round(nRings/2);
			for( j=0; j< max; j++ )
			{
				var k = 3 * ( j * nSides + i ) ;
				o.setNormal(normal[k], normal[k+1], normal[k+2]);
				o.vertex(vertex[k], vertex[k+1], vertex[k+2]);

				var k2 = k + 3;
				o.setNormal(normal[k2], normal[k2+1], normal[k2+2]);
				o.vertex(vertex[k2], vertex[k2+1], vertex[k2+2]);

				var k3 = k + 3 * nSides + 3;
				o.setNormal(normal[k3], normal[k3+1], normal[k3+2]);
				o.vertex(vertex[k3], vertex[k3+1], vertex[k3+2]);

				var k4 = k + 3 * nSides;
				o.setNormal(normal[k4],normal[k4+1],normal[k4+2]);
				o.vertex(vertex[k4], vertex[k4+1], vertex[k4+2]);
			}
		}
		o.end();
	},

	/**
	 * Draws half a torus.
	 *
	 * The torus is draw the same as torus() but only the portion along positive
	 * z is draw. Leaving the circle complete but the body chopped in half.
	 *
	 * @param o	A GLObject to write the disk data into.
     * @param	dInnerRadius    Radius of ``tube''
     * @param	dOuterRadius    Radius of ``path''
     * @param	nSides          Facets around ``tube''
     * @param	nRings          Joints along ``path''
	 *
 	 * freeglut_geometry.c
	 */
	half_torus2 : function(o, dInnerRadius, dOuterRadius, nSides, nRings) {
		nSides = nSides | this._detail;
		nRings = nRings | this._detail;
		if ( nSides < 1 ) nSides = 1;
		if ( nRings < 1 ) nRings = 1;

		var iradius = dInnerRadius;
		var oradius = dOuterRadius;
		var  phi, psi, dpsi, dphi;

		var vertex = [];
		var normal = [];
		var i, j;
		var spsi, cpsi, sphi, cphi;

		// Increment the number of sides and rings to allow for one more point than surface
		nSides ++;
		nRings ++;

		dpsi =  2.0 * Math.PI / (nRings - 1) ;
		dphi = -2.0 * Math.PI / (nSides - 1) ;
		psi  = 0.0;

		for( j=0; j<nRings; j++ )
		{
			cpsi = Math.cos ( psi ) ;
			spsi = Math.sin ( psi ) ;
			phi = 0.0;

			for( i=0; i<nSides; i++ )
			{
				var offset = 3 * ( j * nSides + i ) ;
				cphi = Math.cos( phi ) ;
				sphi = Math.sin( phi ) ;
				vertex[offset] = cpsi * ( oradius + cphi * iradius ) ;
				vertex[offset + 1] = spsi * ( oradius + cphi * iradius ) ;
				vertex[offset + 2] =                    sphi * iradius  ;
				normal[offset + 0] = cpsi * cphi ;
				normal[offset + 1] = spsi * cphi ;
				normal[offset + 2] =        sphi ;
				phi += dphi;
			}

			psi += dpsi;
		}

		o.begin( GLObject.GL_QUADS );
		for( i=Math.round(nSides/2); i<nSides-1; i++ )
		{
			for( j=0; j< nRings - 1; j++ )
			{
				var k = 3 * ( j * nSides + i ) ;
				o.setNormal(normal[k], normal[k+1], normal[k+2]);
				o.vertex(vertex[k], vertex[k+1], vertex[k+2]);

				var k2 = k + 3;
				o.setNormal(normal[k2], normal[k2+1], normal[k2+2]);
				o.vertex(vertex[k2], vertex[k2+1], vertex[k2+2]);

				var k3 = k + 3 * nSides + 3;
				o.setNormal(normal[k3], normal[k3+1], normal[k3+2]);
				o.vertex(vertex[k3], vertex[k3+1], vertex[k3+2]);

				var k4 = k + 3 * nSides;
				o.setNormal(normal[k4],normal[k4+1],normal[k4+2]);
				o.vertex(vertex[k4], vertex[k4+1], vertex[k4+2]);
			}
		}
		o.end();
	},

	/**
	 *
	 * Compute lookup table of cos and sin values forming a cirle
	 *
	 * @param sint	An empty array in which to put sin values
	 * @param cost	An empty array in which to put cos values
	 * @param n		The size of the table
	 *
 	 * freeglut_geometry.c
	 **/
	fghCircleTable : function(sint, cost, n) {
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
	},

	/** Draws a clock
	 *
	 *  @param gl	A reference to the graphics context
	 *  @param size	How big to draw the clock.
	 *  @param d	Detail to use
	 */
	clock : function(gl, size, detail) {
		var lastSize = null;
		var lastD = null;
		if (this._clockData) {
			lastSize = this._clockData.size;
			lastD = this._clockData.detail;
		}

		if (size !== lastSize || lastD !== detail) {
			if (this._clockData) {
				this._clockData.face.destroy(gl);
				this._clockData.ticksSmall.destroy(gl);
				this._clockData.ticksLarge.destroy(gl);
				this._clockData.center.destroy(gl);
				this._clockData.hand.destroy(gl);
				this._clockData.body.destroy(gl);
			}
			this._clockData = { size : size, detail : detail };

			var i;
			var r1 = (size-size/16.0);
			var r2 = (size-size/8.0);

			//The front face
			this._clockData.face = new GLObject('clock_face');
			glprimitive.disk(this._clockData.face, size*0.98);

			//The ticks
			//I don't like how this is done. I should make it pretty
			var o = new GLObject('clock_ticks_small');
			this._clockData.ticksSmall = o;
			o.begin(GLObject.GL_LINES);
			o.setNormal(0.0, 0.0, 1.0);
			for (i = 0; i < 60; i++)
			{
				var up = Math.sin(2*i*Math.PI/60);
				var over = Math.cos(2*i*Math.PI/60);
				if (i % 5 != 0)
				{
					o.vertex(r1*over, r1*up, 0.1);
					o.vertex(r2*over, r2*up, 0.1);
				}
				else
				{
					o.vertex(r1*over, r1*up, 0.1);
					o.vertex((r2-size/16.0)*over, (r2-size/16.0)*up, 0.1);
				}
			}
			o.end();

			r2 -= size/16.0;
			o = new GLObject('clock_ticks_large');
			this._clockData.ticksLarge = o;
			o.begin(GLObject.GL_LINES);
			for (i = 0; i < 4; i++)
			{
				var up = Math.sin(2*i*Math.PI/4);
				var over = Math.cos(2*i*Math.PI/4);
				o.vertex(r1*over, r1*up, 0.1);
				o.vertex(r2*over, r2*up, 0.1);
			}
			o.end();

			//Circle in center
			o = new GLObject('clock_center');
			this._clockData.center = o;
			glprimitive.disk(o, size/16.0);

			// Clock hand
			o = new GLObject('clock_hand');
			this._clockData.hand = o;
			o.begin(GLObject.GL_LINES);
				o.vertex(0, r2, 0.2);
				o.vertex(0, 0, 0.2);
			o.end()

			o = new GLObject('clock_body');
			this._clockData.body = o;
			//The border
			o.pushMatrix();
				o.translate(0, 0, -size/4.0);
				glprimitive.cylinder(o, size, size/2.0, detail, detail);
				o.pushMatrix();
					o.rotate(0.0, 180.0, 0.0);
					glprimitive.disk(o, size, detail);
				o.popMatrix();
			o.popMatrix();

			//The legs
			o.pushMatrix();
			for (i = 0; i < 2; ++i) {
				o.pushMatrix();
					o.translate(-size - size/32.0,-size - size/16.0,-size/4.0);
					o.rotate(0.0, 0.0, -45);
					//Bottom
					glprimitive.cylinder(o,size/16.0, size/2.0, detail, detail);
					//Cap the bottom
					o.pushMatrix();
						o.translate(0.0, 0.0, size/2.0);
						glprimitive.disk(o, size/16.0, detail);
						o.translate(0.0, 0.0, -size/2.0);
						o.rotate(0.0, 180, 0.0);
						glprimitive.disk(o, size/16.0, detail);
					o.popMatrix();
					//The left and right
					o.rotate(90, 0, 0);
					o.translate(0, size/16.0, -size/2.0);
					glprimitive.cylinder(o,size/16.0, size/2.0, detail, detail);
					o.translate(0.0, size/2.0 - size/8.0, 0.0);
					glprimitive.cylinder(o,size/16.0, size/2.0, detail, detail);
				o.popMatrix();
				o.rotate(0.0, 180, 0.0);
			}
			o.popMatrix();

			//The bells
			o.pushMatrix();
			for (i = 0; i < 2; ++i) {
				o.pushMatrix();
					o.translate(-size/2.0 - size/4.0 - size/16.0, size - size/4.0, 0);
					o.rotate(0.0, 0.0, -45);
					o.rotate(0.0, 90, 0.0);
					//Stick
					glprimitive.cylinder(o,size/16.0, size/8.0, detail, detail);
					//Bell
					o.rotate(0.0, 180, 0.0);
					glprimitive.half_sphere(o, size/4.0, detail, detail);
				o.popMatrix();
				o.rotate(0.0, 180, 0.0);
			}
			o.popMatrix();

			//The stick
			o.translate(0.0, size + size/8.0, 0.0);
			o.rotate(90, 0.0, 0.0);
			glprimitive.cylinder(o, size/16.0, size/8.0, detail, detail);
			o.translate(0.0, 0.0, -size/8.0 + size/16.0);
			glprimitive.sphere(o, size/8.0, detail, detail);
		}

		//The front face
		gl.setDiffuseColor( 0.7, 0.7, 0.7 );
		gl.setSpecularColor( 0.1, 0.1, 0.1 );
		gl.setMaterialShininess( 1.0 );
		gl.draw(this._clockData.face);

		//The ticks
		gl.setDiffuseColor( 0.0, 0.0, 0.0 );
		gl.setSpecularColor( 0.0, 0.0, 0.0 );
		gl.setMaterialShininess( 1.0 );
		gl.lineWidth(size/4.0);
		gl.draw(this._clockData.ticksSmall);
		gl.lineWidth(size/2.0);
		gl.draw(this._clockData.ticksLarge);
		gl.lineWidth(1.0);

		// Hands
		var time = new Date();
		var hour = time.getHours() % 12;
		var min = time.getMinutes();
		var sec = time.getSeconds();

		gl.setDiffuseColor( 0.0, 0.0, 0.0 );
		gl.setSpecularColor( 0.0, 0.0, 0.0 );
		gl.setMaterialShininess( 1.0 );
		gl.lineWidth(size/2);
		//Min hand
		gl.pushMatrix();
			gl.rotate(0.0, 0.0, -6*min);
			gl.draw(this._clockData.hand);
		gl.popMatrix();
		//Hour hand
		gl.pushMatrix();
			gl.rotate(0.0, 0.0, -30*hour);
			gl.scale(0.9, 0.9, 0.9);
			gl.translate(0.0, -0.5, 0.0);
			gl.draw(this._clockData.hand);
		gl.popMatrix();
		gl.lineWidth(1.0);

		//Circle in center
		gl.translate(0.0, 0.0, 0.3);
		gl.draw(this._clockData.center);
		gl.translate(0.0, 0.0, -0.3);

		// The glass
		gl.translate(0, 0, size/4.0-0.1);
		gl.setDiffuseColor( 0.5, 0.5, 0.5 );
		gl.setSpecularColor( 0.1, 0.1, 0.1 );
		gl.setMaterialShininess( 1.0 );
		gl.setFragmentColor(1.0, 1.0, 1.0, 0.6);
		gl.draw(this._clockData.face);
		gl.setFragmentColor(1.0, 1.0, 1.0, 1.0);
		gl.translate(0, 0, -(size/4.0-0.1));

		//The body
		gl.setDiffuseColor( 1.0, 1.0, 0.0 );
		gl.setSpecularColor( 0.5, 0.5, 0.5 );
		gl.setMaterialShininess( 15.0 );
		gl.draw(this._clockData.body);
	},

	/** Draws a mug
	 *
	 *  @param gl	A reference to the graphics context
	 *  @param size How big to draw the mug.
	 *  @param d	Detail to use
	 */
	mug : function(gl, size, detail) {
		var lastSize = null;
		var lastD = null;
		if (this._mugData) {
			lastSize = this._mugData.size;
			lastD = this._mugData.detail;
		}

		if (size !== lastSize || lastD !== detail) {
			if (this._mugData) {
				this._mugData.mug.destroy(gl);
				this._mugData.coffee.destory(gl);
			}
			this._mugData = { size : size, detail : detail };

			var o = new GLObject('mug');
			this._mugData.mug = o;

			//The handel
			o.pushMatrix();
				o.translate(size - size/32.0, size/8.0, 0.0);
				o.rotate(0.0, 0.0, -90);
				glprimitive.half_torus1(o, size/8.0, size/2.0, detail, detail);
			o.popMatrix();
			//Outside
			o.translate(0, -size, 0);
			o.rotate(-90, 0.0, 0.0);
			glprimitive.cylinder(o, size, 2*size, detail, detail);
			//Bottom
			o.rotate(180, 0.0, 0.0);
			glprimitive.disk(o, size*0.99, detail, detail);
			//Rim
			o.rotate(180, 0.0, 0.0);
			o.translate(0.0, 0.0, 2*size);
			glprimitive.half_torus2(o, size/8.0, size - size/8.0,detail,detail);
			//Coffee
			o = new GLObject('mug_coffee');
			this._mugData.coffee = o;
			o.translate(0, size, 0);
			o.rotate(-90, 0, 0);
			glprimitive.disk(o, size - size/4.0, detail, detail);
		}

		gl.setDiffuseColor( 0.7, 0.7, 0.7 );
		gl.setSpecularColor( 0.4, 0.4, 0.4 );
		gl.setMaterialShininess( 15.0 );
		gl.draw(this._mugData.mug);

		gl.setDiffuseColor( 0.4, 0.2, 0.0 );
		gl.setSpecularColor( 0.1, 0.1, 0.1 );
		gl.setMaterialShininess( 1.0 );
		gl.draw(this._mugData.coffee);
	}
};

