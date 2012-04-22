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
 *  Handels menus.
 *
 *  These files are responsible for the game logic related to menus. They
 *  take care of the movement in and between menus as well as toggling
 *  some variables connect to the menu.
 *
 */
 /**
  * @namespace
  */
Battleship.Menu = {
	/** The main menu, used at start of game. */
	main_menu : null,
	/** The options menu, used in game. */
	options_menu : null,

	/** The current menu */
	curr_menu : null,
	/** The currently selected item in the current menu */
	curr_menu_sel : 0,

	name_selector : { enabled : false },

	/** Inititlizes the game menus */
	init : function() {
		//Rockte fire submenu
		var fire_enabled = this._createMenuItem("Enabled", Battleship.Model.game_rocket, 'draw_fire', this.toggle_bool);
		var fire_len = this._createMenuItem("Length", Battleship.Model.game_rocket, 'len', this.toggle_fire_length);
		var fire_width = this._createMenuItem("Width", Battleship.Model.game_rocket, 'width', this.toggle_fire_width);
		var fire_colour = this._createMenuItem("Colour", Battleship.Model.game_rocket, 'colour', this.toggle_fire_colour);
		var fire_items = [ fire_enabled, fire_len, fire_width, fire_colour ];
		var fire_menu = this._createMenu("Fire", fire_items);

		//Rocket Animation sub menu
		var rocket_enabled =  this._createMenuItem("Path", Battleship.Model.game_rocket, 'type', this.toggle_rocket);
		var rocket_path = this._createMenuItem("Draw Path", Battleship.Model.game_rocket, 'show_path', this.toggle_bool);
		var rocket_size = this._createMenuItem("Size", Battleship.Model.game_rocket, 'size', this.toggle_rocket_size);
		var rocket_speed = this._createMenuItem("Speed", Battleship.Model.game_rocket, 'speed', this.toggle_rocket_speed);
		var rocket_items = [ rocket_enabled, rocket_path, rocket_size, rocket_speed, fire_menu ];
		var rocket_menu = this._createMenu("Rocket", rocket_items);

		//Options Animation submenu
		var animation_trans = this._createMenuItem("Game Board", Battleship.Model, 'do_trans_animation', this.toggle_bool);
		var animation_ai = this._createMenuItem("AI", Battleship.Model, 'do_ai_animation', this.toggle_bool);
		var animation_msg = this._createMenuItem("Message", Battleship.Model, 'do_msg_animation', this.toggle_bool);
		var animation_items = [ animation_trans, animation_ai, animation_msg, rocket_menu ];
		var animation_menu = this._createMenu("Animation", animation_items);

		//Options game submenu
		var gopts_p1_name = this._createMenuItem("P1 Name", Battleship.Model.player[0], 'name', this.toggle_name);
		var gopts_p1_ai = this._createMenuItem("P1 AI", Battleship.Model.player[0], 'ai', this.toggle_ai);
		var gopts_p1_auto = this._createMenuItem("P1 Auto Place", Battleship.Model.player[0], 'auto_place', this.toggle_bool);
		var gopts_p2_name = this._createMenuItem("P2 Name", Battleship.Model.player[1], 'name', this.toggle_name);
		var gopts_p2_ai = this._createMenuItem("P2 AI", Battleship.Model.player[1], 'ai', this.toggle_ai);
		var gopts_p2_auto = this._createMenuItem("P2 Auto Place", Battleship.Model.player[1], 'auto_place', this.toggle_bool);
		var gopts_items = [ gopts_p1_name, gopts_p1_ai, gopts_p1_auto, null, gopts_p2_name, gopts_p2_ai, gopts_p2_auto ];
		var gopts_menu = this._createMenu("Player Options", gopts_items);

		//Fog submenu
		var fog_type = this._createMenuItem("Fog density", Battleship.Model, 'do_fog', this.toggle_fog);
		var fog_regen = this._createMenuItem("Regenerate", null, null, this.toggle_foggen);
		var fog_p1 = this._createMenuItem("P1 Hide Ships", Battleship.Model.player[0], 'fog', this.toggle_bool);
		var fog_p2 = this._createMenuItem("P2 Hide Ships", Battleship.Model.player[1], 'fog', this.toggle_bool);
		var fog_items = [ fog_type, fog_regen, fog_p1, fog_p2 ];
		var fog_menu = this._createMenu("Fog", fog_items);

		//lsys submenu
		var lsys_enabled = this._createMenuItem("Enabled", Battleship.Model, 'do_lsystem', this.toggle_bool);
		var lsys_type = this._createMenuItem("Pattern", Battleship.Model.game_lsys, 'type', this.toggle_lsys_type);
		var lsys_length = this._createMenuItem("Size", Battleship.Model.game_lsys, 'length', this.toggle_lsys_length);
		var lsys_items = [ lsys_enabled, lsys_type, lsys_length ];
		var lsys_menu = this._createMenu("L-Systems", lsys_items);

		//Shadow submenu
		var shadow_enabled = this._createMenuItem("Enabled", Battleship.Model.do_shadows, 0, this.toggle_bool);
		var shadow_table = this._createMenuItem("Table", Battleship.Model.do_shadows, 1, this.toggle_bool);
		var shadow_back_wall = this._createMenuItem("P2 Wall", Battleship.Model.do_shadows, 2, this.toggle_bool);
		var shadow_front_wall = this._createMenuItem("P1 Wall", Battleship.Model.do_shadows, 3, this.toggle_bool);
		var shadow_floor = this._createMenuItem("Floor", Battleship.Model.do_shadows, 4, this.toggle_bool);
		var shadow_items = [ shadow_enabled, shadow_table, shadow_back_wall, shadow_front_wall, shadow_floor ];
		var shadow_menu = this._createMenu("Shadows", shadow_items);

		//Options menu items
		var options_textures = this._createMenuItem("Textures", Battleship.Model, 'do_textures', this.toggle_bool);
		var options_sound = this._createMenuItem("Sound", Battleship.Model, 'do_sound', this.toggle_bool);
		var options_quit = this._createMenuItem("Main Menu", null, null, this.quit_curr_game);

		//Keys menu
		var keys1 = this._createMenuItem("Rotate View: Crtl X/Y/Z", null, null, this.quit_curr_game);
		var keys2 = this._createMenuItem("Move View: Alt X/Y/Z", null, null, this.quit_curr_game);
		var keys3 = this._createMenuItem("Reset View: R", null, null, this.quit_curr_game);
		var keys4 = this._createMenuItem("Place Ship: Enter", null, null, this.quit_curr_game);
		var keys5 = this._createMenuItem("Rotate Ship: f", null, null, this.quit_curr_game);
		var keys6 = this._createMenuItem("Remove Ship: Backspace", null, null, this.quit_curr_game);
		var keys7 = this._createMenuItem("Menu: ESC", null, null, this.quit_curr_game);
		var keys8 = this._createMenuItem("Quit - Q", null, null, this.quit_curr_game);

		var main_new = this._createMenuItem("New Game", null, null, this.newgame);
		var main_onep = this._createMenuItem("1 Player", null, null, this.onep);
		var main_twop = this._createMenuItem("2 Player", null, null, this.twop);
		var main_demo = this._createMenuItem("Demo Mode", null, null, this.demogame);
		var main_quit = this._createMenuItem("Quit", null, null, this.quitgame);
		var main_options = this._createMenu("Options", [ gopts_menu, animation_menu, fog_menu, lsys_menu, shadow_menu, options_textures, options_sound ]);
		var main_keys = this._createMenu("Keys", [ keys1, keys2, keys3, keys4, keys5, keys6, keys7, keys8 ]);
		var main_items = [ main_new, main_onep, main_twop, main_demo, main_options, main_keys, main_quit ];
		this.main_menu = this._createMenu(Battleship.Model.BATTLESHIP_NAME + ' ' + Battleship.Model.BATTLESHIP_VERSION, main_items);

		var options_items = [ gopts_menu, animation_menu, fog_menu, lsys_menu, shadow_menu, options_textures, options_sound, options_quit ];
		this.options_menu = this._createMenu("Options", options_items );
	},

	keypress : function(key, mod) {
		var needRefresh = true;
		if (this.name_selector.enabled) {
			if (key === Battleship.Logic.enum_key.UP) {
				this.name_selector.y = (glfont.TEST_HEIGHT + this.name_selector.y - 1) % glfont.TEST_HEIGHT;
			} else if (key === Battleship.Logic.enum_key.DOWN) {
				this.name_selector.y = (this.name_selector.y + 1) % glfont.TEST_HEIGHT;
			} else if (key === Battleship.Logic.enum_key.LEFT) {
				this.name_selector.x = (glfont.TEST_WIDTH + this.name_selector.x - 1) % glfont.TEST_WIDTH;
			} else if (key === Battleship.Logic.enum_key.RIGHT) {
				this.name_selector.x = (this.name_selector.x + 1) % glfont.TEST_WIDTH;
			} else if (key === Battleship.Logic.enum_key.ENTER) {
				var len = this.name_selector.name.length;
				if (len < Battleship.Model.MAX_NAME_LEN) {
					this.name_selector.name += glfont.test_char(
						this.name_selector.x,
						this.name_selector.y
					);
				} else {
					needRefresh = false;
				}
			} else if (key === Battleship.Logic.enum_key.ESC) {
				this.name_selector.enabled = false;
				this.name_selector.menu.svalue = this.name_selector.name;
				this.name_selector.menu.object[this.name_selector.menu.key] = this.name_selector.name;
			} else if (key === Battleship.Logic.enum_key.BACKSPACE) {
				var len = this.name_selector.name.length;
				if (len > 0) {
					this.name_selector.name = this.name_selector.name.substring(0, len - 1);
				}
			} else {
				var len = this.name_selector.name.length;
				var pos = { x : 0, y : 0 };
				needRefresh = glfont.is_test_char(key,pos) && (len<Battleship.Model.MAX_NAME_LEN);
				if (needRefresh)
				{
					this.name_selector.name += key;
					this.name_selector.x = pos.x;
					this.name_selector.y = pos.y;
				}
			}
		} else {
			if (key === Battleship.Logic.enum_key.UP) {
				this.up();
			} else if (key === Battleship.Logic.enum_key.DOWN) {
				this.down();
			} else if (key === Battleship.Logic.enum_key.LEFT) {
				this.left();
			} else if (key === Battleship.Logic.enum_key.RIGHT) {
				this.right();
			} else if (key === Battleship.Logic.enum_key.ENTER) {
				this.toggle();
			} else if (key === Battleship.Logic.enum_key.BACKSPACE) {
				// gobbel
			} else if (key === Battleship.Logic.enum_key.ESC) {
				if (Battleship.Model.game_state !== Battleship.Model.enum_gamestate.INIT ||
					this.curr_menu.parent !== null)
				{
					this.cancel();
					if (this.curr_menu === null &&
						Battleship.Model.game_state === Battleship.Model.enum_gamestate.PLAYING)
					{
						// TODO: Move this code

						//if a player was previously an ai player need
						//to clear what it knows
						var i;
						for (i = 0; i < 2; i++)
						{
							if (!Battleship.Model.player[i].ai)
							{
								Battleship.Logic._ai_move[i].chosen = false;
								Battleship.Logic._ai_move[i].num_hits = 0;
							}
						}

						//restart ai player
						if (Battleship.Model.player[Battlship.Model.curr_player].ai) {
							Battleship.Logic._start_ai();
						}
					}
				} else {
					needRefresh = false;
				}
			} else {
				needRefresh = false;
			}
		}
		return needRefresh;
	},

	/** Called when the user pushes up in a menu
	 *
	 *  Move up one menu item.
	 */
	up : function() {
		do
		{
			if (this.curr_menu_sel === 0)
				this.curr_menu_sel = this.curr_menu.size - 1;
			else
				--this.curr_menu_sel;
		} while (!this.curr_menu.item[this.curr_menu_sel]);
	},

	/** Called when the user pushes down in a menu
	 *
	 *  Moves down one menu item.
	 */
	down : function() {
		do
		{
			if (this.curr_menu_sel === this.curr_menu.size - 1)
				this.curr_menu_sel = 0;
			else
				++this.curr_menu_sel;
		} while (!this.curr_menu.item[this.curr_menu_sel]);
	},

	/** Called when the user pushes left in a menu
	 *
	 *  This toggles (or decreases) the value connected to the current menu
	 *  item.
	 */
	left : function() {
		if (this.curr_menu.item[this.curr_menu_sel].action) {
			this.curr_menu.item[this.curr_menu_sel].action(
									this.curr_menu.item[this.curr_menu_sel], -1);
		}
	},

	/** Called when the user pushes right in a menu
	 *
	 *  This toggles (or increases) the value connected to the current menu
	 *  item.
	 */
	 right : function() {
		if (this.curr_menu.item[this.curr_menu_sel].action) {
			this.curr_menu.item[this.curr_menu_sel].action(
									this.curr_menu.item[this.curr_menu_sel], 1);
		}
	},

	/** Called when the user pushes enter
	 *
	 *  This toggles (or increases) the value connected to the current menu.
	 *  Or if the current menu item has no value the current menu becomes
	 *  the current selected item.
	 */
	toggle : function() {
		if (this.curr_menu.item[this.curr_menu_sel].action) {
			this.curr_menu.item[this.curr_menu_sel].action(
					this.curr_menu.item[this.curr_menu_sel], 0);
		} else if (this.curr_menu.item[this.curr_menu_sel].size > 0) {
			this.load(this.curr_menu.item[this.curr_menu_sel]);
		}
	},

	/** Called when the user pushes esc
	 *
	 *  Cancles the current menu. Goes to the parent menu.
	 */
	cancel : function() {
		this.curr_menu = this.curr_menu.parent;
		this.curr_menu_sel = 0;
	},

	/** Sets the given menu to the current menu and initiliez it
	 *  @param menu The new menu
	 */
	load : function(menu) {
		menu.parent = this.curr_menu;
		this.curr_menu = menu;
		this.curr_menu_sel = 0;

		//update string value of menu items
		var i;
		for (i = 0; i < this.curr_menu.size; i++) {
			if (!this.curr_menu.item[i]) continue;

			if (this.curr_menu.item[i].action &&
				this.curr_menu.item[i].object) {
				this.curr_menu.item[i].action(
					this.curr_menu.item[i], 0);
			}
		}
	},

	newgame : function(menu, dir) { if (dir === 0) { Battleship.Logic.newgame(); } },

	onep : function(menu, dir) { if (dir === 0) { Battleship.Logic.onep(); } },

	twop : function(menu, dir) { if (dir === 0) { Battleship.Logic.twop(); } },

	demogame : function(menu, dir) { if (dir === 0) { Battleship.Logic.demo(); } },

	quitgame : function(menu, dir) { if (dir === 0) { Battleship.Logic.quit(); } },

	toggle_bool : function(m, dir) {
		if (dir != 0) {
			m.object[m.key] = !m.object[m.key];
		}
		m.svalue = m.object[m.key] ? "On " : "Off";
	},

	toggle_ai : function(m, dir) {
		var val = m.object[m.key];
		val = (val + Battleship.Model.NUM_AI_TYPES + dir) % Battleship.Model.NUM_AI_TYPES;
		m.object[m.key] = val;
		m.svalue = Battleship.Model.aitype_s[val];
	},

	quit_curr_game : function(m, dir) { if (dir == 0) { Battleship.Logic.restart(); } },

	toggle_rocket : function(m, dir) {
		var val = m.object[m.key];
		val = (val + Battleship.Model.NUM_ROCKET_TYPES + dir) % Battleship.Model.NUM_ROCKET_TYPES;
		m.object[m.key] = val;
		m.svalue = Battleship.Model.rockettype_s[val];
	},

	toggle_fog : function(m, dir) {
		var val = m.object[m.key];
		val = (val + Battleship.Model.NUM_FOG_TYPES + dir) % Battleship.Model.NUM_FOG_TYPES;
		m.object[m.key] = val;
		m.svalue = Battleship.Model.fogtype_s[val];
	},

	toggle_foggen : function(m, dir) { if (dir == 0) { Battleship.Model.do_fog = Battleship.Model.enum_fogtype.REGEN; } },

	toggle_name : function(m, dir) {
		if (dir !== 0) {
			Battleship.Menu.name_selector = {
				enabled : true,
				x : 0,
				y : 0,
				name : m.object[m.key],
				menu : m
			};
		}
		m.svalue = m.object[m.key];
	},

	toggle_lsys_type : function(m, dir) {
		var val = m.object[m.key];
		val = (val + lsystem._test.length + dir) % lsystem._test.length;
		m.object[m.key] = val;
		m.svalue = lsystem._test_s[val];
	},

	toggle_lsys_length : function(m, dir) {
		var val = m.object[m.key];
		val = val + dir;
		if (val > Battleship.Model.MAX_LSYSTEM_LENGTH)
			val = Battleship.Model.MAX_LSYSTEM_LENGTH;
		if (val < Battleship.Model.MIN_LSYSTEM_LENGTH)
			val = Battleship.Model.MIN_LSYSTEM_LENGTH;
		m.object[m.key] = val;
		m.svalue = "" + val;
	},

	toggle_rocket_size : function(m, dir) {
		var val = m.object[m.key];
		val = val + dir;
		if (val > Battleship.Model.MAX_ROCKET_SIZE)
			val = Battleship.Model.MAX_ROCKET_SIZE;
		if (val < Battleship.Model.MIN_ROCKET_SIZE)
			val = Battleship.Model.MIN_ROCKET_SIZE;
		m.object[m.key] = val;
		m.svalue = "" + val;
		Battleship.Rocket.update();
	},

	toggle_rocket_speed : function(m, dir) {
		var val = m.object[m.key];
		val = val + dir;
		if (val > Battleship.Model.MAX_ROCKET_SPEED)
			val = Battleship.Model.MAX_ROCKET_SPEED;
		if (val < Battleship.Model.MIN_ROCKET_SPEED)
			val = Battleship.Model.MIN_ROCKET_SPEED;
		m.object[m.key] = val;
		m.svalue = "" + val;
	},

	toggle_fire_length : function(m, dir) {
		var val = m.object[m.key];
		val = val + dir;
		if (val > Battleship.Model.MAX_FIRE_LENGTH)
			val = Battleship.Model.MAX_FIRE_LENGTH;
		if (val < Battleship.Model.MIN_FIRE_LENGTH)
			val = Battleship.Model.MIN_FIRE_LENGTH;
		m.object[m.key] = val;
		m.svalue = "" + val;
		Battleship.Rocket.update();
	},

	toggle_fire_width : function(m, dir) {
		var val = m.object[m.key];
		val = (val + Battleship.Model.NUM_FIRE_WIDTHS + dir) % Battleship.Model.NUM_FIRE_WIDTHS;
		m.object[m.key] = val;
		m.svalue = Battleship.Model.firewidth_s[val];
		Battleship.Rocket.update();
	},

	toggle_fire_colour : function(m, dir) {
		var val = m.object[m.key];
		val = (val + psystem.NUM_PSYSTEM_COLOURS + dir) % psystem.NUM_PSYSTEM_COLOURS;
		m.object[m.key] = val;
		m.svalue = psystem.colours_s[val];
		Battleship.Rocket.update();
	},

	_createMenu : function(name, items) {
		return {
			name : name,
			parent : null,
			item : items,
			size : items.length,
			svalue : null,
			value : null,
			action : null
		};
	},

	_createMenuItem : function(name, object, key, act) {
		return {
			name : name,
			parent : null,
			item : null,
			size : 0,
			svalue : null,
			object : object,
			key : key,
			action : act
		};
	}
};
