-- trim removes leading and trailing whitespace from a string.
local function trim(s)
	return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

-- split breaks a string into a list on a literal delimiter.
local function split(s, sep)
	local parts = {}
	for piece in (s .. sep):gmatch("(.-)" .. sep:gsub("([^%w])", "%%%1")) do
		parts[#parts + 1] = piece
	end
	return parts
end

-- join concatenates a list of strings with a separator.
local function join(parts, sep)
	return table.concat(parts, sep)
end

-- starts_with checks whether s begins with the given prefix.
local function starts_with(s, prefix)
	return s:sub(1, #prefix) == prefix
end

-- ends_with checks whether s ends with the given suffix.
local function ends_with(s, suffix)
	return suffix == "" or s:sub(-#suffix) == suffix
end

-- upper_first capitalises the first letter of a string.
local function upper_first(s)
	if s == "" then
		return s
	end
	return s:sub(1, 1):upper() .. s:sub(2)
end

-- words splits a string into a list of whitespace-delimited words.
local function words(s)
	local result = {}
	for word in s:gmatch("%S+") do
		result[#result + 1] = word
	end
	return result
end

-- word_count counts whitespace-delimited words in a string.
local function word_count(s)
	local count = 0
	for _ in s:gmatch("%S+") do
		count = count + 1
	end
	return count
end

-- reverse_str returns the characters of s in reverse order.
local function reverse_str(s)
	local result = {}
	for i = #s, 1, -1 do
		result[#result + 1] = s:sub(i, i)
	end
	return table.concat(result)
end

-- count_occurrences counts non-overlapping occurrences of a substring.
local function count_occurrences(s, sub)
	if sub == "" then
		return 0
	end
	local count = 0
	local pos = 1
	while true do
		local found = s:find(sub, pos, true)
		if not found then
			break
		end
		count = count + 1
		pos = found + #sub
	end
	return count
end

-- contains reports whether s holds the given substring.
local function contains(s, sub)
	return s:find(sub, 1, true) ~= nil
end

-- replace_all swaps every occurrence of old for new (plain text).
local function replace_all(s, old, new)
	return (s:gsub(old:gsub("([^%w])", "%%%1"), new))
end

-- pad_left pads s on the left with pad to reach total length.
local function pad_left(s, total, pad)
	pad = pad or " "
	if #s >= total then
		return s
	end
	return string.rep(pad, total - #s) .. s
end

-- pad_right pads s on the right with pad to reach total length.
local function pad_right(s, total, pad)
	pad = pad or " "
	if #s >= total then
		return s
	end
	return s .. string.rep(pad, total - #s)
end

-- truncate shortens s to max_len characters with an ellipsis.
local function truncate(s, max_len)
	if #s <= max_len then
		return s
	end
	if max_len <= 3 then
		return s:sub(1, max_len)
	end
	return s:sub(1, max_len - 3) .. "..."
end

-- lines splits a string into a list of lines without the newlines.
local function lines(s)
	local result = {}
	for line in s:gmatch("[^\n]*") do
		result[#result + 1] = line
	end
	return result
end

-- strip_newlines removes every newline from a string.
local function strip_newlines(s)
	return (s:gsub("[\r\n]", ""))
end

-- title_case capitalises the first letter of every word.
local function title_case(s)
	return (s:gsub("(%S)(%S*)", function(first, rest)
		return first:upper() .. rest:lower()
	end))
end

-- slugify turns text into a url-friendly slug.
local function slugify(s)
	local slug = s:lower()
	slug = slug:gsub("[^%w%s%-]", "")
	slug = slug:gsub("%s+", "-")
	slug = slug:gsub("%-+", "-")
	slug = slug:gsub("^%-", ""):gsub("%-$", "")
	return slug
end

-- mask keeps the first and last character, replacing the middle.
local function mask(s)
	if #s <= 2 then
		return s
	end
	return s:sub(1, 1) .. string.rep("*", #s - 2) .. s:sub(-1)
end

-- char_count counts how many times a character appears in s.
local function char_count(s, ch)
	local escaped = ch:gsub("([^%w])", "%%%1")
	local count = 0
	for _ in s:gmatch(escaped) do
		count = count + 1
	end
	return count
end
