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
	/**
	 * Draw a disk with the given radius
	 *
	 * @param radius	The radius of the disk to draw.
	 * @param detail	Controls how many tringles to use when drawing the disk.
	 *
	 */
	disk : function(radius, detail) {
		var NUM_POINTS = detail*10;

		var o = new GLObject();

		o.begin(GLObject.GL_TRIANGLE_FAN);
		o.setNormal(0.0, 0.0, 1.0);
		o.setTexCoord(0.5, 0.5);
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

		return o;
	},

	/**
	 * Draws a solid sphere
	 *
 	 * freeglut_geometry.c
	 */
	solidSphere : function(radius, slices, stacks) {
		var o = new GLObject();

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

		return o;
	},

	/*
	 * Draws a solid cone
 	 * freeglut_geometry.c
	 */
	solidCone : function( base, height, slices, stacks )
	{
		var o = new GLObject();

		var i,j;

		/* Step in z and radius as stacks are drawn. */

		var z0,z1;
		var r0,r1;

		var zStep = height / ( ( stacks > 0 ) ? stacks : 1 );
		var rStep = base / ( ( stacks > 0 ) ? stacks : 1 );

		/* Scaling factors for vertex normals */

		var cosn = ( height / Math.sqrt ( height * height + base * base ));
		var sinn = ( base   / Math.sqrt ( height * height + base * base ));

		/* Pre-computed circle */

		var sint = [];
		var cost = [];

		this.fghCircleTable(sint,cost,-slices);

		/* Cover the circular base with a triangle fan... */

		z0 = 0.0;
		z1 = zStep;

		r0 = base;
		r1 = r0 - rStep;

		o.begin(GLObject.GL_TRIANGLE_FAN);

			o.setNormal(0.0,0.0,-1.0);
			o.vertex(0.0,0.0, z0 );

			for (j=0; j<=slices; j++)
				o.vertex(cost[j]*r0, sint[j]*r0, z0);

		o.end();

		/* Cover each stack with a quad strip, except the top stack */

		for( i=0; i<stacks-1; i++ )
		{
			o.begin(GLObject.GL_QUAD_STRIP);

				for(j=0; j<=slices; j++)
				{
					o.setNormal(cost[j]*sinn, sint[j]*sinn, cosn);
					o.vertex(cost[j]*r0,   sint[j]*r0,   z0  );
					o.vertex(cost[j]*r1,   sint[j]*r1,   z1  );
				}

				z0 = z1; z1 += zStep;
				r0 = r1; r1 -= rStep;

			o.end();
		}

		/* The top stack is covered with individual triangles */

		o.begin(GLObject.GL_TRIANGLES);

			o.setNormal(cost[0]*sinn, sint[0]*sinn, cosn);

			for (j=0; j<slices; j++)
			{
				o.vertex(cost[j+0]*r0,   sint[j+0]*r0,   z0    );
				o.vertex(0,              0,              height);
				o.setNormal(cost[j+1]*sinn, sint[j+1]*sinn, cosn  );
				o.vertex(cost[j+1]*r0,   sint[j+1]*r0,   z0    );
			}

		o.end();

		return o;
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
	}
};

