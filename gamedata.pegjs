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
section = comment / flag / palette / tile / variable
comment = "#" string* _ { return {type:"comment"} }
title = title:string+ { return title.join(""); }
flag = "! " flag_name:token+ " " flag_value:boolnum {
	return {type:'flag', name:flag_name.join(""), value:flag_value}
}
palette = "PAL " id:token+ _ "NAME " name:string+ _ colors:palette_colors {
	return {
		type: "palette",
		id: id.join(""),
		name: name.join(""),
		colors: colors
	}
}
tile = "TIL " id:token+ _ pixels:tile_source settings:(_ tile_settings)* {
	return {
		type: "tile",
		draw_id: "TIL_" + id.join(""),
		id: id.join(""),
		src: pixels,
		settings:settings.map(second)
	}
}
variable = "VAR " id:token+ _ value:string+ {
	return {
		type: "variable",
		id: id.join(""),
		value: value
	}
}
tile_source = head:tile_line tail:(_ tile_line)+ {
	return [head].concat(tail.map(second))
}
tile_settings = tile_wall / tile_name / tile_color
tile_wall = "WAL " is_wall:bool_string {
	return {tag:"wall", value:is_wall}
}
tile_name = "NAME " name:string+ {
	return {tag:"name", value:name.join("")}
}
tile_color = "COL " color_index:numeral {
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
byte = nums:numeral+ {
	return parseInt(nums.join(""), 10)
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
_ = [ \t]* "\n"