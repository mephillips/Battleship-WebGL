/**
 * @fileOverview
 *
 * Contains code for the particle system used by rocket fire
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
 */

/**
 * @namespace
 */
psystem = {
	/** The maximum number of particles */
	MAX_NUM_PARTICLES : 250,

	/** The average spin */
	SPIN_MEAN : 15,
	/** The spin variance */
	SPIN_VAR : 5,
	/** The particle life variance */
	LIFE_VAR : 0.4,
	/** The average number of particels generated per frame */
	MEAN_GEN : 500,
	/** The particle generation variance */
	VAR_GEN : 250,

	/** How many fire colours there are */
	NUM_PSYSTEM_COLOURS : 4,
	/** The possible rocket paths */
	enum_colour : {
		ORANGE : 0,
		BLUE : 1,
		RAINBOW : 2,
		RANDOM : 3
	},

	_psystem : {
		/** The radius of particle origin */
		radius : 0,
		/** The radius of particle destination */
		radius2 : 0,
		/** The distance from the origin to the destination */
		len : 0,
		/** What colour scheme to use */
		colour : 0,
		/** The particles */
		particles : []
	},

	/** String representation of fire colours */
	colours_s : [
		"Orange ",
		"Blue   ",
		"Rainbow",
		"Random "
	],

	/** Initilizes a particle system with the given parameters
	 *  @param r1 The orign radius
	 *  @param r2 The destination radius
	 *  @param len The distance between the orign and destination
	 *  @param c The colour scheme to use
	 */
	init : function(r1, r2, len, c) {
		var psys = this._psystem;
		psys.radius = r1;
		psys.radius2 = r2;
		psys.len = len;
		psys.num_particles = 0;
		psys.colour = c;
	},

	/** Addvances all of the particles in the system and generates new particles
	 */
	advance : function() {
		var psys = this._psystem;

		//used so only the pre existing particles will be advanced
		var orig_size = psys.particles.length;

		//generate a new particle
		var num = Math.floor(this._rand2(this.MEAN_GEN, this.VAR_GEN));
		while (num > 0 && psys.particles.length < this.MAX_NUM_PARTICLES) {
			this._new_particle();
			--num;
		}

		//advance particles
		var i = 0;
		while (i < orig_size && i < psys.particles.length) {
			if (this._advance_particle(psys.particles[i])) {
				++i;
			} else {
				var lastParticle = psys.particles.pop();
				if (i < psys.particles.length) {
					psys.particles[i] = lastParticle;
				}
			}
		}
	},

	/** Draws all the particles in the system.
	 *  @param gl	A WebGL context to draw to.
	 */
	draw : function(gl) {
		var psys = this._psystem;

		if (!this._particleObject) {
			var o = new GLObject('psystem_particle');
			this._particleObject = o;
			glprimitive.box(o, -0.5, -0.5, -0.5, 1, 1, 1);
		}

		gl.setSpecularColor([ 0.1, 0.1, 0.1 ]);
		gl.setMaterialShininess(1);

		var i = 0;
		while (i < psys.particles.length) {
			var p = psys.particles[i];

			//determine colour
			var t = p.pos[2]/psys.len;
			var colour = [];
			switch (psys.colour) {
				case this.enum_colour.ORANGE:
					colour[0] = 1;
					colour[1] = 0.3;
					colour[2] = 0.3;
				break;
				case this.enum_colour.BLUE:
					colour[0] = 1 - 1*Math.sqrt(t*t);
					colour[1] = 1 - 1*Math.sqrt(t*t);
					colour[2] = 1;
				break;
				case this.enum_colour.RAINBOW:
					t *= 2.0;
					if (t < 1.0) {
						colour[0] = 0 + 1*Math.sqrt(t*t);
						colour[1] = 1 - 1*Math.sqrt(t*t);
						colour[2] = 0;
					} else {
						t -= 1;
						colour[0] = 1*Math.sqrt(t);
						colour[1] = 0;
						colour[2] = 1*Math.sqrt(t*t);
					}
				break;
				case this.enum_colour.RANDOM:
					colour[0] = this._rand1(1.0);
					colour[1] = this._rand1(1.0);
					colour[2] = this._rand1(1.0);
				break;
			}
			gl.setDiffuseColor(colour);

			gl.pushMatrix();
				//move
				gl.translate(p.pos[0], p.pos[1], p.pos[2]);
				//spin
				gl.rotate(p.rot[0], 1.0, 0.0, 0.0);
				gl.rotate(p.rot[1], 0.0, 1.0, 0.0);
				gl.rotate(p.rot[2], 0.0, 0.0, 1.0);
				//draw
				gl.scale(p.size, p.size, p.size);
				gl.draw(this._particleObject);
			gl.popMatrix();
			++i;
		}
	},

	/** Adances the given particel
	 *  @param p The particle to advance
	 *  @return Returns true if the particle is still alive. false otherwise
	 */
	_advance_particle : function(p) {
		var i;
		for (i = 0; i < 3; i++) {
			p.pos[i] += p.dir[i];
			p.rot[i] += p.spin[i];
			if (p.rot[i] > 360.0) {
				p.rot[i] = 0.0;
			}
		}

		if (p.life > 0) {
			--p.life;
			return true;
		} else {
			return false;
		}
	},

	/** Generates a new particle
	 * TODO: Make this an object
	 */
	_new_particle : function() {
		var psys = this._psystem;

		var p = {}
		psys.particles.push(p);

		p.size = this._rand2(psys.radius/6.0, psys.radius/8.0);

		//pick a randum place on the circle
		var angle = this._rand1(360);
		var r = this._rand2(psys.radius/2.0, psys.radius/2.0);
		p.pos = [ r*Math.cos(angle*Math.PI/180), r*Math.sin(angle*Math.PI/180), 0 ];

		//The point at the end of the path
		var r2 = this._rand2(psys.radius2/2.0, psys.radius2/2.0);
		var x2 = r2*Math.cos(angle*Math.PI/180);
		var y2 = r2*Math.sin(angle*Math.PI/180);
		//Direction
		p.dir = [ x2 - p.pos[0], y2 - p.pos[1], psys.len ];
		//Normalize then multiply by a speed
		var n = p.dir[0]*p.dir[0] + p.dir[1]*p.dir[1] + p.dir[2]*p.dir[2];
		n = this._rand2(psys.len/4.0, psys.len/8.0)/Math.sqrt(n);
		p.dir[0] *= n;
		p.dir[1] *= n;
		p.dir[2] *= n;

		//pick a random spin
		p.spin = [];
		p.spin[0] = this._rand2(this.SPIN_MEAN, this.SPIN_VAR);
		p.spin[1] = this._rand2(this.SPIN_MEAN, this.SPIN_VAR);
		p.spin[2] = this._rand2(this.SPIN_MEAN, this.SPIN_VAR);
		p.rot = [];
		p.rot[0] = p.spin[0] * p.spin[1];
		p.rot[1] = p.spin[1] * p.spin[2];
		p.rot[2] = p.spin[2] * p.spin[0];

		p.life = Math.floor(this._rand2((psys.len/p.dir[2])*0.8, this.LIFE_VAR));
	},

	/** Returns a random number in the range [0..max)
	 *  @param max The maximum value
	 */
	_rand1 : function(max) { return max*Math.random(); },

	/** Returns a number close to the given mean
	 *  @param mean The mean value
	 *  @param v The maximum variance from the mean
	 */
	_rand2 : function(mean, v) { return mean + 2*v*Math.random() - v; }
};
