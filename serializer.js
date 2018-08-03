function serializeComment(section) {
	return ['# '];
}

function serializeFlag(flagId, flagValue) {
	return [`! ${flagId} ${flagValue}`];
}

function serializePalette(paletteId, paletteData) {
	return [
		`PAL ${paletteId}`,
		`NAME ${paletteData.name}`,
		...paletteData.colors.map((line) => line.join(","))
	];
}

function serializeRoom(roomId, roomData) {
	return [
		`ROOM ${roomId}`,
		...roomData.tilemap.map((line) => line.join(",")),
		`NAME ${roomData.name}`,
		...roomData.items.map((item) => `ITM ${item.id} ${item.x},${item.y}`),
		...roomData.exits.map(
			(exit) => `EXT ${exit.x},${exit.y} ${exit.dest.room} ${exit.dest.x},${exit.dest.y}`
		),
		...roomData.endings.map((ending) => `END ${ending.id} ${ending.x},${ending.y}`),
		`PAL ${roomData.palette}`
	];
}

function serializeTile(tileId, tileData, imageStore) {
	let lines = [`TIL ${tileId}`];

	lines = lines.concat(
		imageStore[tileData.drawId][0].map((line) => line.join(""))
	);

	if (imageStore[tileData.drawId].length > 1) {
		lines.push('>');
		lines = lines.concat(
			imageStore[tileData.drawId][1].map((line) => line.join(""))
		);
	}

	if (tileData.name !== null) {
		lines.push(`NAME ${tileData.name}`);
	}

	if (tileData.isWall !== null) {
		lines.push(`WAL ${tileData.isWall}`);
	}

	return lines;
}

function serializeSprite(spriteId, spriteData, imageStore) {
	let lines = [`SPR ${spriteId}`];

	lines = lines.concat(
		imageStore[spriteData.drawId][0].map((line) => line.join(""))
	);

	if (imageStore[spriteData.drawId].length > 1) {
		lines.push('>');
		lines = lines.concat(
			imageStore[spriteData.drawId][1].map((line) => line.join(""))
		);
	}

	if (spriteData.name != null) {
		lines.push(`NAME ${spriteData.name}`);
	}

	if (spriteData.dialogId != null) {
		lines.push(`DLG ${spriteData.dialogId}`);
	}

	if (spriteData.startingPosition != null) {
		const pos = spriteData.startingPosition;
		lines.push(`POS ${pos.room} ${pos.x},${pos.y}`);
	}

	return lines;
}

function serializeItem(itemId, itemData, imageStore) {
	let lines = [`ITM ${itemId}`];

	lines = lines.concat(
		imageStore[itemData.drawId][0].map((line) => line.join(""))
	);

	if (imageStore[itemData.drawId].length > 1) {
		lines.push('>');
		lines = lines.concat(
			imageStore[itemData.drawId][1].map((line) => line.join(""))
		);
	}

	if (itemData.name != null) {
		lines.push(`NAME ${itemData.name}`);
	}

	if (itemData.dialogId != null) {
		lines.push(`DLG ${itemData.dialogId}`);
	}

	return lines;
}

function serializeDialog(dialogId, dialogText) {
	let lines = [`DLG ${dialogId}`];
	const multiline = dialogText.search("\n") > -1;

	if (multiline) {
		lines.push('"""');
	}

	lines.push(dialogText);

	if (multiline) {
		lines.push('"""');
	}

	return lines;
}

function serializeEnding(endingId, endingText) {
	return [
		`END ${endingId}`,
		endingText
	];
}

function serializeVariable(variableId, variableValue) {
	return [
		`VAR ${variableId}`,
		variableValue
	];
}

const serializers = {
	comments: serializeComment,
	flags: serializeFlag,
	palettes: serializePalette,
	rooms: serializeRoom,
	tiles: serializeTile,
	sprites: serializeSprite,
	items: serializeItem,
	dialogs: serializeDialog,
	endings: serializeEnding,
	variables: serializeVariable
}

function serialize(gameData) {
	const title = gameData.title;
	let lines = [];
	lines.push(title);
	lines.push("");

	const plainKeySerializer = (key) => {
		Object.keys(gameData[key]).forEach((id) => {
			lines = lines.concat(
				serializers[key](id, gameData[key][id])
			);
			lines.push("");
		});
	};

	['flags', 'palettes', 'rooms'].forEach(plainKeySerializer);

	['tiles', 'sprites', 'items'].forEach((key) => {
		Object.keys(gameData[key]).forEach((id) => {
			lines = lines.concat(
				serializers[key](id, gameData[key][id], gameData.imageStore)
			);
			lines.push("");
		});
	});

	['dialogs', 'endings', 'variables'].forEach(plainKeySerializer);

	return lines;
}

module.exports = {
	serialize: serialize
}
