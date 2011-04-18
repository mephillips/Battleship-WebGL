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
 * Contains data portion of the Battleship game.
 *
 */

/**
 * @namespace
 */
Battleship.Model = {
	/** The name of the Game */
	BATTLESHIP_NAME : "Battleship",
	/** The current version */
	BATTLESHIP_VERSION : "v1.0",

	/** The width/height of the playing grid */
	GRID_DIM : 10,
	/** The length of the longest ship */
	MAX_SHIP_LEN : 5,
	/** The maximum number of possible misses */
	MAX_MISSES : 100, //GRID_DIM*GRID_DIM,
	/** The maxiumum number of possible hits */
	MAX_HITS : 17, //(CARRIER_LEN + BATTLESHIP_LEN + DESTROYER_LEN + SUB_LEN + PT_LEN),
	/** Maximum length for a player name */
	MAX_NAME_LEN : 9,

	/** The possible states the game may be in */
	enum_gamestate : {
		INIT : 0,
		TRANSITION : 1,
		PLACE_SHIPS : 2,
		PLAYING : 3,
		AI_PLAYING : 4,
		FIREING : 5,
		MESSAGE : 6,
		OVER : 7
	},

	NUM_AI_TYPES : 4,
	/** The possible types of AI */
	enum_aitype : {
		HUMAN  : 'Human    ',
		EASY   : 'Easy AI  ',
		NORMAL : 'Normal AI',
		HARD   : 'Hard AI  '
	},

	NUM_TEST_TYPES : 10,
	/** The possible types of tests*/
	enum_testtype : {
		NONE : "None",
		PRIMITIVE : "Primitive",
		CLOCK : "Clock",
		MUG : "Mug",
		PEG : "Peg",
		SHIPS : "Ships",
		FONT : "Font",
		FOG : "Fog",
		LSYSTEM : "Lsystem",
		ROCKET : "Rocket"
	},

	/** Possible states for a ship */
	enum_shipstate : {
		NOT_PLACED : 0,
		PLACING : 1,
		PLACED : 2,
		SUNK : 3
	},

	/** Possible states for a grid block */
	enum_gridstate : {
		EMPTY : 0,
		MISS : 1,
		HIT : 2
	},

	NUM_SHIPS : 5,
	/** The types of ships */
	enum_shiptype : {
		CARRIER : 'Carrier',
		BATTLESHIP : 'Batteship',
		DESTROYER : 'Destroyer',
		SUB : 'Sub',
		PT : 'PT Boat',
		NO_SHIP : 'NO_SHIP'
	},
	SHIP_IDS : [ 'CARRIER', 'BATTLESHIP', 'DESTROYER', 'SUB', 'PT', 'NO_SHIP' ],
	SHIP_LENGTHS : [ 5, 4, 3, 3, 2 ],

	NUM_FOG_TYPES : 4,
	/** The possible types of fog */
	enum_fogtype : {
		OFF 	: 'Off   ',
		LIGHT 	: 'Light ',
		MEDIUM 	: 'Medium',
		HEAVY 	: 'Heavy ',
		REGEN	: 'Regen '
	},

	/** The number of places shadows are draw */
	NUM_SHADOWS : 5,
	enum_shadow : {
		ALL : 0,
		TABLE : 1,
		BACK_WALL : 2,
		FRONT_WALL : 3,
		FLOOR : 4
	},

	/** How many rocket paths there are */
	NUM_ROCKET_TYPES : 3,
	/** The possible rocket paths */
	enum_rockettype : {
		OFF		: 'Off ',
		SIDE	: 'Side',
		TOP		: 'Top '
	},
	/** Minimun rocket size */
	MIN_ROCKET_SIZE : 1,
	/** Maximum rocket size */
	MAX_ROCKET_SIZE : 5,
	/** Minimun rocket speed */
	MIN_ROCKET_SPEED : 1,
	/** Maximum rocket speed */
	MAX_ROCKET_SPEED : 5,
	/** Minimun rocket size */
	MIN_FIRE_LENGTH : 2,
	/** Maximum rocket size */
	MAX_FIRE_LENGTH : 6,

	/** How many fire widths there are */
	NUM_FIRE_WIDTHS : 3,
	/** The possible rocket paths */
	enum_firewidth : {
		SKINNY : 'Skinny',
		EQUAL	: 'Equal ',
		WIDE	: 'Wide  '
	},

	/** Minum length for lsystem */
	MIN_LSYSTEM_LENGTH : 1,
	/** Maximum length for lsystem */
	MAX_LSYSTEM_LENGTH : 10,

	/** Keeps track of the game state */
	game_state : 0,
	/** An array containing the state for each player */
	player : [],
	/** Inder into the player array of the current player */
	curr_player : null,
	/** The current game message */
	game_message : null,
	/** Name selector */
	name_selector : null,
	/** A structure containg information on the current lsys */
	game_lsys : null,
	/** A structure containing information about the rocket */
	game_rocket : null,

	/** True when demo mode is active */
	demo_mode : null,
	/** Used to enabled renering tests */
	do_test : null,
	/** Debug value used to draw axis */
	do_lines : null,
	/** Used to disable/enable textrues */
	do_textures : null,
	/** Used to disable/enable fog */
	do_fog : null,
	/** Used to disable/enable lystems */
	do_lsystem : null,
	/** True if game board movement shoudl be animated */
	do_trans_animation : null,
	/** True if AI movement should be animated */
	do_ai_animation : null,
	/** True if message animation should take place */
	do_msg_animation : null,
	/** [0] is true if shadows are enable. The rest of the indecies are
	*  for enabling different shadows, see enum. */
	do_shadows : [],

	/** @private For first time init. Not really need now in js */
	_first_time : true,

	init : function() {
		var p, i, j;
		for (p = 0; p < 2; p++) {
			this.player[p] = {
				grid : new Array(this.GRID_DIM),
				ship_at : new Array(this.GRID_DIM),
				ship : new Array(this.NUM_SHIPS)
			};
			//clear grid state
			for (i = 0; i < this.GRID_DIM; i++) {
				this.player[p].grid[i] = new Array(this.GRID_DIM);
				for (j = 0; j < this.GRID_DIM; j++) {
					this.player[p].grid[i][j] = this.enum_gridstate.EMPTY;
				}
			}
			//clear grid ship
			for (i = 0; i < this.GRID_DIM; i++) {
				this.player[p].ship_at[i] = new Array(this.GRID_DIM);
				for (j = 0; j < this.GRID_DIM; j++) {
					this.player[p].ship_at[i][j] = this.enum_shiptype.NO_SHIP;
				}
			}
			//init ships
			for (i = 0; i < this.NUM_SHIPS; i++) {
				this.player[p].ship[i] = {};
				this.player[p].ship[i].down = false;
				this.player[p].ship[i].x = 0;
				this.player[p].ship[i].y = 0;
				this.player[p].ship[i].num_hits = 0;
				//detrmine length
				this.player[p].ship[i].length = this.SHIP_LENGTHS[i];
				this.player[p].ship[i].state = this.enum_shipstate.NOT_PLACED;
			}
			this.player[p].num_misses = 0;
			this.player[p].num_hits = 0;
			this.player[p].num_sunk = 0;
			this.player[p].sel_x = 0;
			this.player[p].sel_y = 0;
		}

		this.curr_player = 0;

		if (this._first_time) {
			this.demo_mode = false;
			this.do_fog = this.enum_fogtype.MEDIUM;
			this.do_trans_animation = true;
			this.do_ai_animation = true;
			this.do_msg_animation = true;
			this.do_textures = true;
			this.do_lines = false;
			this.do_lsystem = true;

			for (i = 0; i < this.NUM_SHADOWS; i++) {
				this.do_shadows[i] = true;
			}
			this.do_shadows[this.enum_shadow.FLOOR] = false;

			this.name_selector = {
				enabled : false,
				x : 0,
				y : 0,
				name : ''
			};

			this.game_lsys = {
				type : 7,
				length : this.MIN_LSYSTEM_LENGTH
			};

			this.game_rocket = {
				type : this.enum_rockettype.SIDE,
				show_path : false,
				size : 2,
				draw_fire : true,
				len : 3,
				width : this.enum_firewidth.SKINNY,
				speed : 4,
				colour : null
			};

			this.player[0].name = "Player 1";
			this.player[0].ai = this.enum_aitype.HUMAN;
			this.player[0].auto_place = false;
			this.player[0].fog = false;
			this.player[1].name = "Player 2";
			this.player[1].ai = this.enum_aitype.HARD;
			this.player[1].auto_place = true;
			this.player[1].fog = true;

			this._first_time = false;
		}
	}
};
