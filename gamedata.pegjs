{
	function second(el) {
		return el[1];
	}
}

game = title:title sections:(_+ section)* _* {
	return {
		title:title,
		sections:sections.map(second)
	}
}
section = comment / flag / palette / tile / variable / room
comment = "#" string* _ { return {type:"comment"} }
title = title:string+ { return title.join(""); }
flag = "! " flag_name:token+ " " flag_value:boolnum {
	return {type:'flag', name:flag_name.join(""), value:flag_value}
}
palette = "PAL " id:id _ "NAME " name:string+ _ colors:palette_colors {
	return {
		type: "palette",
		id: id,
		name: name.join(""),
		colors: colors
	}
}
tile = "TIL " id:id _ pixels:tile_source second_frame:(_ ">" _ tile_source)? settings:(_ tile_settings)* {
	return {
		type: "tile",
		draw_id: "TIL_" + id,
		id: id,
		src: pixels,
		second_frame: second_frame ? second_frame[3] : null,
		settings:settings.map(second)
	}
}
variable = "VAR " id:id _ value:string+ {
	return {
		type: "variable",
		id: id,
		value: value
	}
}
room = "ROOM " id:id _ tiles:room_source settings:(_ room_settings)* {
	return {
		type: "room",
		id: id,
		tiles: tiles,
		settings: settings
	}
}
room_source = head:room_line tail:(_ room_line)+ {
	return [head].concat(tail.map(second))
}
room_line = head:id tail:("," id)+ {
	return [head].concat(tail.map(second))
}
room_settings = room_name / room_palette / room_item / room_exit / room_end
room_palette = "PAL " id:id {
	return {tag:"palette", value:id}
}
room_item = "ITM " id:id ws position:coord {
	return {tag:"item", id:id, position:position}
}
room_exit = "EXT " exit_pos:coord ws+ destination:id ws+ dest_pos:coord {
	return {
		tag:"exit",
		position:exit_pos,
		destination: {
			id:destination,
			position:dest_pos
		}
	}
}
room_end = "END " id:id ws end_pos:coord {
	return {
		tag:"end",
		id:id,
		position:end_pos
	}
}
tile_source = head:tile_line tail:(_ tile_line)+ {
	return [head].concat(tail.map(second))
}
tile_settings = tile_wall / tile_name / tile_color
tile_wall = "WAL " is_wall:bool_string {
	return {tag:"wall", value:is_wall}
}

room_name = name_tag
tile_name = name_tag
name_tag = "NAME " name:string+ {
	return {tag:"name", value:name.join("")}
}

tile_color = color_tag
color_tag = "COL " color_index:numeral {
	return {tag:"color_index", value:parseInt(numeral, 10)}
}


tile_line = bit+
palette_colors = background:color_line _ tile:color_line _ sprite:color_line _{
	return {
		background:background,
		tile:tile,
		sprite:sprite
	}
}
color_line = red:byte "," green:byte "," blue:byte {
	return [red, green, blue]
}
id = id:token+ {
	return id.join("")
}
byte = number
coord = x:number "," y:number {
	return [x, y]
}
number = digits:numeral+ {
	return parseInt(digits.join(""), 10)
}
numeral = [0-9]
token = [A-Za-z0-9\-_]
boolnum = digit:("0" / "1") {
	return parseInt(digit, 10)
}
bool_string = flag:("true" / "false") {
	return flag === "true"
}
bit = boolnum
string = [ A-Za-z0-9\-_\.]
_ = ws* "\n"
ws = [ \t]