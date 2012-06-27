window.requestAnimFrame = (function () {
	return (
		window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function (callback) {
			window.setTimeout(callback, 1000 / 60);
		}
	);
})();

var tileSetup = [
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
	0, 0, 1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0,
	1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1,
	0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0,
	0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0,
	0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

jQuery(function($) {
	var wrapper = $("#canvasWrapper");
	var canvasElement = $('<canvas id="gameCanvas" width="' + wrapper.width() + '" height="' + wrapper.height() + '">Your browser does not support canvas.</canvas>');
	var canvas = canvasElement.get(0);
	var context = canvas.getContext("2d");

	var tileHW = 40;

	var horizontalTiles = 15;
	var verticalTiles = 10;

	var bgImage = new Image();
	bgImage.src = 'gfx/backg.png';

	var roadImage = new Image();
	roadImage.src = 'gfx/road.png';

	var stoneImage = new Image();
	stoneImage.src = 'gfx/stone.png';

	var mobImage = new Image();
	mobImage.src = 'gfx/mob.png';

	Mob = function () {
		this.x = -40;
		this.y = 160;
		this.speed = 1;
		this.life = 100;
		this.direction = 1;
		this.lastMove = 0;

		this.draw = function () {
			context.drawImage(mobImage, this.x, this.y, tileHW, tileHW);
		};
	}

	Tile = function () {
		this.type = 0;
		this.canWalkOn = false;
		this.stepsFromEnd = 0;
	}

	var tiles = [];
	for (var i = 0; i < tileSetup.length; i++) {
		tiles[i] = new Tile();
		tiles[i].type = tileSetup[i];
		if (tileSetup[i] === 1) {
			tiles[i].canWalkOn = true;
			/* To be implemented with a pathfinding system. */
			tiles[i].stepsFromEnd = 1;
		}
	}

	var createMap = function () {
		var i = 0;
		for (var y = 0; y < verticalTiles; y++) {
			var tileOffsetY = y * tileHW;
			for (var x = 0; x < horizontalTiles; x++) {
				var tileOffsetX = x * tileHW;
				if (tiles[i].type === 1) {
					context.drawImage(roadImage, tileOffsetX, tileOffsetY, tileHW, tileHW);
				}
				else if (tiles[i].type === 2) {
					context.drawImage(stoneImage, tileOffsetX, tileOffsetY, tileHW, tileHW);
				}
				i++;
			}
		}
	}

	var debug = function (mob) {
		console.log(mob);
	}


	var setMobDir = function (mob) {
		thistile = (((mob.y / tileHW) * horizontalTiles) + mob.x / tileHW);

		/* If at left edge */
		if (mob.x === (horizontalTiles * tileHW) - (tileHW)) {
			return;
		}

		/* If moving up */
		if (mob.direction === 0) {
			if (tiles[thistile - horizontalTiles] === undefined) {
				debug(mob);
			}

			if (tiles[thistile - horizontalTiles].canWalkOn === false) {
				if (tiles[thistile + 1].canWalkOn === true) {
					mob.direction = 1;
					return;
				}
				else {
					mob.direction = 3;
					return;
				}
			}
		}

		/* If moving left */
		else if (mob.direction === 1) {
			if (tiles[thistile + 1] === undefined) {
				debug(mob);
			}
			if (tiles[thistile + 1].canWalkOn === false) {
				if (tiles[thistile - horizontalTiles].canWalkOn === true) {
					mob.direction = 0;
					return;
				}
				else {
					mob.direction = 2;
					return;
				}
			}
		}

		/* If moving down */
		else if (mob.direction === 2) {
			if (tiles[thistile + horizontalTiles] === undefined) {
				debug(mob);
			}
			if (tiles[thistile + horizontalTiles].canWalkOn === false) {
				if (tiles[thistile + 1].canWalkOn === true) {
					mob.direction = 1;
					return;
				}
				else {
					mob.direction = 3;
					return;
				}
			}
		}

		/* If moving right */
		else if (mob.direction === 3) {
			if (tiles[thistile - 1] === undefined) {
				debug(mob);
			}

			if (tiles[thistile - 1].canWalkOn === false) {
				if (tiles[thistile - horizontalTiles].canWalkOn === true) {
					mob.direction = 0;
					return;
				}
				else {
					mob.direction = 2;
					return;
				}
			}
		}
	}

	var frame = 0;

	var moveMob = function (mob, steps) {
		if (steps === undefined) {
			steps = mob.speed;
		}

		var overflow = 0;

		if (mob.direction === 0) {
			blockOffset = Math.round(((mob.y % tileHW) + steps) * 100) / 100;
			mob.y -= steps;
			mob.y = Math.round(mob.y * 100) / 100;
			if (blockOffset > tileHW) {
				overflow = Math.round((mob.y % tileHW) * 100) / 100;
				overflow = Math.round((-overflow + tileHW) * 100) / 100;
				mob.y = Math.round((mob.y + overflow) * 100) / 100;
			}
			if (mob.y % tileHW === 0) {
				setMobDir(mob);
				if (overflow !== 0) {
					moveMob(mob, overflow);
				}
			}
		}
		else if (mob.direction === 1) {
			blockOffset = Math.round(((mob.x % tileHW) + steps) * 100) / 100;
			mob.x += steps;
			mob.x = Math.round(mob.x * 100) / 100;
			if (blockOffset > tileHW) {
				overflow = Math.round((mob.x % tileHW) * 100) / 100;
				mob.x = Math.round((mob.x - overflow) * 100) / 100;
			}
			if (mob.x % tileHW === 0) {
				setMobDir(mob);
				if (overflow !== 0) {
					moveMob(mob, overflow);
				}
			}
		}
		else if (mob.direction === 2) {
			blockOffset = Math.round(((mob.y % tileHW) + steps) * 100) / 100;
			mob.y += steps;
			mob.y = Math.round(mob.y * 100) / 100;
			if (blockOffset > tileHW) {
				overflow = Math.round((mob.y % tileHW) * 100) / 100;
				mob.y = Math.round((mob.y - overflow) * 100) / 100;
			}
			if (mob.y % tileHW === 0) {
				setMobDir(mob);
				if (overflow !== 0) {
					moveMob(mob, overflow);
				}
			}
		}
		else if (mob.direction === 3) {
			blockOffset = Math.round(((mob.x % tileHW) + steps) * 100) / 100;
			mob.x -= steps;
			mob.x = Math.round(mob.x * 100) / 100;
			if (blockOffset > tileHW) {
				overflow = Math.round((mob.x % tileHW) * 100) / 100;
				overflow = Math.round((-overflow + tileHW) * 100) / 100;
				mob.x = Math.round((mob.x + overflow) * 100) / 100;
			}
			if (mob.x % tileHW === 0) {
				setMobDir(mob);
				if (overflow !== 0) {
					moveMob(mob, overflow);
				}
			}
		}
		if (mob.x > (horizontalTiles * tileHW)) {
			mob.life = 0;
		}
	}

	var mobs = [];

	var update = function () {
		if (frame % 120 === 0) {
			newMob = new Mob();
			newMob.speed = Math.floor((Math.random() * 1000) + 1) / 100;
			console.log("Creating new mob with speed: " + newMob.speed);
			mobs.push(newMob);
		}
		for (var i = 0; i < mobs.length; i++) {
			if (mobs[i].life === 0) {
				mobs.splice(i, 1);
				//console.log("Killed a mob. (" + mobs.length + " remains active).");
			}
		}
		frame++;
		for (var i = 0; i < mobs.length; i++) {
			moveMob(mobs[i]);
		}
	}
	var draw = function () {
		context.clearRect(0, 0, 600, 400);
		context.drawImage(bgImage, 0, 0, tileHW * horizontalTiles, tileHW * verticalTiles);

		createMap();
		for (var i = 0; i < mobs.length; i++) {
			mobs[i].draw();
		}
	}

	var mainLoop = function () {
		update();
		draw();
		requestAnimFrame(mainLoop);
	}

	canvasElement.appendTo(wrapper);
	requestAnimFrame(mainLoop);
});
