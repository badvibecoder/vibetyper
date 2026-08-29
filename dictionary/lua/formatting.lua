-- pad_number zero-pads an integer to a fixed width.
local function pad_number(value, width)
	local text = tostring(math.abs(value))
	if value < 0 then
		return "-" .. string.rep("0", math.max(0, width - #text)) .. text
	end
	return string.rep("0", math.max(0, width - #text)) .. text
end

-- comma_separate inserts thousands separators into an integer.
local function comma_separate(value)
	local negative = value < 0
	local digits = tostring(math.abs(value))
	local out = {}
	local count = 0
	for i = #digits, 1, -1 do
		count = count + 1
		out[#out + 1] = digits:sub(i, i)
		if count % 3 == 0 and i > 1 then
			out[#out + 1] = ","
		end
	end
	local joined = table.concat(out):reverse()
	if negative then
		return "-" .. joined
	end
	return joined
end

-- format_percent renders a ratio as a percentage with one decimal.
local function format_percent(ratio)
	return string.format("%.1f%%", ratio * 100)
end

-- format_bytes renders a byte count in human-readable units.
local function format_bytes(bytes)
	local units = { "B", "KB", "MB", "GB", "TB" }
	local value = bytes
	local unit = 1
	while value >= 1024 and unit < #units do
		value = value / 1024
		unit = unit + 1
	end
	if unit == 1 then
		return string.format("%d B", bytes)
	end
	return string.format("%.1f %s", value, units[unit])
end

-- format_duration renders milliseconds as clock-style text.
local function format_duration(ms)
	local total = math.floor(ms / 1000)
	local hours = math.floor(total / 3600)
	local minutes = math.floor((total % 3600) / 60)
	local seconds = total % 60
	if hours > 0 then
		return string.format("%dh %02dm", hours, minutes)
	end
	if minutes > 0 then
		return string.format("%dm %02ds", minutes, seconds)
	end
	return string.format("%ds", seconds)
end

-- align_right pads text on the left to a column width.
local function align_right(text, width)
	if #text >= width then
		return text
	end
	return string.rep(" ", width - #text) .. text
end

-- align_left pads text on the right to a column width.
local function align_left(text, width)
	if #text >= width then
		return text
	end
	return text .. string.rep(" ", width - #text)
end

-- pluralize appends an "s" unless the count is one.
local function pluralize(count, singular)
	if count == 1 then
		return string.format("%d %s", count, singular)
	end
	return string.format("%d %s", count, singular .. "s")
end

-- format_money renders cents as a currency string.
local function format_money(cents)
	local negative = cents < 0
	local absolute = math.abs(cents)
	local dollars = math.floor(absolute / 100)
	local remainder = absolute % 100
	local sign = negative and "-" or ""
	return string.format("%s$%d.%02d", sign, dollars, remainder)
end

-- truncate_middle keeps the head and tail of a long string.
local function truncate_middle(s, max_len)
	if #s <= max_len then
		return s
	end
	local keep = math.floor((max_len - 1) / 2)
	return s:sub(1, keep) .. "..." .. s:sub(-keep)
end

-- wrap_brackets surrounds a value with a configurable pair.
local function wrap_brackets(value, open, close)
	return open .. value .. close
end

-- prefix_lines prepends a marker to each line of text.
local function prefix_lines(text, marker)
	local result = {}
	for line in text:gmatch("[^\n]*") do
		result[#result + 1] = marker .. line
	end
	return table.concat(result, "\n")
end

-- format_key_value renders "key=value" joined by a separator.
local function format_key_value(key, value, sep)
	return key .. (sep or "=") .. value
end

-- escape_html escapes the five HTML-significant characters.
local function escape_html(text)
	local entities = { ["&"] = "&amp;", ["<"] = "&lt;", [">"] = "&gt;", ['"'] = "&quot;", ["'"] = "&#39;" }
	return (text:gsub("[&<>\"']", entities))
end

-- escape_shell_arg quotes an argument for POSIX shells.
local function escape_shell_arg(arg)
	return "'" .. arg:gsub("'", "'\\''") .. "'"
end

-- indent_block indents every line of text by a number of spaces.
local function indent_block(text, indent)
	return prefix_lines(text, string.rep(" ", indent))
end

-- join_oxford joins items with commas and a final "and".
local function join_oxford(items)
	if #items == 0 then
		return ""
	end
	if #items == 1 then
		return items[1]
	end
	if #items == 2 then
		return items[1] .. " and " .. items[2]
	end
	local head = table.concat(items, ", ", 1, #items - 1)
	return head .. ", and " .. items[#items]
end

-- pad_center centres text within a width using spaces.
local function pad_center(text, width)
	if #text >= width then
		return text
	end
	local left = math.floor((width - #text) / 2)
	local right = width - #text - left
	return string.rep(" ", left) .. text .. string.rep(" ", right)
end

-- format_table aligns rows of cells into fixed-width columns.
local function format_table(rows)
	if #rows == 0 then
		return {}
	end
	local widths = {}
	for _, row in ipairs(rows) do
		for i, cell in ipairs(row) do
			widths[i] = math.max(widths[i] or 0, #tostring(cell))
		end
	end
	local result = {}
	for _, row in ipairs(rows) do
		local cells = {}
		for i, cell in ipairs(row) do
			cells[i] = align_left(tostring(cell), widths[i])
		end
		result[#result + 1] = table.concat(cells, "  ")
	end
	return result
end

-- format_number aligns a column of numbers to the right.
local function format_number(numbers)
	local width = 0
	for _, n in ipairs(numbers) do
		width = math.max(width, #tostring(n))
	end
	local result = {}
	for i, n in ipairs(numbers) do
		result[i] = align_right(tostring(n), width)
	end
	return result
end

-- numbered_list renders items as "1. item" lines.
local function numbered_list(items)
	local result = {}
	for i, item in ipairs(items) do
		result[#result + 1] = string.format("%d. %s", i, item)
	end
	return table.concat(result, "\n")
end
