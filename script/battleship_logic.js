Battleship.Logic = {
	BATTLESHIP_MOUSE_LEFT : 1,
	BATTLESHIP_MOUSE_MIDDLE : 2,
	BATTLESHIP_MOUSE_RIGHT : 4,

	init : function() {
		this._mouse_x = 0;
		this._mouse_y = 0;
		this._mouse_mod = {
			alt : false,
			ctrl : false,
			shift : false,
			meta : false };
		this._mouse_button = 0;
	},

	/** Handles mouse button releases.
	 *
	 *  This function should be called from the main file corrisponding to
	 *  a particular gui frontend.
	 *
	 *  This function should be called whenever a mouse button is released.
	 *
 	 *  @param button	The button which was released. This value should
	 *					corrispond to one of the BATTLESHIP_MOUSE_* values.
	 *  @param mod		What modifiers are were pressed. An object
	 *					{ shift : bool, ctrl : bool, alt : bool, meta : bool }
	 *  @param x		The x coordinate of the mouse event.
	 *  @param y		The y coordinate of the mouse event.
	 */
	mouse_up : function(button, mod, x, y) {
		this._mouse_button ^= (1 << (button - 1));
		this._mouse_mod = mod;
	},

	/** Handles mouse button presses.
	 *
	 *  This function should be called from the main file corrisponding to
	 *  a particular gui frontend.
	 *
	 *  This function should be called whenever a mouse button is pressed.
	 *
	 *  @param button	The button which was released. An object
	 *					{ left : bool, right : bool, middle : bool }
	 *  @param mod		What modifiers are were pressed. An object
	 *					{ shift : bool, ctrl : bool, alt : bool, meta : bool }
	 *  @param x		The x coordinate of the mouse event.
	 *  @param y		The y coordinate of the mouse event.
	 */
	mouse_down : function(button, mod, x, y) {
		this._mouse_button |= (1 << (button - 1));
		this._mouse_mod = mod;
		this._mouse_x = x;
		this._mouse_y = y;
	},

	/** Handles mouse movement.
	 *
	 *  This function should be called from the main file corrisponding to
	 *  a particular gui frontend.
	 *
	 *  This function should be called whenever the mouse moves inside the
	 *  window.
	 *
	 *  @param x The x coordinate of the mouse motion
	 *  @param y The y coordinate of the mouse motion
	 */
	mouse_move : function(x, y) {
		var size = Battleship.View.getsize();
		var diffx = (x - this._mouse_x) / size.width;
		var diffy = (y - this._mouse_y) / size.height;

		var needRefresh = false;
		if (this._mouse_mod.shift)
		{
			var tdiffx = diffx * 15.0;
			var tdiffy = diffy * 15.0;
			if (this._mouse_button & this.BATTLESHIP_MOUSE_LEFT)
			{
				Battleship.View.set_translate(0, tdiffx, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_MIDDLE)
			{
				Battleship.View.set_translate(1, -tdiffy, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_RIGHT)
			{
				Battleship.View.set_translate(2, tdiffy, 'U');
			}
			needRefresh = true;
		}
		if (this._mouse_mod.ctrl)
		{
			var rdiffx = diffx * 360;
			var rdiffy = diffy * 360;
			if (this._mouse_button & this.BATTLESHIP_MOUSE_LEFT)
			{
				Battleship.View.set_rotate(1, rdiffx, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_MIDDLE)
			{
				Battleship.View.set_rotate(0, rdiffy, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_RIGHT)
			{
				Battleship.View.set_rotate(2, -rdiffx, 'U');
			}
			needRefresh = true;
		}

		this._mouse_x = x;
		this._mouse_y = y;

		if (needRefresh) {
			Battleship.View.refresh();
		}
	}
};
