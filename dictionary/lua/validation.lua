-- is_email does a light structural email check.
local function is_email(s)
	local at = s:find("@")
	if not at or at <= 1 then
		return false
	end
	local domain = s:sub(at + 1)
	if domain:find("@") then
		return false
	end
	return domain:find("%.") ~= nil
end

-- is_phone accepts 7-15 digits with common separator characters.
local function is_phone(s)
	local digits = 0
	for ch in s:gmatch(".") do
		if ch:match("%d") then
			digits = digits + 1
		elseif not ch:match("[%+%-%s%(%)]") then
			return false
		end
	end
	return digits >= 7 and digits <= 15
end

-- is_url checks for a scheme://host shape without spaces.
local function is_url(s)
	local scheme = s:match("^(%a[%w+%-]*)://")
	if not scheme then
		return false
	end
	local rest = s:sub(#scheme + 4)
	return #rest > 0 and not rest:find("%s")
end

-- is_ipv4 validates a dotted-quad IPv4 address.
local function is_ipv4(s)
	local octets = {}
	for part in s:gmatch("%d+") do
		octets[#octets + 1] = tonumber(part)
	end
	if #octets ~= 4 then
		return false
	end
	for _, octet in ipairs(octets) do
		if octet > 255 then
			return false
		end
	end
	return s:match("^%d+%.%d+%.%d+%.%d+$") ~= nil
end

-- is_strong_password requires length, case, digit and symbol.
local function is_strong_password(s)
	if #s < 8 then
		return false
	end
	local has_lower, has_upper, has_digit, has_symbol = false, false, false, false
	for ch in s:gmatch(".") do
		if ch:match("%l") then
			has_lower = true
		elseif ch:match("%u") then
			has_upper = true
		elseif ch:match("%d") then
			has_digit = true
		else
			has_symbol = true
		end
	end
	return has_lower and has_upper and has_digit and has_symbol
end

-- is_luhn validates a card number with the Luhn checksum.
local function is_luhn(number)
	local sum = 0
	for i = #number, 1, -1 do
		local digit = tonumber(number:sub(i, i))
		if not digit then
			return false
		end
		if (#number - i) % 2 == 1 then
			digit = digit * 2
			if digit > 9 then
				digit = digit - 9
			end
		end
		sum = sum + digit
	end
	return sum % 10 == 0
end

-- is_date_iso validates a YYYY-MM-DD date string.
local function is_date_iso(s)
	local year, month, day = s:match("^(%d%d%d%d)-(%d%d)-(%d%d)$")
	if not year then
		return false
	end
	year, month, day = tonumber(year), tonumber(month), tonumber(day)
	if month < 1 or month > 12 or day < 1 then
		return false
	end
	local days = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 }
	if month == 2 and (year % 4 == 0 and (year % 100 ~= 0 or year % 400 == 0)) then
		days[2] = 29
	end
	return day <= days[month]
end

-- is_hex_color accepts #RGB or #RRGGBB form.
local function is_hex_color(s)
	if #s ~= 4 and #s ~= 7 then
		return false
	end
	if s:sub(1, 1) ~= "#" then
		return false
	end
	return s:sub(2):match("^[%x]+$") ~= nil
end

-- is_username enforces 3-20 alphanumeric chars plus _ and -.
local function is_username(s)
	if #s < 3 or #s > 20 then
		return false
	end
	return s:match("^[%w_%-]+$") ~= nil
end

-- is_non_empty rejects strings that are blank after trimming.
local function is_non_empty(s)
	return (s:gsub("^%s+", ""):gsub("%s+$", "")) ~= ""
end

-- is_numeric accepts an optional sign, digits and one decimal point.
local function is_numeric(s)
	return tonumber(s) ~= nil and s:match("^[%+%-]?%d*%.?%d+$") ~= nil
end

-- is_integer_string accepts an optional sign followed by digits only.
local function is_integer_string(s)
	return s:match("^[%+%-]?%d+$") ~= nil
end

-- is_within checks a value against inclusive bounds.
local function is_within(value, lo, hi)
	return value >= lo and value <= hi
end

-- is_one_of checks membership in a fixed set of choices.
local function is_one_of(value, choices)
	for _, choice in ipairs(choices) do
		if value == choice then
			return true
		end
	end
	return false
end

-- is_percent checks a value in the inclusive 0..100 range.
local function is_percent(value)
	return value >= 0 and value <= 100
end

-- is_ascii verifies every character fits in 7-bit ASCII.
local function is_ascii(s)
	for ch in s:gmatch(".") do
		if ch:byte() > 127 then
			return false
		end
	end
	return true
end

-- is_alphanumeric accepts letters and digits only.
local function is_alphanumeric(s)
	if s == "" then
		return false
	end
	return s:match("^[%w]+$") ~= nil
end

-- is_boolean accepts true/false/yes/no/1/0 in any case.
local function is_boolean(s)
	local lower = s:lower()
	return lower == "true" or lower == "false" or lower == "yes" or lower == "no" or lower == "1" or lower == "0"
end

-- is_valid_identifier checks a C-like identifier name.
local function is_valid_identifier(s)
	if s == "" then
		return false
	end
	if not s:sub(1, 1):match("[%a_]") then
		return false
	end
	return s:match("^[%w_]+$") ~= nil
end

-- is_zip_code matches a 5-digit or ZIP+4 postal code.
local function is_zip_code(s)
	if #s == 5 then
		return s:match("^%d%d%d%d%d$") ~= nil
	end
	if #s ~= 10 or s:sub(6, 6) ~= "-" then
		return false
	end
	return s:match("^%d%d%d%d%d%-%d%d%d%d$") ~= nil
end

-- is_sorted checks that a list is in non-decreasing order.
local function is_sorted(values)
	for i = 2, #values do
		if values[i] < values[i - 1] then
			return false
		end
	end
	return true
end
