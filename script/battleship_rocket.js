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
 * Contains the implementaton of the rocket animaton
 *
 */

/**
 * @namespace
 */
Battleship.Rocket = {
	/** The orginal rocket path (including size) */
	path : null,
	/** How small t is divided */
	detail : null,
	/** The current value of t (progress along spline) */
	progress : null,
	/** The points which make up the path to follow */
	points : [],
	/** The current position */
	loc : [],
	/** Used to make the rocket spin, updated on each draw */
	rot_x : null,
	/** Used to orient the rocket */
	rot_y : null,
	/** Used to orient the rocket */
	rot_z : null,
	/** Used to orient the rocket */
	reverse : null,

	/** The current point used as the first point of the spline */
	curr_point : null,
	/** How many points there are on the path */
	num_points : null,

	/** True when the rocket has reached the end of the path */
	__stopped : null,

	/** The size of the rocket */
	rocket_size : null,

	/** GLObject for drawing rocket path */
	_rocketPathObj : null,
	/** GLObject for drawing rocket nose*/
	_rocketNoseObj : null,
	/** GLObject for drawing rocket */
	_rocketWingObj : null,

	/** Inititlizes the rocket */
	init : function() {
		this.rocket_size = 0.2;
		this.detail = 0;
		this.progress = 0;
		this.points = null;
		this.loc[0] = 0;
		this.loc[1] = 0;
		this.loc[2] = 0;
		this.curr_point = 0;
		this.num_points = 0;
		this.__stopped = true;
		this.rot_x = 0;
		this.rot_y = 0;
		this.rot_z = 0;

		this.update();
	},

	/** Puts the rocet back at the start of the path */
	reset : function() {
		this.__stopped = false;

		if (this.points) {
			this.loc[0] = this.points[0];
			this.loc[1] = this.points[1];
			this.loc[2] = this.points[2];
			//calculate an inital rotation
			if (this.num_points > 1) {
				this._calc_rotation(
					this.points[3]-this.points[0],
					this.points[4]-this.points[1],
					this.points[5]-this.points[2] );
			}
		} else {
			this.loc[0] = 0;
			this.loc[1] = 0;
			this.loc[2] = 0;
			this.rot_y = 0;
			this.rot_z = 0;
		}

		this.curr_point = 0;
		this.progress = this.detail;
		this.rot_x = 0;
		//psystem_reset(&fire);
	},

	/** Returns true if the rocket is at the end of its path */
	stopped : function() { return this.__stopped; },

	/** Causes the rocket to move
	 *
	 * Returns true when the rocket has reached the end of its path
	 */
	move : function() {
		//wrap around
		if (this.curr_point >= this.num_points - 2 || !this.points) {
			this.__stopped = true;
			return false;
		}

		//figure out point
		var old_loc = [];
		var i;
		for (i = 0; i < 3; i++) {
			old_loc[i] = this.loc[i];
			this.loc[i] = this._calc_point(this.curr_point, i, this.progress);
		}

		//Find current direction vector
		var x = this.loc[0] - old_loc[0];
		var y = this.loc[1] - old_loc[1];
		var z = this.loc[2] - old_loc[2];

		this._calc_rotation(x, y, z);
		//console.log("%g %g %g - %g %g\n", x, y, z, rot_y, rot_z);

		this.progress += this.detail;
		if (this.progress > 1) {
			this.progress = 0;
			this.curr_point += 2;
		}

		return true;
	},

	/** Draws the rocket
	 *  @param show_path Set to true to draw the rockets path as well as the rocket
	 */
	draw : function(gl, showPath) {
		gl.setDiffuseColor(Battleship.View._diff_w);
		gl.setSpecularColor(Battleship.View._spec_w);
		gl.setMaterialShininess(Battleship.View._shinny_w);

		var o;
		var i;
		if (showPath) {
			if (!this._rocketPathObj) {
				if (this._oldRocketPathObj) {
					this._oldRocketPathObj.destroy(gl);
				}
				o = new GLObject('rocket_path');
				this._rocketPathObj = o;

				o.begin(GLObject.GL_LINES);
					var c = 0;
					var p = 0;
					while (true) {
						if (c >= this.num_points - 2 || !this.points) {
							break;
						}

						var l = [];
						for (i = 0; i < 3; i++) {
							l[i] = this._calc_point(c, i, p);
						}
						o.vertex(l[0], l[1], l[2]);

						p += this.detail;
						if (p > 1) {
							p = 0;
							c += 2;
						}
					}
				o.end();
				//Draw Linear path
				o.begin(GLObject.GL_LINES);
					for (i = 0; i < this.num_points - 1; i++) {
						o.vertex(this.points[i*3], this.points[i*3+1], this.points[i*3+2]);
						o.vertex(this.points[i*3 + 3], this.points[i*3+ 4], this.points[i*3 + 5]);
					}
				o.end();
			}

			gl.lineWidth(2.0);
			gl.draw(this._rocketPathObj);
			gl.lineWidth(1.0);
		}

		gl.pushMatrix();
			//Tranlate to the point and center the rocket
			gl.translate(this.loc[0], this.loc[1], this.loc[2]);

			//Orient correctly
			gl.rotate(0, 0, this.rot_z);
			gl.rotate(0, this.rot_y, 0);
			if (!this.reverse) {
				gl.rotate(0, -90, 0);
			} else {
				gl.rotate(0, 90, 0);
			}

			//Fire!!!
			if (Battleship.Model.game_rocket.draw_fire) {
				gl.pushMatrix();
					gl.translate(0.0, 0.0, this.rocket_size*7.5);
					psystem.advance();
					psystem.draw(gl);
				gl.popMatrix();
			}

			//spin
			this.rot_x = (this.rot_x + 5) % 360;
			gl.rotate(0.0, 0.0, this.rot_x);

			// rocket size
			var scaleFactor = this.rocket_size;
			gl.scale(scaleFactor, scaleFactor, scaleFactor);

			//The nouse
			gl.setDiffuseColor(Battleship.View._diff_r);
			gl.setSpecularColor(Battleship.View._spec_r);
			gl.setMaterialShininess(Battleship.View._shinny_r);
			if (!this._rocketNoseObj) {
				o = new GLObject('rocket_nose');
				this._rocketNoseObj = o;
				o.scale(1.0, 1.0, 2.5);
				glprimitive.sphere(o, 1);
			}
			gl.draw(this._rocketNoseObj);

			//Body
			gl.setDiffuseColor(Battleship.View._diff_w);
			gl.setSpecularColor(Battleship.View._spec_w);
			gl.setMaterialShininess(Battleship.View._shinny_w);
			if (!this._rocketBodyObj) {
				o = new GLObject('rocket_body');
				this._rocketBodyObj = o;
				glprimitive.cylinder(o, 1, 8);
				//o.translate(0.0, 0.0, 8);
				//glprimitive.cone(o, 0.5, 1, -8);
			}
			gl.draw(this._rocketBodyObj);

			if (!this._rocketWingObj) {
				o = new GLObject('rocket_wing');
				this._rocketWingObj = o;
				o.begin(GLObject.GL_TRIANGLES);
					//left
					o.setNormal(0.0, 1.0, 0.0);
					o.vertex(1, 0.0, -2);
					o.vertex(1, 0.0, 0.0);
					o.vertex(3, 0.0, 0.0);
					//right
					o.setNormal(0.0, -1.0, 0.0);
					o.vertex(3, -1/5, 0.0);
					o.vertex(1, -1/5, 0.0);
					o.vertex(1, -1/5, -2);
				o.end();
				o.begin(GLObject.GL_QUADS);
					//back
					o.setNormal(0.0, 0.0, 1.0);
					o.vertex(1, 0.0, 0.0);
					o.vertex(1, -1/5.0, 0.0);
					o.vertex(3, -1/5.0, 0.0);
					o.vertex(3, 0.0, 0.0);
					//front
					o.setNormal(0.5, 0.0, -0.5);
					o.vertex(3, 0.0, 0.0);
					o.vertex(3, -1/5.0, 0.0);
					o.vertex(1, -1/5.0, -2.0);
					o.vertex(1, 0.0, -2.0);
				o.end();
			}
			gl.translate(0.0, 0.0, 8);
			for (i = 0; i < 4; i++) {
				if (i % 2 === 0) {
					gl.setDiffuseColor(Battleship.View._diff_r);
					gl.setSpecularColor(Battleship.View._spec_r);
					gl.setMaterialShininess(Battleship.View._shinny_r);
				} else {
					gl.setDiffuseColor(Battleship.View._diff_w);
					gl.setSpecularColor(Battleship.View._spec_w);
					gl.setMaterialShininess(Battleship.View._shinny_w);
				}
				gl.draw(this._rocketWingObj);
				gl.rotate(0.0, 0.0, 90);
			}
		gl.popMatrix();
	},

	/** Sets the detail of the path (how many intermidiate points are used)
	 *  @param speed A number between 0 and 1. 1 = Fastest
	 */
	set_detail : function(d) { this.detail = d; },

	/** Sets the rockets path
	 * @param points
	 * An array containing the points the rocket should fly through
	 * in groups of 3 (x, y, z). The first element of the array
	 * should represent the number of triples in the array.
	 * So an array with 3 points would by 3 x y z x y z x y z
	 */
	set_path : function(p) {
		this.path = p;
		this.points = p.concat();
		this.num_points = 0;
		if (this.points) {
			this.num_points = this.points.shift();
		}
		this._oldRocketPathObj = this._rocketPathObj;
		this._rocketPathObj = null;
		this.reset();
	},

	/** Returns the rockte path */
	get_path : function() { return this.path; },

	/** Updates some rocket paramaters based on current game value */
	update : function() {
		this.rocket_size = Battleship.Model.game_rocket.size/Battleship.Model.MAX_ROCKET_SIZE;

		var w = 1.0;
		switch (Battleship.Model.game_rocket.width) {
			case Battleship.Model.enum_firewidth.SKINNY: w = 0.5; break;
			case Battleship.Model.enum_firewidth.EQUAL: w = 1.0; break;
			case Battleship.Model.enum_firewidth.WIDE: w = 4.0; break;
		}
		psystem.init(
						this.rocket_size - 0.05,
						this.rocket_size*w,
						this.rocket_size*(Battleship.Model.game_rocket.len)*2.0,
						Battleship.Model.game_rocket.colour
					);
	},

	/** Figures out how the rocket needs to be rotated to point in
	 *  the direction it is moving
	 *  @param x The change in x
	 *  @param y The change in y
	 *  @param z The change in z
	 */
	_calc_rotation : function(x, y, z) {
		var h = Math.sqrt(x*x + y*y);
		var h2 = Math.sqrt(z*z + h*h);

		if (Math.abs(h) >= 0.001) {
			this.reverse = false;
			var rz = 0;
			var ry = 0;
			var nz = 1;
			var ny = 1;

			if (x < 0 && y < 0 && z > 0) {
				ry = 180;
			} else if (x > 0 && y < 0 && z > 0) {
				nz = -1;
				ny = -1;
			} else if (x < 0 && y > 0 && z <= 0) {
				nz = -1;
				ny = -1;
				this.reverse = true;
			} else if (x < 0 && y < 0) {
				rz = 180;
			} else if (z > 0 && x > 0) {
				ry -= 90;
			} else if (z < 0 && x < 0) {
				ry = 90;
			} else if (x < 0 && z > 0) {
				ry = 180;
			} else if (y > 0 && z > 0) {
				ry = -90;
			} else if (y < 0 && z > 0) {
				ry = 180;
			} else if (y < 0 && z <= 0) {
				x = Math.abs(x); y = Math.abs(y); z = Math.abs(z);
				this.rot_z = -Math.acos(x/h)*180/Math.PI;
				this.rot_y = Math.acos(h/h2)*180/Math.PI;
				return;
			}

			x = Math.abs(x); y = Math.abs(y); z = Math.abs(z);
			this.rot_z = nz*Math.acos(x/h)*180/Math.PI + rz;
			this.rot_y = ny*Math.acos(h/h2)*180/Math.PI + ry;
		}
	},

	/** Calculates the next position for the rocket using quadric spline
	 * @param curr The base point
	 * @param comp 0 = x, 1 = y, 2 = z
	 * @param t The distance along the spline
	 *
	 * @return Returns an interpolated point
	 */
	_calc_point : function(curr, comp, t) {
		//return points[curr*3 + comp]*(1.0 - t) + points[(curr + 1)*3 + comp]*t;
		return this.points[curr*3 + comp]*(1.0 - 2*t + t*t)
			 + this.points[(curr + 1)*3 + comp]*(2*t - 2*t*t)
			 + this.points[(curr + 2)*3 + comp]*t*t;
	}
};
