/**
 * @fileOverview
 *
 * Contains code for generating Perlin noise effects
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
 * I used these sites and book as a references when creating this:
 *
 * http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
 * http://www.animeimaging.com/asp/PerlinNoise.aspx
 * Shirley,Peter and RMorley Keith ,R. (2001) Realistic Ray Tracing,
 * 	2nd edition. A.K. Peters.
 */

/**
 * @namespace
 */
perlin = {
	/** @private The current seed for the random number generator */
	_seed : 1,

	/** Generates a random number based on x and y.
	 *
	 *  The same random number will always be returned for the same x and y
	 *  when the global value seed remains constant. Seed can be changed to
	 *  produce a different sequence.
	 *
	 *  @param x x value
	 *  @param y y value
	 *  @return Returns a random number, same value always returned for same
	 *  value of x and y
	 */
	/* I would like to make this function use rand. The seed thing I made
	   doesn't make that much senes. The problem with using rand is how 
	   do you get the same number again. The function needs to work so that
	   when you always get the same results for the same values of x and y
	*/
	noise2D : function(x, y) {
		var n;
		n = this._seed * x + y * 57;
		n = (n << 13) ^ n;
		var res = (1.0 - ( (n * (n * n * 15731 + 789221)
			+ 1376312589) & 0x7fffffff ) / 1073741824.0);
		return res;
	},

	/** Performs linear interpolation
	 *  @param a Start value
	 *  @param b End vaule
	 *  @param d Interval size
	 *  @return Returns linearly interpolated value between x and y
	 */
	lin_interp2D : function(a, b, d) {
		return a*(1-d) + b*d;
	},

	/** Performs cosine interpolation
	 *  @param a Start value
	 *  @param b End vaule
	 *  @param d Interval size
	 *  @return Returns cosine interpolated value between x and y
	 */
	cos_interp2D : function(a, b, d) {
		var t = (1 - Math.cos(d * Math.PI)) * 0.5;
		return a*(1 - t) + b*t;
	},

	/** Performs easy curve interpolation
	 *  @param a Start value
	 *  @param b End vaule
	 *  @param d Interval size
	 *  @return Returns easy curve interpolated value between x and y
	 */
	ecurve_interp2D : function(a, b, d) {
		var f1 = 3.0 * Math.pow(1.0 - d, 2.0) - 2.0 * Math.pow(1.0 - d, 3.0);
		var f2 = 3.0 * Math.pow(d, 2.0) - 2.0 * Math.pow(d, 3.0);
		return a*f1 + b*f2;
	},

	/** Performs interpolation (using one of the interpolation functions)
	 *  @param a Start value
	 *  @param b End vaule
	 *  @param d Interval size
	 *  @return Returns interpolated value between x and y
	 */
	interpolate2D : function(a, b, d) {
		return this.ecurve_interp2D(a, b, d);
	},

	/** Performs smoothing (anitaliasing) for given location.
	 *
	 *  Samples from points around point and calculate waited average.
	 *
	 *  @param x x value
	 *  @param y y value
	 *
	 *  @return smoothed value
	 */
	smooth2D : function(x, y) {
		var corners = this.noise2D(x - 1, y - 1) + this.noise2D(x + 1, y - 1) +
					this.noise2D(x - 1, y + 1) + this.noise2D(x + 1, y + 1);
		var sides = this.noise2D(x - 1, y) + this.noise2D(x + 1, y) +
						this.noise2D(x, y - 1) + this.noise2D(x, y + 1);
		var center = this.noise2D(x, y);

		return corners/16.0 + sides/8.0 + center/4.0;
	},

	/** Generates the base perlin number, applying smoothing and interpolation
	 *  @param x The x value
	 *  @param y The y value
	 *  @return The number
	 **/
	gen2D : function(x, y) {
		//There is probably a better more stable way to do this
		var ix = Math.floor(x);
		var fx = x - ix;
		var iy = Math.floor(y);
		var fy = y - iy;

		//find the four corners
		var x0y0 = this.smooth2D(ix, iy);
		var x0y1 = this.smooth2D(ix, iy+ 1);
		var x1y0 = this.smooth2D(ix + 1, iy);
		var x1y1 = this.smooth2D(ix + 1, iy + 1);

		//interpolate on x
		var i1 = this.interpolate2D(x0y0, x1y0, fx);
		var i2 = this.interpolate2D(x0y1, x1y1, fx);

		//Interpolate on y
		return this.interpolate2D(i1, i2, fy);
	},

	/**
	 * Seed the 'random' number generator used by the perlin noise generator
	 */
	seed : function(s) { this._seed = s; },

	perlin2d : function(param, x, y) {
		var total = 0.0;
		var freq = param.freq;
		var amp = 1;

		var i = 0;
		for (i = 0; i < param.octaves; i++) {
			total += this.gen2D(x * freq, y * freq) * amp;
			freq *= 2;
			amp *= param.pers;
		}
		if (total < -1.0) total = -1.0;
		if (total > 1.0) total = 1.0;

		return total;
	}
};
