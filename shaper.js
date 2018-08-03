function noop(section, gameData) {
	return null;
}

function consumePalette(section, gameData) {
	return {
		name: section.name,
		colors: [
			section.colors.background,
			section.colors.tile,
			section.colors.sprite
		]
	};
}

function consumeDialog(section, gameData) {
	return section.script;
}

function consumeEnding(section, gameData) {
	return section.text;
}

function consumeFlag(section, gameData) {
	return section.value;
}

function consumeVariable(section, gameData) {
	return section.value;
}

function consumeTile(section, gameData) {
	const isAnimated = section.second_frame !== null;
	let baseObject = {
		drawId: section.draw_id, // field rename
		colorIndex: 1, // field rename
		animation: {
			isAnimated: isAnimated,
			frameIndex: 0,
			frameCount: isAnimated ? 2 : 1
		},
		name: null,
		isWall: null
	};
	storeImageData(section, gameData);
	applyTileSettings(section.settings, baseObject);
	return baseObject;
}

function consumeItem(section, gameData) {
	const isAnimated = section.second_frame !== null;
	let baseObject = {
		drawId: section.draw_id, // field rename
		colorIndex: 2, // field rename
		dialogId: null,
		animation: {
			isAnimated: isAnimated,
			frameIndex: 0,
			frameCount: isAnimated ? 2 : 1
		},
		name: null
	};
	storeImageData(section, gameData);
	applyItemSettings(section.settings, baseObject);
	return baseObject;
}

function consumeSprite(section, gameData) {
	const isAnimated = section.second_frame !== null;
	let baseObject = {
		drawId: section.draw_id,
		colorIndex: 2,
		dialogId: null,
		// these location attributes are used to store sprites in motion
		room: null,
		x: -1,
		y: -1,
		// this attribute is moved from a global in bitsy.js into each sprite here
		startingPosition: null,
		walkingPath: [],
		animation: {
			isAnimated: isAnimated,
			frameIndex: 0,
			frameCount: isAnimated ? 2 : 1
		},
		inventory: {},
		name: null
	};
	storeImageData(section, gameData);
	applySpriteSettings(section.settings, baseObject);
	return baseObject;
}

function consumeRoom(section, gameData) {
	let baseObject = {
		id: section.id,
		tilemap: section.tiles,
		walls: [],
		exits: [],
		endings: [],
		items: [],
		palette: null,
		name: null
	}
	applyRoomSettings(section.settings, baseObject);
	return baseObject;
}

function applyRoomSettings(roomSettings, roomObject) {
	roomSettings.forEach((setting) => {
		if (setting.tag == 'name') {
			roomObject.name = setting.value;
		}
		if (setting.tag == 'palette') {
			roomObject.palette = setting.value;
		}
		if (setting.tag == 'item') {
			roomObject.items.push({
				id: setting.id,
				x: setting.position[0],
				y: setting.position[1]
			});
		}
		if (setting.tag == 'end') {
			roomObject.endings.push({
				id: setting.id,
				x: setting.position[0],
				y: setting.position[1]
			});
		}
		if (setting.tag == 'exit') {
			roomObject.exits.push({
				x: setting.position[0],
				y: setting.position[1],
				dest: {
					room: setting.destination.id,
					x: setting.destination.position[0],
					y: setting.destination.position[1]
				}
			});
		}
	});
}


function applyTileSettings(tileSettings, tileObject) {
	tileSettings.forEach((setting) => {
		if (setting.tag == 'wall') {
			tileObject.isWall = setting.value;
		}
		if (setting.tag == 'name') {
			tileObject.name = setting.value;
		}
		if (setting.tag == 'color_index') {
			tileObject.colorIndex = setting.value;
		}
	});
}

function applySpriteSettings(spriteSettings, spriteObject) {
	spriteSettings.forEach((setting) =>  {
		if (setting.tag == 'dialog') {
			spriteObject.dialogId = setting.dialog_id;
		}
		if (setting.tag == 'name') {
			spriteObject.name = setting.value;
		}
		if (setting.tag == 'color_index') {
			spriteObject.colorIndex = setting.value;
		}
		if (setting.tag == 'position') {
			// in bitsy.js, this object is stored in the global
			// spriteStartingPositions object. I don't think I want to preserve
			// that structure
			spriteObject.startingPosition = {
				room: setting.room_id,
				x: setting.position[0],
				y: setting.position[1]
			};
		}
		if (setting.tag == 'item') {
			spriteObject.inventory[setting.item_id] = setting.count;
		}
	});
}

function applyItemSettings(itemSettings, itemObject) {
	itemSettings.forEach((setting) => {
		if (setting.tag == 'dialog') {
			itemObject.dialogId = setting.dialog_id;
		}
		if (setting.tag == 'name') {
			itemObject.name = setting.value;
		}
		if (setting.tag == 'color_index') {
			itemObject.colorIndex = setting.value;
		}
	});
}

function storeImageData(section, gameData) {
	let imageData = [];
	imageData.push(section.src);
	if (section.second_frame) {
		imageData.push(section.second_frame);
	}
	gameData.imageStore[section.draw_id] = imageData;
}

const typeKeyMapping = {
	comment: 'comments',
	flag: 'flags',
	palette: 'palettes',
	room: 'rooms',
	tile: 'tiles',
	sprite: 'sprites',
	item: 'items',
	dialog: 'dialogs',
	ending: 'endings',
	variable: 'variables'
};

const typeShapers = {
	comment: noop,
	flag: consumeFlag,
	palette: consumePalette,
	room: consumeRoom,
	tile: consumeTile,
	sprite: consumeSprite,
	item: consumeItem,
	dialog: consumeDialog,
	ending: consumeEnding,
	variable: consumeVariable
}

function reshape(raw_parse_data) {
	let gameData = {
		title: null,
		rooms: {},
		palettes: {},
		tiles: {},
		sprites: {},
		items: {},
		dialogs: {},
		endings: {},
		variables: {},
		flags: {},
		imageStore: {}
	};

	// title
	gameData.title = raw_parse_data.title;

	// sections
	raw_parse_data.sections.forEach((section) => {
		if (section.type !== 'comment') {
			let typeKey = typeKeyMapping[section.type];
			let shapedSection = typeShapers[section.type](section, gameData);
			gameData[typeKey][section.id] = shapedSection;
		}
	});

	return gameData;
}

module.exports = {
	reshape: reshape
};
