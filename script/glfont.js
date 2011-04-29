/**
 * @fileOverview
 *
 * Contains functions for rendering the custom font
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
 */

/**
 * @namespace
 */
var glfont = {
	/** The width (number of characters) of the font test */
	TEST_WIDTH : 8,
	/** The height (rows of characters) of the font test */
	TEST_HEIGHT : 6,

	/** A string containing all the characters of the font, used for
	 *  font test and other things */
	_font_test_str :
		"ABCDEFGH\nIJKLMNOP\nQRSTUVWX\nYZ012345\n6789.:?!\n()/\\=+- ",

	/** Stores GLObjects for each size/character */
	_fontObjects : {},

	/** Draws all the chararacters of the font. Also draws
	 *  a selector behind the given chararacter
	 *
	 *  @param size The size of the font
	 *  @param x The x location of the selector
	 *  @param y The y location of the selector
	 */
	test : function(gl, size, x, y) {
		// Draw all of the letters
		glfont.draw_string(gl, this._font_test_str, size);
		// Create a draw a box that appears under a letter
		if (!this._fontObjects.selector) {
			var o = new GLObject('font_selector');
			this._fontObjects.selector = o;
			glprimitive.box(o, 0, 0, -(size * 0.1), size, size, (size * 0.1));
		}
		gl.setDiffuseColor( 0.5, 0.5, 0.5 );
		gl.setSpecularColor( 0.1, 0.1, 0.1 );
		gl.setMaterialShininess( 1 );
		gl.translate(glfont.char_width(size)*x, -glfont.char_height(size)*y, 0);
		gl.draw(this._fontObjects.selector);
	},

	/** Returns how much space is used by a character for the given sized font
	 *  @param size The size of the font
	 *  @return The character width
	 */
	char_width : function(size) { return size + size*0.1; },

	/** Returns how much space is used by a character for the given sized font
	 *  @param size The size of the font
	 *  @return The character height
	 */
	char_height : function(size) { return size + size*0.1; },

	/** Returns the font character that is selected by glfont_test at x,y
	 *
	 *  @param x x value pased to glfont_test
	 *  @param y y value passed to glfont_test
	 *  @return Returns the selected character
	 */
	test_char : function(x, y) {
		var i = y * (this.TEST_WIDTH + 1) + x;
		return this._font_test_str[i];
	},

	/** Determines if the given character is in the font and returns
	 *  its x/y location in the font test.
	 *
	 *  @param c The character to check
	 *  @param x Pointer to the location to return x
	 *  @param y Pointer to the location to return y
	 *  @return Returns true if the charater is valid. The x and y location
	 *			are returned in x, y only if true is returned otherwise these
	 *			values are untouched
	 */
	is_test_char : function(c, pos) {
		c = c.toUpperCase();
		pos.x = 0;
		pos.y = 0;

		var i = 0;
		var r = false;
		while (true) {
			//Reached a \n. Increament line and move on
			if (pos.x >= this.TEST_WIDTH) {
				pos.x = 0;
				++pos.y;
				++i;
			}

			//End of characters, the given charecter is not valid
			if (pos.y >= this.TEST_HEIGHT) { break; }

			//Found the given character
			if (c === this._font_test_str[i]) {
				r = true;
				break;
			}

			++i;
			++pos.x;
		}
		return r;
	},

	/** Draws a string.
	 *
	 *  @param gl A WebGL context
	 *  @param s The string to draw.
	 *  @param size The font size.
	 */
	draw_string : function(gl, s, size) {
		var r = size * 0.1;
		gl.pushMatrix();
		gl.translate(r, 0.0, 0.0);
		gl.rotate(-90, 0.0, 0.0);
		gl.pushMatrix();
			var i;
			for (i = 0; i < s.length; ++i) {
				glfont.draw_char(gl, s[i], size);
				if (s[i] === '\n') {
					gl.popMatrix();
					gl.translate(0.0, 0.0, -glfont.char_height(size));
					gl.pushMatrix();
				} else {
					gl.translate(glfont.char_width(size), 0.0, 0.0);
				}
			}
		gl.popMatrix();
		gl.popMatrix();
	},

	/** Draws a single character.
	 *
	 *  @param gl A WebGL context
	 *  @param c The character to draw.
	 *  @param size The font size.
	 */
	draw_char : function(gl, c, size) {
		c = c.toUpperCase(c);
		if (!this._fontObjects[c]) {
			this._fontObjects[c] = new GLObject('char_' + c);
			this._draw_char(this._fontObjects[c], c, 1);
		}
		gl.pushMatrix();
			gl.scale(size, size, size);
			gl.draw(this._fontObjects[c]);
		gl.popMatrix();
	},

	_draw_char : function(o, c, size) {
		var r = size * 0.1;
		var d = 10;
		o.pushMatrix();
		switch (c)
		{
			case 'A' :
				//Left
				o.pushMatrix();
					o.rotate(0.0, 24, 0.0);
					o.translate(0.0, 0.0, r);
					glprimitive.cylinder(o, r, size - r);
					//cap
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				//Right
				o.pushMatrix();
					o.translate(size - 2*r, 0.0, 0);
					o.rotate(0.0, -24, 0.0);
					o.translate(0.0, 0.0, r);
					glprimitive.cylinder(o, r, size - r);
					//cap
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				//Bar
				o.rotate(0.0, 90, 0.0);
				o.translate(-size/2.0 + r, 0.0,  2*r);
				glprimitive.cylinder(o, r, size/2.0 - r);
				//Top cap
				o.translate(-size/2.0, 0.0, 2.0*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'B' :
				//Leg plus caps
				o.pushMatrix();
					o.translate(0.0, 0.0, r);
					glprimitive.cylinder(o, r, size - 2*r);
					glprimitive.sphere(o, r, d, d);
					o.translate(0.0, 0.0, size - 2*r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				//curve of b
				o.rotate(90, 0.0, 0.0);
				o.translate(size/2.0, 3*r, 0.0);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90.0);
					glprimitive.half_torus1(o, r, r*2);
				o.popMatrix();
				o.translate(0, size - 6*r, 0.0);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90.0);
					glprimitive.half_torus1(o, r, r*2);
				o.popMatrix();
				//Bars of the b
				o.rotate(0.0, -90, 0.0);
				o.translate(0.0, 2*r, 0);
				glprimitive.cylinder(o, r, size/2.0);
				o.translate(0.0, -4.0*r, 0.0);
				glprimitive.cylinder(o, r, size/2.0);
				o.translate(0.0, -4.0*r, 0.0);
				glprimitive.cylinder(o, r, size/2.0);
			break;
			case 'C' :
				//C
				o.rotate(90, 0.0, 0.0);
				o.rotate(0.0, 180, 0.0);
				o.translate(-size/2.0 + r, size/2.0, 0.0);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90.0);
					glprimitive.half_torus1(o, r, size/2.0 - r);
				o.popMatrix();
				o.rotate(0.0, 0.0, 30);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90.0);
					glprimitive.half_torus1(o, r, size/2.0 - r);
				o.popMatrix();
				o.pushMatrix();
					//cap
					o.translate(0.0, size/2.0 - r,  0.0);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.rotate(0.0, 0.0, -60);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90.0);
					glprimitive.half_torus1(o, r, size/2.0 - r);
				o.popMatrix();
				//cap
				o.translate(0.0, -size/2.0 + r,  0.0);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'D' :
				//The leg
				o.pushMatrix();
					o.translate(0.0, 0.0, r);
					glprimitive.sphere(o, r, d, d);
					glprimitive.cylinder(o, r, size - 2*r);
					o.translate(0.0, 0.0, size - 2*r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.pushMatrix();
					//The bars
					o.rotate(0.0, 90, 0.0);
					o.translate(-r, 0.0, 0.0);
					glprimitive.cylinder(o, r, size/2.0 - 2*r);
					o.translate(-size + 2*r, 0.0, 0.0);
					glprimitive.cylinder(o, r, size/2.0 - 2*r);
				o.popMatrix();
				//The curve
				o.rotate(90, 0.0, 0.0);
				o.translate(size/2.0 - 2*r, size/2.0, 0.0);
				o.rotate(0.0, 0.0, -90);
				glprimitive.half_torus1(o, r, size/2.0 - r);
			break;
			case 'E' :
				//caps
				o.pushMatrix();
					o.translate(0.0, 0.0, r);
					//Stick
					glprimitive.cylinder(o, r, size - 2*r);
					//Cap
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.translate(0.0, 0.0, size - r);
				glprimitive.sphere(o, r, d, d);
				//Bars
				o.translate(size - 2*r, 0.0, 0.0);
				o.rotate(0.0, -90, 0.0);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(-size/2.0 + r, 0.0, 0.0);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(-size/2.0 + r, 0.0, 0.0);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'F' :
				//caps
				o.pushMatrix();
					o.translate(0.0, 0.0, r);
					//Stick
					glprimitive.cylinder(o, r, size - 2*r);
					//Cap
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.translate(0.0, 0.0, size - r);
				glprimitive.sphere(o, r, d, d);
				//Bars
				o.translate(size - 2*r, 0.0, 0.0);
				o.rotate(0.0, -90, 0.0);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(-size/2.0 + r, 0.0, 0.0);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'G' :
				//caps
				o.pushMatrix();
					//The bar
					o.rotate(0.0, 90, 0.0);
					o.translate(-size/2.0, 0.0, size/2.0 - r);
					glprimitive.cylinder(o, r, size/2.0 - r);
					//Cap on bar
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				//top curve
				o.rotate(90, 0.0, 0.0);
				o.rotate(0.0, 180, 0.0);
				o.translate(-size/2.0 + r, size/2.0, 0.0);
				o.rotate(0.0, 0.0, 30);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90);
					glprimitive.half_torus1(o, r, size/2.0 - r);
				o.popMatrix();
				o.pushMatrix();
					//cap
					o.translate(0.0, size/2.0 - r, 0.0);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				//Bottom curve
				o.rotate(0.0, 0.0, -120);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90);
					glprimitive.half_torus1(o, r, size/2.0 - r);
				o.popMatrix();
				//cap
				o.translate(0.0, -size/2.0 + r, 0.0);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'H' :
				//Left
				o.translate(0.0, 0.0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				//Right
				o.translate(size - 2*r, 0.0, 0.0);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, -size + 2*r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				//Center
				o.rotate(0.0, -90, 0.0);
				o.translate(size/2.0 - r, 0.0, 0.0);
				glprimitive.cylinder(o, r, size - 2*r);
			break;
			case 'I' :
				//Middle
				o.translate(size/2.0 - r, 0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				//Bottom
				o.rotate(0.0, 90, 0.0);
				o.translate(0.0, 0.0, -size/2.0 + r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				//Top
				o.translate(-size + 2*r, 0.0, 0.0);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, -size + 2*r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'J' :
				o.pushMatrix();
					//center
					o.translate(size/2.0 - r, 0, 3*r);
					glprimitive.cylinder(o, r, size/2.0 + r);
					//curve
					o.translate(-2*r, 0.0, 0.0);
					o.rotate(90, 0.0, 0.0);
					o.rotate(0.0, 0.0, -90);
					o.pushMatrix();
						o.rotate(0.0, 0.0, -90);
						glprimitive.half_torus1(o, r, r*2);
					o.popMatrix();
					o.rotate(0.0, -90, 0.0);
					//Cap on curve
					o.translate(0.0, -2*r, 0.0);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				//Bottom
				o.rotate(0.0, 90, 0.0);
				o.translate(-size + r, 0.0, 0.0);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'K' :
				//Left
				o.translate(0.0, 0.0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				//angly things
				o.translate(0.0, 0.0, -size/2.0 + r);
				o.rotate(0.0, 125, 0.0);
				glprimitive.cylinder(o, r, size - 3*r);
				o.pushMatrix();
					o.translate(0.0, 0.0, size - 3*r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.rotate(0.0, -69, 0.0);
				glprimitive.cylinder(o, r, size - 3*r);
				o.translate(0.0, 0.0, size - 3*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'L' :
				o.translate(0.0, 0.0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.pushMatrix();
					o.translate(0.0, 0.0, size - 2*r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.rotate(0.0, 90, 0.0);
				glprimitive.cylinder(o, r, size - 2*r);
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'M' :
				//Left
				o.translate(0.0, 0.0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				//caps
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(size - 2*r, 0.0, 0.0);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, -size + 2*r);
				glprimitive.sphere(o, r, d, d);
				//Right
				glprimitive.cylinder(o, r, size - 2*r);
				o.translate(0.0, 0.0, size - 2*r);
				//Middle
				o.pushMatrix();
					o.rotate(0.0, 225, 0.0);
					glprimitive.cylinder(o, r, size/2.0 + r);
				o.popMatrix();
				o.translate(-size + 2*r, 0.0, 0.0);
				o.pushMatrix();
					o.rotate(0.0, -225, 0.0);
					glprimitive.cylinder(o, r, size/2.0 + r);
				o.popMatrix();
				//Middle cap
				o.translate(size/2.0 - r, 0.0, -size/2.0 + r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'N' :
				//Left
				o.translate(0.0, 0.0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				//caps
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(size - 2*r, 0.0, 0.0);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, -size + 2*r);
				glprimitive.sphere(o, r, d, d);
				//Right
				glprimitive.cylinder(o, r, size - 2*r);
				//Middle
				o.translate(0.0, 0.0, 0.0);
				o.rotate(0.0, -45, 0.0);
				glprimitive.cylinder(o, r, size + 1.5*r);
			break;
			case 'O' :
				o.rotate(90, 0.0, 0.0);
				o.rotate(0.0, 180, 0.0);
				o.translate(-size/2.0 + r, size/2.0, 0.0);
				glprimitive.torus(o, r, size/2.0 - r);
			break;
			case 'P' :
				o.translate(0.0, 0.0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				//curve
				o.translate(size/2.0, 0.0, -2.5*r);
				o.rotate(90, 0.0, 0.0);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90);
					glprimitive.half_torus1(o, r, r + 1.5*r);
				o.popMatrix();
				//bars
				o.rotate(0.0, -90, 0.0);
				o.translate(0.0, 2.5*r, 0.0);
				glprimitive.cylinder(o, r, size/2.0);
				o.translate(0.0, -5*r, 0.0);
				glprimitive.cylinder(o, r, size/2.0);
			break;
			case 'Q' :
				o.rotate(90, 0.0, 0.0);
				o.rotate(0.0, 180, 0.0);
				o.translate(-size/2.0 + r, size/2.0, 0.0);
				glprimitive.torus(o, r, size/2.0 - r);
				o.rotate(90, -45, 0.0);
				//stick
				o.translate(0.0, 0.0, 2*r);
				glprimitive.cylinder(o, r, 3*r);
				//caps
				o.translate(0, 0.0, 3*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0, 0.0, -3*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'R' :
				o.translate(0.0, 0.0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				//curve
				o.translate(size/2.0, 0.0, -2.5*r);
				o.rotate(90, 0.0, 0.0);
				o.pushMatrix();
					o.rotate(0, 0.0, -90.0);
					glprimitive.half_torus1(o, r, r + 1.5*r);
				o.popMatrix();
				//bars
				o.rotate(0.0, -90, 0.0);
				o.translate(0.0, 2.5*r, 0.0);
				glprimitive.cylinder(o, r, size/2.0);
				o.translate(0.0, -5*r, 0.0);
				glprimitive.cylinder(o, r, size/2.0);
				//Angled stick
				o.translate(0.0, 0.0, r);
				o.rotate(130, 0.0, 0.0);
				glprimitive.cylinder(o, r, size/2.0 - r);
				o.translate(0.0, 0.0, size/2.0 - r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'S' :
				o.rotate(0.0, 15, 0.0);
				o.translate(-r*1.4, 0.0, r);
				o.pushMatrix();
					o.rotate(0.0, 90, 0.0);
					o.translate(-r, 0.0, 3*r);
					glprimitive.cylinder(o, r, size - 8*r);
					glprimitive.sphere(o, r, d, d);
					o.translate(-size/2.0 + r, 0.0, 0.0);
					glprimitive.cylinder(o, r, size - 8*r);
					o.translate(-size/2.0 + r, 0.0, 0.0);
					glprimitive.cylinder(o, r, size - 8*r);
					o.translate(0.0, 0.0, size - 8*r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.rotate(-90, 0.0, 0.0);
				o.pushMatrix();
					o.translate(size - 5*r, -3*r, 0.0);
					o.rotate(0, 0.0, -90.0);
					glprimitive.half_torus1(o, r, r*2);
				o.popMatrix();
				o.pushMatrix();
					o.rotate(0.0, 0.0, 180);
					o.translate(-3*r, size - 3*r, 0.0);
					o.rotate(0, 0.0, -90.0);
					glprimitive.half_torus1(o, r, r*2);
				o.popMatrix();
			break;
			case 'T' :
				//center
				o.translate(size/2.0 - r, 0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				//top
				o.rotate(0.0, 90, 0.0);
				o.translate(-size + 2*r, 0.0, -size/2.0 + r);
				glprimitive.cylinder(o, r, size - 2*r);
				//caps
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'U' :
				//Curve
				o.rotate(-90, 0.0, 0.0);
				o.rotate(0.0, 0.0, 90);
				o.translate(-size/2.0, -size/2.0 + r, 0.0);
				o.pushMatrix();
					o.rotate(0, 0.0, -90.0);
					glprimitive.half_torus1(o, r, size/2.0 - r);
				o.popMatrix();
				//Cylinder
				o.rotate(0.0, 90, 0.0);
				o.translate(0.0, size/2.0 - r, -size/2.0 + r);
				glprimitive.sphere(o, r, d, d);
				glprimitive.cylinder(o, r, size/2.0 - r);
				o.translate(0.0, -size + 2*r, 0.0);
				glprimitive.cylinder(o, r, size/2.0 - r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'V' :
				o.translate(size/2.0 - r, 0.0, r/2.0);
				o.pushMatrix();
					o.rotate(0.0, -24, 0.0);
					glprimitive.cylinder(o, r, size - r);
					//cap
					o.translate(0.0, 0.0, size - r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.pushMatrix();
					o.rotate(0.0, 24, 0.0);
					glprimitive.cylinder(o, r, size - r);
					//cap
					o.translate(0.0, 0.0, size - r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				//Top cap
				glprimitive.sphere(o, r, d, d);
			break;
			case 'W' :
				//Left
				o.translate(0.0, 0.0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				//caps
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(size - 2*r, 0.0, 0.0);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, -size + 2*r);
				glprimitive.sphere(o, r, d, d);
				//Right
				glprimitive.cylinder(o, r, size - 2*r);
				//Middle
				o.pushMatrix();
					o.rotate(0.0, -45, 0.0);
					glprimitive.cylinder(o, r, size/2.0 + r);
				o.popMatrix();
				o.translate(-size + 2*r, 0.0, 0.0);
				o.pushMatrix();
					o.rotate(0.0, 45, 0.0);
					glprimitive.cylinder(o, r, size/2.0 + r);
				o.popMatrix();
				//Middle cap
				o.translate(size/2.0 - r, 0.0, size/2.0 - r);
				glprimitive.sphere(o, r, d, d);
			break;
			case 'X' :
				o.translate(0.0, 0.0, r);
				o.rotate(0.0, 45, 0.0);
				var l = Math.sqrt(2*size*size) - 3*r;
				glprimitive.cylinder(o, r, l);
				o.pushMatrix();
					o.translate(0.0, 0.0, l);
					glprimitive.sphere(o, r, d, d);
					o.translate(0.0, 0.0, -l);
					o.rotate(180, 1.0, 0.0, 0.0);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.translate(-size/2.0 - r/2.0, 0.0, size/2.0 + r/2.0);
				o.rotate(0.0, 90, 0.0);
				glprimitive.cylinder(o, r, l);
				o.pushMatrix();
					o.translate(0.0, 0.0, l);
					glprimitive.sphere(o, r, d, d);
					o.translate(0.0, 0.0, -l);
					o.rotate(180, 0.0, 0.0);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
			break;
			case 'Y' :
				o.translate(size/2.0 - r, 0.0, r);
				o.rotate(180, 0.0, 0.0);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, -size/2.0 + r);
				glprimitive.cylinder(o, r, size/2.0 - r);
				o.pushMatrix();
					o.rotate(0.0, 135, 0.0);
					glprimitive.cylinder(o, r, size/2.0);
					o.translate(0.0, 0.0, size/2.0);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.pushMatrix();
					o.rotate(0.0, -135, 0.0);
					glprimitive.cylinder(o, r, size/2.0);
					o.translate(0.0, 0.0, size/2.0);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
			break;
			case 'Z' :
				o.rotate(0.0, 90, 0.0);
				o.translate(-size + r, 0.0, -r);
				//Left
				o.translate(0.0, 0.0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				//caps
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(size - 2*r, 0.0, 0.0);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, -size + 2*r);
				glprimitive.sphere(o, r, d, d);
				//Right
				glprimitive.cylinder(o, r, size - 2*r);
				//Middle
				o.translate(0.0, 0.0, 0.0);
				o.rotate(0.0, -45, 0.0);
				glprimitive.cylinder(o, r, size + 1.5*r);
			break;
			case '0' :
				o.rotate(90, 0.0, 0.0);
				o.rotate(0.0, 180, 0.0);
				o.translate(-size/2.0 + r, size/2.0, 0.0);
				glprimitive.torus(o, r, size/2.0 - r);
				o.rotate(90, 45, 0.0);
				o.translate(0.0, 0.0, -size/2.0 + r);
				glprimitive.cylinder(o, r, size - 2*r);
			break;
			case '1' :
				o.pushMatrix();
					//center
					o.translate(size/2.0 - r, 0.0, r);
					glprimitive.cylinder(o, r, size - 2*r);
					//caps
					o.translate(0.0, 0.0, size - 2*r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				//bottom bar
				o.rotate(0.0, 90, 0.0);
				o.translate(-r, 0.0, r);
				glprimitive.cylinder(o, r, size - 4*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 4*r);
				glprimitive.sphere(o, r, d, d);
				//top bar
				o.translate(-size + 2*r, 0.0, -size/2.0 - r);
				glprimitive.cylinder(o, r, size/2.0 - 2*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case '2' :
				o.rotate(-90, 0.0, 0.0);
				o.pushMatrix();
					//Cap for curve
					o.rotate(-90, 0.0, 0.0);
					o.translate(size/2.0 - 3.5*r, 0.0, -size + 3.5*r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				//Curve and diagonal stick
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90);
					o.translate(size - 3.5*r, size/2.0 - r, 0.0);
					o.pushMatrix();
						o.rotate(0.0, 0.0, -90);
						glprimitive.half_torus1(o, r, r + 1.5*r);
					o.popMatrix();
					o.rotate(0.0, 0.0, 52);
					o.pushMatrix();
						o.rotate(0.0, 0.0, -90);
						glprimitive.half_torus1(o, r, r + 1.5*r);
					o.popMatrix();
					o.rotate(0.0, -90, 0.0);
					o.translate(0.0, 2.5*r, 0.0);
					glprimitive.cylinder(o, r, size/2.0 + r);
				o.popMatrix();
				//Bottom
				o.rotate(0.0, 90, 0.0);
				o.translate(0.0, -r, r);
				glprimitive.cylinder(o, r, size - 4*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 4*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case '3' :
				o.rotate(90, 0.0, 0.0);
				o.translate(size/2.0 - r, 3*r, 0.0);
				o.pushMatrix();
					//lower curve
					o.rotate(0.0, 0.0, -45);
					o.pushMatrix();
						o.rotate(0.0, 0.0, -90);
						glprimitive.half_torus1(o, r, r*2);
					o.popMatrix();
					//cap
					o.rotate(0.0, -90, 0.0);
					o.translate(0.0, -2*r,  0.0);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90);
					glprimitive.half_torus1(o, r, r*2);
				o.popMatrix();
				o.translate(0, size - 6*r, 0.0);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90);
					glprimitive.half_torus1(o, r, r*2);
				o.popMatrix();
				o.pushMatrix();
					//upper curve
					o.rotate(0.0, 0.0, 45);
					o.pushMatrix();
						o.rotate(0.0, 0.0, -90);
						glprimitive.half_torus1(o, r, r*2);
					o.popMatrix();
					//cap
					o.rotate(0.0, -90, 0.0);
					o.translate(0.0, 2*r,  0.0);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				//center
				o.translate(-r, -2*r, 0.0);
				o.rotate(0.0, 90, 0.0);
				glprimitive.cylinder(o, r, r);
				o.rotate(180, 0.0, 0.0);
				glprimitive.sphere(o, r, d, d);
			break;
			case '4' :
				o.translate(size - 3*r, 0.0, r);
				glprimitive.cylinder(o, r, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(-size + 4*r, 0.0, 0);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, -size/2.0 + r);
				glprimitive.cylinder(o, r, size/2.0 - r);
				glprimitive.sphere(o, r, d, d);
				o.rotate(0.0, 90, 0.0);
				glprimitive.cylinder(o, r, size - 4*r);
			break;
			case '5' :
				//bars
				o.pushMatrix();
					o.translate(r, 0.0, size/2.0);
					glprimitive.cylinder(o, r, size/2.0 - r);
					glprimitive.sphere(o, r, d, d);
					o.translate(0.0, 0.0, size/2.0 - r);
					glprimitive.sphere(o, r, d, d);
					o.rotate(0.0, 90, 0.0);
					glprimitive.cylinder(o, r, size - 5*r);
					o.translate(0.0, 0.0, size - 5*r);
					glprimitive.sphere(o, r, d, d);
					o.translate(size/2.0 - r, 0.0, -r);
					glprimitive.sphere(o, r, d, d);
					o.translate(0.0, 0.0, -size + 6*r);
					glprimitive.cylinder(o, r, size - 6*r);
					o.translate(size/2.0 - r, 0.0, 0.0);
					glprimitive.cylinder(o, r, size - 6*r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.rotate(90, 0.0, 0.0);
				//curve
				o.translate(size/2.0, 3*r, 0.0);
				o.rotate(0.0, 0.0, -90.0);
				glprimitive.half_torus1(o, r, r*2);
			break;
			case '6' :
				o.rotate(90, 0.0, 0.0);
				o.rotate(0.0, 180, 0.0);
				o.translate(-size/2.0 + r, size/2.0, 0.0);
				o.pushMatrix();
					o.translate(0.0, -2*r, 0.0);
					glprimitive.torus(o, r, r*2);
				o.popMatrix();
				o.pushMatrix();
					o.translate(0.0, size/2.0 - 3*r, 0.0);
					o.rotate(0.0, 0.0, 90);
					o.pushMatrix();
						o.rotate(0.0, 0.0, -90);
						glprimitive.half_torus1(o, r, r*2);
					o.popMatrix();
					o.rotate(0.0, -90, 0.0);
					o.translate(0.0, 2*r, 0.0);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.rotate(90, 0.0, 0.0);
				o.translate(2*r, 0.0, -2*r);
				glprimitive.cylinder(o, r, 4*r);
			break;
			case '7' :
				o.pushMatrix();
					o.translate(2.5*r, 0.0, r);
					o.rotate(0.0, 30, 0.0);
					glprimitive.cylinder(o, r, size - r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.rotate(0.0, 90, 0.0);
				o.translate(-size + r, 0.0, r);
				glprimitive.cylinder(o, r, size - 4*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 4*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case '8' :
				o.rotate(90, 1.0, 0.0, 0.0);
				o.translate(size/2.0 - r, 3*r, 0.0);
				glprimitive.torus(o, r, r*2);
				o.translate(0, size - 6*r, 0.0);
				glprimitive.torus(o, r, r*2);
			break;
			case '9' :
				o.pushMatrix();
					o.translate(size/2.0 + r, 0.0, r);
					glprimitive.cylinder(o, r, size - 4*r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.rotate(90, 0.0, 0.0);
				o.translate(size/2.0 - r, size - 3*r, 0.0);
				glprimitive.torus(o, r, r*2);
			break;
			case '.' :
				o.translate(size/2.0 - r, 0.0, r);
				glprimitive.sphere(o, r, d, d);
			break;
			case ':' :
				o.translate(size/2.0 - r, 0.0, 2*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 5*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case '?':
				//The dot
				o.translate(size/2.0 - r, 0.0, r);
				glprimitive.sphere(o, r, d, d);
				//The vertical bar
				o.translate(0.0, 0.0, 2*r);
				glprimitive.cylinder(o, r, 2*r);
				glprimitive.sphere(o, r, d, d);
				//The curve
				o.translate(0.0, 0.0, size/2.0 - r);
				o.rotate(-90, 0.0, 0.0);
				o.rotate(0.0, 0.0, -90);
				glprimitive.half_torus1(o, r, r*2);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90);
					glprimitive.half_torus1(o, r, r*2);
				o.popMatrix();
				o.pushMatrix();
					o.rotate(0.0, -90, 0.0);
					o.translate(0.0, -2*r, 0.0);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.translate(-2*r, 0.0, 0.0);
				glprimitive.sphere(o, r, d, d);
			break;
			case '!' :
				//The dot
				o.translate(size/2.0 - r, 0.0, r);
				glprimitive.sphere(o, r, d, d);
				//The stick
				o.translate(0.0, 0.0, 3*r);
				glprimitive.cylinder(o, r, size - 5*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size - 5*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case '(':
				o.rotate(90, 0.0, 0.0);
				o.rotate(0.0, 180, 0.0);
				o.translate(-size/2.0, size/2.0, 0.0);
				o.scale(0.6, 1.0, 1.0);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90);
					glprimitive.half_torus1(o, r, r + (size - 4*r)/2.0);
				o.popMatrix();
				o.translate(0.0, size/2.0 - r, 0.0);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, -size + 2*r, 0.0);
				glprimitive.sphere(o, r, d, d);
			break;
			case ')':
				o.rotate(90, 0.0, 0.0);
				o.translate(size/2.0 - 2*r, size/2.0, 0.0);
				o.scale(0.6, 1.0, 1.0);
				o.pushMatrix();
					o.rotate(0.0, 0.0, -90);
					glprimitive.half_torus1(o, r, r + (size - 4*r)/2.0);
				o.popMatrix();
				o.translate(0.0, size/2.0 - r, 0.0);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, -size + 2*r, 0.0);
				glprimitive.sphere(o, r, d, d);
			break;
			case ' ' :
			break;
			case '/':
				o.translate(0.0, 0.0, r);
				o.rotate(0.0, 45, 0.0);
				glprimitive.cylinder(o, r, size);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size);
				glprimitive.sphere(o, r, d, d);
			break;
			case '\\':
				o.translate(size - 2*r, 0.0, r);
				o.rotate(0.0, -45, 0.0);
				glprimitive.cylinder(o, r, size);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, size);
				glprimitive.sphere(o, r, d, d);
			break;
			case '=' :
				o.translate(r, 0.0, 3*r);
				o.rotate(0.0, 90, 0.0);
				glprimitive.sphere(o, r, d, d);
				glprimitive.cylinder(o, r, size - 4*r);
				o.translate(0.0, 0.0, size - 4*r);
				glprimitive.sphere(o, r, d, d);
				o.translate(-size + 6*r, 0.0, 0.0);
				glprimitive.sphere(o, r, d, d);
				o.translate(0.0, 0.0, -size + 4*r);
				glprimitive.sphere(o, r, d, d);
				glprimitive.cylinder(o, r, size - 4*r);
			break;
			case '+':
				o.pushMatrix();
					o.translate(r, 0.0, size/2.0);
					o.rotate(0.0, 90, 0.0);
					glprimitive.sphere(o, r, d, d);
					glprimitive.cylinder(o, r, size - 4*r);
					o.translate(0.0, 0.0, size - 4*r);
					glprimitive.sphere(o, r, d, d);
				o.popMatrix();
				o.translate(size/2.0 - r, 0.0, 2*r);
				glprimitive.sphere(o, r, d, d);
				glprimitive.cylinder(o, r, size - 4*r);
				o.translate(0.0, 0.0, size - 4*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case '-':
				o.translate(r, 0.0, size/2.0);
				o.rotate(0.0, 90, 0.0);
				glprimitive.sphere(o, r, d, d);
				glprimitive.cylinder(o, r, size - 4*r);
				o.translate(0.0, 0.0, size - 4*r);
				glprimitive.sphere(o, r, d, d);
			break;
			case '\n' :
			break;
			default:
			break;
		}
		o.popMatrix();
	}
};
