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

/** Delay used for animation call back */
var ANIMATION_SPEED = 55;
/** Delay used for AI call back */
var AI_SPEED = 100;
/** Addition timer delay for demo mode */
var DEMO_DELAY = 20;

/** The final size of message text */
var MAX_MSG_SIZE = 5;
/** The initial size of message text */
var MIN_MSG_SIZE = 1;
/** How long to leave message text persistant */
var MAX_MSG_DELAY = 35;
/** The starting delay value for hit/miss messages*/
var HIT_MSG_DELAY = (MAX_MSG_DELAY - 6);
/** The starting delay value for sunk messages */
var SUNK_MSG_DELAY = (MAX_MSG_DELAY - 10);
/** The starting delay value for game over message */
var WIN_MSG_DELAY = 0;

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

	_mouse_x : 0,
	_mouse_y : 0,
	_mouse_z : 0,
	_mouse_mod : null,
	_mouse_button : 0,
	_board_montion : null,
	_cancel_animation : false,
	_ai_move : [],
	_game_over : false,

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

		var i, j;
		this._board_motion = { rrate : [], rend : [], trate : [], tend : [] }
		for (i = 0; i < 3; i++) {
			this._board_motion.rrate[i] = 0;
			this._board_motion.rend[i] = 0;
			this._board_motion.trate[i] = 0;
			this._board_motion.tend[i] = 0;
		}

		this._cancel_animation = false;
		for (i = 0; i < 2; i++) {
			this._ai_move[i] = {
				chosen : false,
				mod : (Math.random() > 0.5 ? 0 : 1),
				state : 0,
				num_hits : 0,
				hit : [],
				x : 0,
				y: 0
			}
			for (j = 0; j < Battleship.Model.NUM_SHIPS; ++j) {
				this._ai_move[i].hit[j] = {
					x : 0,
					y : 0,
					dir : new Array(4),
					curr_dir : 0
				}
			}
		}

		this._game_over = false;
		Battleship.Model.game_state = Battleship.Model.enum_gamestate.INIT;
		if (Battleship.Model.demo_mode) {
			Battleship.Logic.demo();
		} else {
			Battleship.Menu.load(Battleship.Menu.main_menu);
		}
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

		Battleship.Model.player[0].ai = Math.floor(3.0*Math.random()) + 1;
		Battleship.Model.player[0].auto_place = true;
		Battleship.Model.player[0].fog = false;
		Battleship.Model.player[1].ai = Math.floor(3.0*Math.random()) + 1;
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
		//this.sound_stop();
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
			} else if (!Battleship.Menu.curr_menu) {
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
						if (curr_ship_t === Battleship.Model.NUM_SHIPS - 1) {
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
			case Battleship.Model.enum_gamestate.TRANSITION:
			case Battleship.Model.enum_gamestate.FIREING:
			case Battleship.Model.enum_gamestate.MESSAGE:
				this._cancel_animation = true;
			break;
			case Battleship.Model.enum_gamestate.AI_PLAYING:
				if (!mod.ai) {
					this._cancel_animation = true;;
					return;
				}
			//note lack of break
			case Battleship.Model.enum_gamestate.PLAYING:
				if (key === this.enum_key.LEFT) {
					this._fix_select(-1, 0);
				} else if (key === this.enum_key.RIGHT) {
					this._fix_select(1, 0);
				} else if (key === this.enum_key.UP) {
					this._fix_select(0, -1);
				} else if (key === this.enum_key.DOWN) {
					this._fix_select(0, 1);
				} else if (key === this.enum_key.ENTER) {
					if (Battleship.Model.player[1 - Battleship.Model.curr_player].grid
							[Battleship.Model.player[Battleship.Model.curr_player].sel_x][Battleship.Model.player[Battleship.Model.curr_player].sel_y]
							=== Battleship.Model.enum_gridstate.EMPTY)
					{
						this._next_state();
						needRefresh = false;
					}
				} else {
					needRefresh = false;
				}
			break;
			case Battleship.Model.enum_gamestate.GAME_OVER:
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
				Battleship.Menu.curr_menu = null;
				Battleship.Model.game_state = Battleship.Model.enum_gamestate.PLACE_SHIPS;

				//put first ship in placing state
				Battleship.Model.player[0].ship[0].state = Battleship.Model.enum_shipstate.PLACING;
				Battleship.Model.player[1].ship[0].state = Battleship.Model.enum_shipstate.PLACING;

				//do ai placing of ships
				Battleship.Model.curr_player = 0;
				if (Battleship.Model.player[0].auto_place) { this._autoplace_ships(); }
				Battleship.Model.curr_player = 1;
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
				if (Battleship.Model.game_rocket.type !== Battleship.Model.enum_rockettype.OFF) {
					this._board_rotate(1, 90, 10.0);
				}
				Battleship.View.ready_rocket();
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
					} else if (Battleship.Model.player[Battleship.Model.curr_player].ai != Battleship.Model.enum_aitype.EASY) {
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
	},

	_try_place_ship : function(num) {
		var curr_ship = Battleship.Model.player[Battleship.Model.curr_player].ship[num];
		var hl = (curr_ship.down) ? 1 : curr_ship.length;
		var vl = (!curr_ship.down) ? 1 : curr_ship.length;

		//check for ship
		var conflict = false;
		var i, j;
		for (i = 0; !conflict && i < hl; i++) {
			for (j = 0; !conflict && j < vl; j++) {
				if (curr_ship.y + j >= Battleship.Model.GRID_DIM || curr_ship.x + i >= Battleship.Model.GRID_DIM) {
					conflict = true;
				} else {
					var shipAt = Battleship.Model.player[Battleship.Model.curr_player].ship_at[curr_ship.x + i][curr_ship.y +j];
					conflict = (shipAt !== Battleship.Model.enum_shiptype.NO_SHIP);
				}
			}
		}

		if (!conflict) {
			for (i = 0; i < hl; i++) {
				for (j = 0; j < vl; j++) {
					Battleship.Model.player[Battleship.Model.curr_player].ship_at
						[curr_ship.x + i][curr_ship.y +j] = num;
				}
			}
			curr_ship.state = Battleship.Model.enum_shipstate.PLACED;
		}

		return !conflict;
	},

	_fire : function() {
		var go = false;
		Battleship.Model.game_message.size = MIN_MSG_SIZE;
		Battleship.Model.game_message.delay = HIT_MSG_DELAY;
		Battleship.Model.game_message.ship = null;

		var player = Battleship.Model.player[Battleship.Model.curr_player];
		var nextplayer = Battleship.Model.player[1 - Battleship.Model.curr_player];
		var sel_x = player.sel_x;
		var sel_y = player.sel_y;
		if (nextplayer.ship_at[sel_x][sel_y] === Battleship.Model.enum_shiptype.NO_SHIP) {
			Battleship.Model.game_message.type = Battleship.Model.enum_gridstate.MISS;

			nextplayer.grid[sel_x][sel_y] = Battleship.Model.enum_gridstate.MISS;
			++player.num_misses;
		} else {
			Battleship.Model.game_message.type = Battleship.Model.enum_gridstate.HIT;

			//add hit
			nextplayer.grid[sel_x][sel_y] = Battleship.Model.enum_gridstate.HIT;
			++player.num_hits;

			//add hit to ship
			var ship = nextplayer.ship_at[sel_x][sel_y];
			++nextplayer.ship[ship].num_hits;

			//shink
			if (nextplayer.ship[ship].num_hits === nextplayer.ship[ship].length) {
				Battleship.Model.game_message.ship = Battleship.Model.shiptype_s[ship];
				Battleship.Model.game_message.delay = SUNK_MSG_DELAY;

				nextplayer.ship[ship].state = Battleship.Model.enum_shipstate.SUNK;
				++nextplayer.num_sunk;
				if (nextplayer.num_sunk === Battleship.Model.NUM_SHIPS) {
					Battleship.Model.game_message.delay = WIN_MSG_DELAY;
					Battleship.Model.game_message.ship = null;
					Battleship.Model.game_message.type = Battleship.Model.enum_gridstate.EMPTY;
					go = true;
				}
			}
		}
		return go;
	},

	_fix_select : function(xm, ym) {
		var GRID_DIM = Battleship.Model.GRID_DIM;
		var player = Battleship.Model.player[Battleship.Model.curr_player];
		player.sel_x = (player.sel_x + (xm + GRID_DIM)) % GRID_DIM;
		player.sel_y = (player.sel_y + (ym + GRID_DIM)) % GRID_DIM;
	},

	_switch_player : function(pnum) {
		if (Battleship.Model.curr_player != pnum) {
			Battleship.Model.curr_player = pnum;
			this._board_rotate(1, (Battleship.Model.curr_player === 0) ? 0 : 180, 10.0);
		}
	},

	_ai_play : function() {
		//Don't play while menu is open
		//Its also possible the user will change from AI to human using options menu
		if (Battleship.Menu.curr_menu || !Battleship.Model.player[Battleship.Model.curr_player].ai)
		{
			this._cancel_animation = false;
			Battleship.Model.game_state = Battleship.Model.enum_gamestate.PLAYING;
			return false;
		}

		var ai = this._ai_move[Battleship.Model.curr_player];
		var r = true;

		//Find a new place to shoot
		if (!ai.chosen) {
			this._ai_pick_move();
		}

		//move there right away if animation is off
		if (this._cancel_animation || !Battleship.Model.do_ai_animation) {
			Battleship.Model.player[Battleship.Model.curr_player].sel_x = ai.x;
			Battleship.Model.player[Battleship.Model.curr_player].sel_y = ai.y;
		}

		//A place has been chosen and the cursor is on it. Fire.
		var mod = { ai : true };
		if (Battleship.Model.player[Battleship.Model.curr_player].sel_x === ai.x &&
			Battleship.Model.player[Battleship.Model.curr_player].sel_y === ai.y
		) {
			//this needs to come before hit checking code. because hit checking
			//code may correctly set it back to true
			ai.chosen = false;
			this._cancel_animation = false;
			this.keypress(this.enum_key.ENTER, mod);
			r = false;
		} else {
			//A place has been chosen but the cursor is not on it. So move.
			//move to location
			if (Battleship.Model.player[Battleship.Model.curr_player].sel_x < ai.x) {
				this.keypress(this.enum_key.RIGHT, mod);
			} else if (Battleship.Model.player[Battleship.Model.curr_player].sel_x > ai.x) {
				this.keypress(this.enum_key.LEFT, mod);
			} else if (Battleship.Model.player[Battleship.Model.curr_player].sel_y < ai.y) {
				this.keypress(this.enum_key.DOWN, mod);
			} else if (Battleship.Model.player[Battleship.Model.curr_player].sel_y > ai.y) {
				this.keypress(this.enum_key.UP, mod);
			}
		}

		return r;
	},

	_ai_pick_move : function() {
		var ai = this._ai_move[Battleship.Model.curr_player];
		ai.x = Math.floor(Battleship.Model.GRID_DIM*Math.random());
		ai.y = Math.floor(Battleship.Model.GRID_DIM*Math.random());
		var initx = ai.x;
		var inity = ai.y;
		while (true) {
			if (Battleship.Model.player[1 - Battleship.Model.curr_player].grid[ai.x][ai.y] === Battleship.Model.enum_gridstate.EMPTY) {
				//Only hard AI does useful picking.
				//Technically AI state should never reach 4
				if (Battleship.Model.player[Battleship.Model.curr_player].ai != Battleship.Model.enum_aitype.HARD || ai.state === 3) {
					break;
				}

				//the ai has narrowed the board down to open blocks of 2
				var left = (ai.x == 0) || (Battleship.Model.player[1 - Battleship.Model.curr_player].grid[ai.x - 1][ai.y] !== Battleship.Model.enum_gridstate.EMPTY);
				var right = (ai.x === Battleship.Model.GRID_DIM - 1) || (Battleship.Model.player[1 - Battleship.Model.curr_player].grid[ai.x + 1][ai.y] !== Battleship.Model.enum_gridstate.EMPTY);
				var up = (ai.y === 0) || (Battleship.Model.player[1 - Battleship.Model.curr_player].grid[ai.x][ai.y - 1] != Battleship.Model.enum_gridstate.EMPTY);
				var down = (ai.y === Battleship.Model.GRID_DIM - 1) || (Battleship.Model.player[1 - Battleship.Model.curr_player].grid[ai.x][ai.y + 1] != Battleship.Model.enum_gridstate.EMPTY);

				var open = 4 - (up + down + left + right);

				//Ensures 2 space gap between pieces (but don't pick a place
				//that has fewer than 3 open)
				if (ai.state === 0 && ((ai.y + ai.mod) % 3 === ai.x % 3) && open > 2) {
					break;
				} else if (ai.state == 1 && open > 1) {
					//Try all spaces that have 2 open space around them
					break;
				} else if (ai.state == 2 && open > 0) {
					//Now try all space that have one open space
					break;
				}
			}

			++ai.x;
			if (ai.x >= Battleship.Model.GRID_DIM) {
				++ai.y;
				ai.x = 0;
				if (ai.y >= Battleship.Model.GRID_DIM) {
					ai.y = 0;
				}
			}

			//The hard AI has 3 search states. It determines that it needs
			//to move to the next when there are no moves left for the one its
			//on.
			if (ai.x === initx && ai.y === inity) {
				if (ai.state === 4 || Battleship.Model.player[Battleship.Model.curr_player].ai !== Battleship.Model.enum_aitype.HARD) {
					console.log("Error: Board is full\n");
					return;
				}
				++ai.state;
			}
		}
		ai.chosen = true;
	},

	_ai_follow_hit : function() {
		var ai = this._ai_move[Battleship.Model.curr_player];
		var ship = Battleship.Model.player[1 - Battleship.Model.curr_player].ship_at[ai.x][ai.y];
		if (ship !== Battleship.Model.enum_shiptype.NO_SHIP) {
			//This loop both checks the hit queue for sunk ships and
			//determines if the ship that has been hit is in the queue
			var newShip = true;
			var ship2;
			var i = 0;
			for ( ; ; ) {
				if (i >= ai.num_hits) { break;}

				ship2 = Battleship.Model.player[1 - Battleship.Model.curr_player].ship_at[ai.hit[i].x][ai.hit[i].y];
				//Check if the new ship is in the queue
				if (ship === ship2) {
					newShip = false;
				}

				//Has the ship been sunk?
				if (Battleship.Model.player[1 - Battleship.Model.curr_player].ship[ship2].state === Battleship.Model.enum_shipstate.SUNK) {
					--ai.num_hits;
					ai.hit[i] = ai.hit[ai.num_hits];
					//update ship origin
					if (i === 0) {
						ai.x = ai.hit[i].x;
						ai.y = ai.hit[i].y;
					}
				} else {
					++i;
				}
			}

			if (newShip) {
				//its a new ship add it to the queue
				ai.hit[ai.num_hits].x = ai.x;
				ai.hit[ai.num_hits].y = ai.y;
				//clear attemped directions
				var i;
				for (i = 0; i < 4; i++) {
					ai.hit[ai.num_hits].dir[i] = false;
				}
				//pick random direction
				ai.hit[ai.num_hits].curr_dir = Math.floor(4 * Math.random());
				++ai.num_hits;
			}
		} else if (ai.num_hits > 0) {
			//Miss, but only care if there is currently something in the hit queue

			//Need to start looking in another direction.
			ai.hit[0].dir[ai.hit[0].curr_dir] = true;

			//Switch to opposite dir for now. If this has been tired it
			//wiil be corrected below
			ai.hit[0].curr_dir = (ai.hit[0].curr_dir + 2) % 4;

			//Move back to origin
			ai.x = ai.hit[0].x;
			ai.y = ai.hit[0].y;
		}

		//Determine next fireing locaiton
		while (ai.num_hits > 0 && !ai.chosen) {
			//pick a new direction if need be.
			var count = 0;
			while (ai.hit[0].dir[ai.hit[0].curr_dir]) {
				ai.hit[0].curr_dir = (ai.hit[0].curr_dir + 1) % 4;
				//start at first hit again
				ai.x = ai.hit[0].x;
				ai.y = ai.hit[0].y;

				//just in case
				if (++count > 4) {
					console.log("Error: AI failed to sink ship\n");
					return;
				}
			}

			//move
			switch (ai.hit[0].curr_dir) {
				//Left
				case 3:
					if (ai.x > 0) {
						--ai.x;
					} else {
						ai.hit[0].dir[ai.hit[0].curr_dir] = true;
					}
				break;
				//Right
				case 1:
					if (ai.x < Battleship.Model.GRID_DIM - 1) {
						++ai.x;
					} else {
						ai.hit[0].dir[ai.hit[0].curr_dir] = true;
					}
				break;
				//Up
				case 0:
					if (ai.y > 0) {
						--ai.y;
					} else {
						ai.hit[0].dir[ai.hit[0].curr_dir] = true;
					}
				break;
				//Down
				case 2:
					if (ai.y < Battleship.Model.GRID_DIM - 1) {
						++ai.y;
					} else {
						ai.hit[0].dir[ai.hit[0].curr_dir] = true;
					}
				break;
				default:
					console.log("Error: Invalid AI direction (%i)\n", ai.hit[0].curr_dir);
					return;
				break;
			}

			if (Battleship.Model.player[1 - Battleship.Model.curr_player].grid[ai.x][ai.y] !== Battleship.Model.enum_gridstate.EMPTY) {
				ai.hit[0].dir[ai.hit[0].curr_dir] = true;
			}

			//if the direction is still ok then its a valid move
			ai.chosen = !ai.hit[0].dir[ai.hit[0].curr_dir];
		}
	},

	_board_move : function(axis, to, rate) {
		this._board_motion.tend[axis] = to;
		var curr = Battleship.View.get_translate(axis, 'g');
		this._board_motion.trate[axis] = (to > curr) ? rate : -rate;
		this._start_transition();
	},

	_board_rotate : function(axis, to, rate) {
		this._board_motion.rend[axis] = to;
		var curr = Battleship.View.get_rotate(axis, 'g');
		this._board_motion.rrate[axis] = (to > curr) ? rate : -rate;
		this._start_transition();
	},

	_start_transition : function() {
		if (Battleship.Model.game_state === Battleship.Model.enum_gamestate.TRANSITION) {
			return;
		}

		if (!Battleship.Model.do_trans_animation) {
			this._cancel_animation = true;
		}
		Battleship.Logic.start_timer(ANIMATION_SPEED, this._animate_transition.bind(this));
	},

	_start_ai : function() {
		Battleship.Model.game_state = Battleship.Model.enum_gamestate.AI_PLAYING;
		var speed = AI_SPEED;
		if (Battleship.Model.demo_mode) {
			speed += DEMO_DELAY;
		}
		Battleship.Logic.start_timer(speed, this._ai_play.bind(this));
	},

	_start_fireing : function() {
		Battleship.Model.game_state = Battleship.Model.enum_gamestate.FIREING;
		var speed = ANIMATION_SPEED + 80 - Battleship.Model.game_rocket.speed*20;
		Battleship.Logic.start_timer(ANIMATION_SPEED, this._animate_fireing.bind(this));
	},

	_start_message : function() {
		Battleship.Model.game_state = Battleship.Model.enum_gamestate.MESSAGE;
		var speed = ANIMATION_SPEED;
		if (Battleship.Model.demo_mode) {
			speed += DEMO_DELAY;
		}
		Battleship.Logic.start_timer(speed, this._animate_message.bind(this));
	},

	_autoplace_ships : function() {
		var i;
		var tries;
		for (i = 0; i < Battleship.Model.NUM_SHIPS; i++) {
			tries = 0;
			do {
				Battleship.Model.player[Battleship.Model.curr_player].ship[i].x = Math.floor(Battleship.Model.GRID_DIM*Math.random());
				Battleship.Model.player[Battleship.Model.curr_player].ship[i].y = Math.floor(Battleship.Model.GRID_DIM*Math.random());
				Battleship.Model.player[Battleship.Model.curr_player].ship[i].down = Math.random() > 0.5;
				if (++tries >= 5000) {
					throw new Error('Faild to autoplace ship ' + i);
				}
			} while (!this._try_place_ship(i));
		}

	},

	_animate_transition : function() {
		if (Battleship.Menu.curr_menu || !Battleship.Model.do_trans_animation) {
			this._cancel_animation = true;
		}

		var trans_saved_state = Battleship.Model.enum_gamestate.PLACE_SHIPS;
		if (Battleship.Model.game_state !== Battleship.Model.enum_gamestate.TRANSITION)
		{
			trans_saved_state = Battleship.Model.game_state;
			game_state = Battleship.Model.enum_gamestate.TRANSITION;
		}

		var count = 0;
		var i = 0;
		for (i = 0; i < 3; i++) {
			var curr = Battleship.View.get_rotate(i, 'g');
			if (this._cancel_animation ||
			(this._board_motion.rrate[i] < 0.0 && curr <= this._board_motion.rend[i]) ||
			(this._board_motion.rrate[i] > 0.0 && curr >= this._board_motion.rend[i]) ||
			(this._board_motion.rrate[i] == 0.0)
			) {
				Battleship.View.set_rotate(i, this._board_motion.rend[i], 'g');
				++count;
			} else {
				Battleship.View.set_rotate(i, this._board_motion.rrate[i], 'G');
			}

			curr = Battleship.View.get_translate(i, 'g');
			if (this._cancel_animation ||
			(this._board_motion.trate[i] < 0.0 && curr <= this._board_motion.tend[i]) ||
			(this._board_motion.trate[i] > 0.0 && curr >= this._board_motion.tend[i]) ||
			(this._board_motion.trate[i] == 0.0)
			) {
				Battleship.View.set_translate(i, this._board_motion.tend[i], 'g');
				++count;
			} else {
				Battleship.View.set_translate(i, this._board_motion.trate[i],'G');
			}
		}
		Battleship.View.refresh();

		var done = (count === 6);
		if (this._cancel_animation) { this._cancel_animation = false; }

		if (done) { Battleship.Model.game_state = trans_saved_state; }
		return !done;
	},

	_animate_fireing : function() {
		if (Battleship.Menu.curr_menu || Battleship.Model.game_rocket.type === Battleship.Model.enum_rockettype.OFF) {
			this._cancel_animation = true;
		}

		Battleship.View.refresh();

		var done = (this._cancel_animation || !Battleship.Rocket.move());
		this._cancel_animation = false;
		if (done) { this._next_state(); }
		return !done;
	},

	_animate_message : function() {
		if (Battleship.Menu.curr_menu || !Battleship.Model.do_msg_animation) {
			this._cancel_animation = true;
		}

		//If the animation is canclled call back once more at full size
		if (this._cancel_animation && Battleship.Model.game_message.size < MAX_MSG_SIZE)
		{
			Battleship.Model.game_message.size = MAX_MSG_SIZE;
			Battleship.View.refresh();
			return true;
		} else if (Battleship.Model.game_message.size < MAX_MSG_SIZE) {
			//Grow the text
			++Battleship.Model.game_message.size;
			Battleship.View.refresh();
		} else if (Battleship.Model.game_message.delay < MAX_MSG_DELAY) {
			//Wait a bit
			++Battleship.Model.game_message.delay;
		}

		var done = (this._cancel_animation || Battleship.Model.game_message.delay === MAX_MSG_DELAY);
		//stop sound if animation stoppe
		if (this._cancel_animation) {
			//battleship_sound_stop();
		}
		this._cancel_animation = false;
		if (done) { this._next_state(); }
		return !done;
	}
};
