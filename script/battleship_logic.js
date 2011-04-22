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
 * Contains the logic portion of the Battleship game.
 */
 /**
  * @namespace
  */
Battleship.Logic = {
	BATTLESHIP_MOUSE_LEFT : 1,
	BATTLESHIP_MOUSE_MIDDLE : 2,
	BATTLESHIP_MOUSE_RIGHT : 4,

	enum_key : {
		QUIT : 'quit',
		RESET : 'reset',
		LEFT : 'left',
		RIGHT : 'right',
		DOWN : 'down',
		UP : 'up',
		ROTATE : 'rotate',
		ENTER : 'enter',
		ESC : 'esc',
		BACKSPACE : 'backspace',
		X : 'x',
		Y : 'y',
		Z : 'z'
	},

	/** Called to perform game initilization.
	 *
	 *	This function initilizes game variables and must be
	 *	called before drawing occurs. It inititizes all other
	 *	parts of the game.
	 */
	init : function() {
		Battleship.Model.init();
		Battleship.View.init();
		Battleship.Menu.init();

		this._mouse_x = 0;
		this._mouse_y = 0;
		this._mouse_mod = {
			alt : false,
			ctrl : false,
			shift : false,
			meta : false };
		this._mouse_button = 0;

		Battleship.Menu.load(Battleship.Menu.main_menu);
	},

	/** Called to perform game initilization.
	 *
	 *	This function initilizes game variables and must be
	 *	called before drawing occurs. It inititizes all other
	 *	parts of the game.
	 */
	newgame : function() {
		this._next_state();
	},

	/** Starts a new one player game.
	 *
	 *  This function does not need to be called directly.
	 *  However it can be called directly to skip the intro menu.
	 */
	onep : function() {
		Battleship.Model.player[0].ai = Battleship.Model.enum_aitype.HUMAN;
		Battleship.Model.player[0].auto_place = false;
		Battleship.Model.player[0].fog = false;
		Battleship.Model.player[1].ai = Battleship.Model.enum_aitype.HARD;
		Battleship.Model.player[1].auto_place = true;
		Battleship.Model.player[1].fog = true;

		this.newgame();
	},

	/** Starts a new two player game.
	 *
	 *  This function does not need to be called directly.
	 *  However it can be called directly to skip the intro menu.
	 */
	twop : function() {
		Battleship.Model.player[0].ai = Battleship.Model.enum_aitype.HUMAN;
		Battleship.Model.player[0].auto_place = false;
		Battleship.Model.player[0].fog = true;
		Battleship.Model.player[1].ai = Battleship.Model.enum_aitype.HUMAN;
		Battleship.Model.player[1].auto_place = false;
		Battleship.Model.player[1].fog = true;

		this.newgame();
	},

	/** Starts a new game in demo mode.
	 *
	 *  This function does not need to be called directly.
	 *  However it can be called directly to skip the intro menu.
	 */
	 demo : function() {
		Battleship.Model.demo_mode = true;

		Battleship.Model.player[0].ai = 3.0*Math.rand() + 1;
		Battleship.Model.player[0].auto_place = true;
		Battleship.Model.player[0].fog = false;
		Battleship.Model.player[1].ai = 3.0*Math.rand() + 1;
		Battleship.Model.player[1].auto_place = true;
		Battleship.Model.player[1].fog = false;

		this.newgame();
	},

	/** Resets the game.
	 *
	 * Regardless of the games current state it will be reset and return to
	 * the opening menu
	 */
	restart : function() {
		this.stop_timers();
		this.init();
		this.sound_stop();
		Battleship.View.refresh();
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
		if (this._mouse_mod.alt) {
			var tdiffx = diffx * 15.0;
			var tdiffy = diffy * 15.0;
			if (this._mouse_button & this.BATTLESHIP_MOUSE_LEFT) {
				Battleship.View.set_translate(0, tdiffx, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_MIDDLE) {
				Battleship.View.set_translate(1, -tdiffy, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_RIGHT) {
				Battleship.View.set_translate(2, tdiffy, 'U');
			}
			needRefresh = true;
		}
		if (this._mouse_mod.ctrl) {
			var rdiffx = diffx * 360;
			var rdiffy = diffy * 360;
			if (this._mouse_button & this.BATTLESHIP_MOUSE_LEFT) {
				Battleship.View.set_rotate(1, rdiffx, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_MIDDLE) {
				Battleship.View.set_rotate(0, rdiffy, 'U');
			}
			if (this._mouse_button & this.BATTLESHIP_MOUSE_RIGHT) {
				Battleship.View.set_rotate(2, -rdiffx, 'U');
			}
			needRefresh = true;
		}

		this._mouse_x = x;
		this._mouse_y = y;

		if (needRefresh) {
			Battleship.View.refresh();
		}
	},

	keypress : function(key, mod) {
		var needRefresh = this._handleGlobalKeypress(key, mod);
		if (!needRefresh) {
			if (Battleship.Menu.curr_menu) {
				needRefresh = Battleship.Menu.keypress(key, mod);
			} else {
				needRefresh = this._handleGameKeypress(key, mod);
			}
		}
		if (needRefresh) {
			Battleship.View.refresh();
		}
		return needRefresh;
	},

	_handleGlobalKeypress : function(key, mod) {
		var needRefresh = false;
		var size = Battleship.View.getsize();
		var rdiff = 10/size.width * 360;
		if (mod.shift) { rdiff *= -1; }
		switch (key) {
			case this.enum_key.QUIT:
				Battleship.Logic.quit();
				needRefresh = true;
			break;
			case this.enum_key.RESET:
				Battleship.View.set_rotate(0, 0, 'u');
				Battleship.View.set_rotate(1, 0, 'u');
				Battleship.View.set_rotate(2, 0, 'u');
				Battleship.View.set_translate(0, 0, 'u');
				Battleship.View.set_translate(1, 0, 'u');
				Battleship.View.set_translate(2, 0, 'u');
				needRefresh = true;
			break;
			case this.enum_key.X:
				if (mod.alt) {
					Battleship.View.set_translate(0, rdiff, 'U');
					needRefresh = true;
				} else if (mod.ctrl) {
					Battleship.View.set_rotate(0, rdiff, 'U');
					needRefresh = true;
				}
			break;
			case this.enum_key.Y:
				if (mod.alt) {
					Battleship.View.set_translate(1, rdiff, 'U');
					needRefresh = true;
				} else if (mod.ctrl) {
					Battleship.View.set_rotate(1, rdiff, 'U');
					needRefresh = true;
				}
			break;
			case this.enum_key.Z:
				if (mod.alt) {
					Battleship.View.set_translate(2, -rdiff, 'U');
					needRefresh = true;
				} else if (mod.ctrl) {
					Battleship.View.set_rotate(2, -rdiff, 'U');
					needRefresh = true;
				}
			break;
		}
		return needRefresh;
	},

	_handleGameKeypress : function(key, mod) {
		if (key === this.enum_key.ESC)
		{
			if (Battleship.Model.demo_mode) {
				//stop demo mode on ecp
				Battleship.Model.demo_mode = false;
				this.restart();
				return true;
			} else if (!Battleship.Model.curr_menu) {
				//options menu
				Battleship.Menu.load(Battleship.Menu.options_menu);
				return true;
			}
		}

		var needRefresh = true;
		switch (Battleship.Model.game_state) {
			case Battleship.Model.enum_gamestate.PLACE_SHIPS:
				//find current ship
				var curr_ship = null;
				var curr_ship_t = 0;
				var i;
				for (i = 0; i < Battleship.Model.NUM_SHIPS; i++) {
					if (Battleship.Model.player[Battleship.Model.curr_player].ship[i].state === Battleship.Model.enum_shipstate.PLACING) {
						curr_ship = Battleship.Model.player[Battleship.Model.curr_player].ship[i];
						curr_ship_t = i;
						break;
					}
				}
				if (!curr_ship) return;
				var hl = (curr_ship.down) ? 1 : curr_ship.length;
				var vl = (!curr_ship.down) ? 1 : curr_ship.length;

				if (key === this.enum_key.LEFT) {
					if (curr_ship.x > 0)
						--(curr_ship.x);
				} else if (key === this.enum_key.RIGHT) {
					if (curr_ship.x + hl < Battleship.Model.GRID_DIM)
						++(curr_ship.x);
				} else if (key === this.enum_key.UP) {
					if (curr_ship.y > 0)
						--(curr_ship.y);
				} else if (key === this.enum_key.DOWN) {
					if (curr_ship.y + vl < Battleship.Model.GRID_DIM)
						++(curr_ship.y);
				} else if (key === this.enum_key.ENTER) {
					if (this._try_place_ship(curr_ship_t)) {
						//If the ship is placed and it is the last one move on
						if (curr_ship_t === NUM_SHIPS - 1) {
							this._next_state();
						} else {
							Battleship.Model.player[Battleship.Model.curr_player].ship[curr_ship_t + 1].state = Battleship.Model.enum_shipstate.PLACING;
						}
					}
				} else if (key === this.enum_key.BACKSPACE) {
					if (curr_ship_t != 0) {
						//Stop placing current ship
						curr_ship.state = Battleship.Model.enum_shipstate.NOT_PLACED;
						//Switch to last ship
						curr_ship = player[curr_player].ship[curr_ship_t - 1];
						hl = (curr_ship.down) ? 1 : curr_ship.length;
						vl = (!curr_ship.down) ? 1 : curr_ship.length;

						//Unplace it
						var j;
						for (i = 0; i < hl; i++) {
							for (j = 0; j < vl; j++) {
								Battleship.Model.player[curr_player].ship_at
									[curr_ship.x + i][curr_ship.y +j] = Battleship.Model.enum_gridstate.NO_SHIP;
							}
						}

						//Set it to placing
						curr_ship.state = Battleship.Model.enum_shipstate.PLACING;
					}
				} else if (key === this.enum_key.ROTATE) {
					curr_ship.down = !curr_ship.down;
				} else {
					needRefresh = false;
				}
			break;
			case GAME_TRANSITION:
			case GAME_FIREING:
			case GAME_MESSAGE:
				cancel_animation = true;
			break;
			case GAME_AI_PLAYING:
				if (mod.ai) {
					cancel_animation = true;;
					return;
				}
			//note lack of break
			case GAME_PLAYING:
				if (key == BATTLESHIP_KEYS[BATTLESHIP_KEY_LEFT]) {
					this._fix_select(-1, 0);
				} else if (key === BATTLESHIP_KEYS[BATTLESHIP_KEY_RIGHT]) {
					this._fix_select(1, 0);
				} else if (key === BATTLESHIP_KEYS[BATTLESHIP_KEY_UP]) {
					this._fix_select(0, -1);
				} else if (key === BATTLESHIP_KEYS[BATTLESHIP_KEY_DOWN]) {
					this._fix_select(0, 1);
				} else if (key === BATTLESHIP_KEYS[BATTLESHIP_KEY_ENTER]) {
					if (Battleship.Model.player[1 - Battleship.Model.curr_player].grid
							[Battleship.Model.player[Battleship.Model.curr_player].sel_x][Battleship.Model.player[Battleship.Model.curr_player].sel_y]
							=== GRID_EMPTY)
					{
						this._next_state();
						needRefresh = false;
					}
				} else {
					needRefresh = false;
				}
			break;
			case GAME_OVER:
				this._next_state();
			break;
			default:
				needRefresh = false;
			break;
		}
		return needRefresh;
	},

	_next_state : function() {
		switch (Battleship.Model.game_state) {
			case Battleship.Model.enum_gamestate.INIT:
				Battleship.Model.curr_menu = NULL;
				Battleship.Model.game_state = Battleship.Model.enum_gamestate.PLACE_SHIPS;

				//put first ship in placing state
				Battleship.Model.player[0].ship[0].state = Battleship.Model.enum_shipstate.PLACING;
				Battleship.Model.player[1].ship[0].state = Battleship.Model.enum_shipstate.PLACING;

				//do ai placing of ships
				Battleship.Model.curr_player = 0;
				if (Battleship.Model.player[0].auto_place) { this._autoplace_ships(); }
				Battleship.Modle.curr_player = 1;
				if (Battleship.Model.player[1].auto_place) { this._autoplace_ships(); }
				Battleship.Model.curr_player = 0;

				//Don't go to ship placing state if both players are ai's
				if (Battleship.Model.player[0].auto_place && Battleship.Model.player[1].auto_place) {
					Battleship.Model.game_state = Battleship.Model.enum_gamestate.PLAYING;
					this._board_rotate(0, 15.0, 10.0);
					this._board_move(1, 0.0, 0.5);
					if (Battleship.Model.player[0].ai) {
						this._start_ai();
					}
				} else {
					//Move to next player if first players is AI
					if (Battleship.Model.player[0].auto_place) {
						this._switch_player(1 - Battleship.Model.curr_player);
					}
					this._board_rotate(0, 45.0, 5.0);
					this._board_move(1, 4.5, 0.5);
				}
			break;
			case Battleship.Model.enum_gamestate.PLACE_SHIPS:
				if (Battleship.Model.curr_player === 0 && !Battleship.Model.player[1].auto_place) {
					this._switch_player(1 - Battleship.Model.curr_player);
				} else {
					Battleship.Model.game_state = Battleship.Model.enum_gamestate.PLAYING;
					this._board_rotate(0, 15.0, 10.0);
					this._board_move(1, 0.0, 0.5);
					this._switch_player(0);
					if (Battleship.Model.player[0].ai) {
						this.start_ai();
					}
				}
			break;
			case Battleship.Model.enum_gamestate.AI_PLAYING:
			case Battleship.Model.enum_gamestate.PLAYING:
				//if (game_rocket.type != ROCKET_OFF) {
				//	this._board_rotate(1, 90, 10.0);
				//}
				//battleship_view_ready_rocket();
				this._start_fireing();
			break;
			case Battleship.Model.enum_gamestate.FIREING:
				//fire and dtermine if the game is over
				Battleship.Model.game_over = this._fire();
				this._start_message();

				//don't start sound if animation is not enabled, it will just
				//be cancled
				if (Battleship.Model.do_msg_animation)
				{
					if (Battleship.Model.game_message.type === Battleship.Model.enum_gridstate.MISS) {
						//Battleship.Sound.play(BATTLESHIP_SOUND_MISS);
					} else if (Battleship.Model.game_message.type === Battleship.Model.enum_gridstate.HIT) {
						/*
						if (game_message.ship) {
							battleship_sound_play(BATTLESHIP_SOUND_SUNK);
						} else {
							battleship_sound_play(BATTLESHIP_SOUND_HIT);
						}
						*/
					} else if (Battleship.Model.game_message.type === Battleship.Model.enum_gridstate.EMPTY) {
						//battleship_sound_play(BATTLESHIP_SOUND_WIN);
					}
				}
			break;
			case Battleship.Model.enum_gamestate.MESSAGE:
				//if the game is over don't continue
				if (Battleship.Model.game_over) {
					//If demo mode is active restart automatically
					if (Battleship.Model.game_over && Battleship.Model.demo_mode) {
						this.restart();
					} else {
						Battleship.Model.game_state = Battleship.Model.enum_gamestate.GAME_OVER;
					}
				} else {
					//back to playing
					Battleship.Model.game_state = Battleship.Model.enum_gamestate.PLAYING;
					if (!Battleship.Model.player[Battleship.Model.curr_player].ai) {
						this._fix_select(1, 0);
					} else if (player[curr_player].ai != AI_EASY) {
						this._ai_follow_hit();
					}
					this._switch_player(1 - Battleship.Model.curr_player);
					if (Battleship.Model.player[Battleship.Model.curr_player].ai) {
						this._start_ai();
					}
				}
			break;
			case GAME_OVER:
				this.restart();
			break;
			default:
				console.log("Error: Unknown or unexpected state %i\n", Battleship.Model.game_state);
			break;
		}
	}
};
