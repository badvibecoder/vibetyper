-- to_hex encodes bytes as lowercase hexadecimal text.
local function to_hex(data)
	local digits = "0123456789abcdef"
	local result = {}
	for i = 1, #data do
		local byte = data:byte(i)
		result[#result + 1] = digits:sub(byte // 16 + 1, byte // 16 + 1)
		result[#result + 1] = digits:sub(byte % 16 + 1, byte % 16 + 1)
	end
	return table.concat(result)
end

-- from_hex decodes hexadecimal text back into a string.
local function from_hex(hex)
	if #hex % 2 ~= 0 then
		return nil
	end
	local result = {}
	for i = 1, #hex, 2 do
		local byte = tonumber(hex:sub(i, i + 1), 16)
		if not byte then
			return nil
		end
		result[#result + 1] = string.char(byte)
	end
	return table.concat(result)
end

-- to_base64 encodes a string using the standard alphabet.
local function to_base64(data)
	local alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	local result = {}
	for i = 1, #data, 3 do
		local a = data:byte(i)
		local b = data:byte(i + 1)
		local c = data:byte(i + 2)
		local chunk = a * 65536 + (b or 0) * 256 + (c or 0)
		result[#result + 1] = alphabet:sub(chunk // 262144 + 1, chunk // 262144 + 1)
		result[#result + 1] = alphabet:sub(chunk // 4096 % 64 + 1, chunk // 4096 % 64 + 1)
		result[#result + 1] = b and alphabet:sub(chunk // 64 % 64 + 1, chunk // 64 % 64 + 1) or "="
		result[#result + 1] = c and alphabet:sub(chunk % 64 + 1, chunk % 64 + 1) or "="
	end
	return table.concat(result)
end

-- base64_value maps one base64 character to its 6-bit value.
local function base64_value(ch)
	local value = ch:byte()
	if value >= 65 and value <= 90 then
		return value - 65
	end
	if value >= 97 and value <= 122 then
		return value - 71
	end
	if value >= 48 and value <= 57 then
		return value + 4
	end
	if ch == "+" then
		return 62
	end
	if ch == "/" then
		return 63
	end
	return nil
end

-- from_base64 decodes standard base64 text into a string.
local function from_base64(text)
	local buffer = 0
	local bits = 0
	local result = {}
	for ch in text:gmatch(".") do
		if ch == "=" or ch == "\n" or ch == "\r" then
			-- skip padding and line breaks
		else
			local value = base64_value(ch)
			if not value then
				return nil
			end
			buffer = buffer * 64 + value
			bits = bits + 6
			if bits >= 8 then
				bits = bits - 8
				result[#result + 1] = string.char(math.floor(buffer / (2 ^ bits)) % 256)
			end
		end
	end
	return table.concat(result)
end

-- json_escape escapes a string for embedding in JSON.
local function json_escape(s)
	local escapes = { ['"'] = '\\"', ["\\"] = "\\\\", ["\n"] = "\\n", ["\t"] = "\\t", ["\r"] = "\\r" }
	return (s:gsub('[%c\\"]', escapes))
end

-- json_unescape reverses the common JSON escape sequences.
local function json_unescape(s)
	local unescapes = { n = "\n", t = "\t", r = "\r", ['"'] = '"', ["\\"] = "\\" }
	return (s:gsub("\\(.)", function(esc)
		return unescapes[esc] or esc
	end))
end

-- csv_escape quotes a field when it contains special characters.
local function csv_escape(field)
	if field:find('[,%"\n]') then
		return '"' .. field:gsub('"', '""') .. '"'
	end
	return field
end

-- xml_escape encodes the five XML entities.
local function xml_escape(text)
	local entities = { ["&"] = "&amp;", ["<"] = "&lt;", [">"] = "&gt;", ['"'] = "&quot;", ["'"] = "&apos;" }
	return (text:gsub("[&<>\"']", entities))
end

-- xml_unescape decodes the five standard XML entities.
local function xml_unescape(text)
	local result = text:gsub("&lt;", "<")
	result = result:gsub("&gt;", ">")
	result = result:gsub("&quot;", '"')
	result = result:gsub("&apos;", "'")
	result = result:gsub("&amp;", "&")
	return result
end

-- markdown_escape neutralises markdown punctuation.
local function markdown_escape(text)
	return (text:gsub("([%p])", "\\%1"))
end

-- regex_escape escapes metacharacters for use in a literal pattern.
local function regex_escape(text)
	return (text:gsub("([%^%$%(%)%%%.%[%]%*%+%-%?])", "%%%1"))
end

-- run_length_encode compresses repeated characters as count+char pairs.
local function run_length_encode(data)
	local result = {}
	local i = 1
	while i <= #data do
		local ch = data:sub(i, i)
		local j = i
		while j < #data and data:sub(j + 1, j + 1) == ch and j - i < 254 do
			j = j + 1
		end
		result[#result + 1] = string.format("%d%s", j - i + 1, ch)
		i = j + 1
	end
	return table.concat(result)
end

-- run_length_decode reverses run-length encoded text.
local function run_length_decode(data)
	local result = {}
	for count, ch in data:gmatch("(%d+)(.)") do
		result[#result + 1] = string.rep(ch, tonumber(count))
	end
	return table.concat(result)
end

-- hamming_distance counts differing bits between two bytes.
local function hamming_distance(a, b)
	local xor = a ~ b
	local count = 0
	while xor ~= 0 do
		count = count + xor % 2
		xor = math.floor(xor / 2)
	end
	return count
end

-- xor_obfuscate scrambles bytes with a repeating key.
local function xor_obfuscate(data, key)
	if #key == 0 then
		return data
	end
	local result = {}
	for i = 1, #data do
		local byte = data:byte(i)
		local k = key:byte((i - 1) % #key + 1)
		result[#result + 1] = string.char(byte ~ k)
	end
	return table.concat(result)
end

-- xor_deobfuscate reverses xor_obfuscate (symmetric cipher).
local function xor_deobfuscate(data, key)
	return xor_obfuscate(data, key)
end

-- vigenere_encrypt shifts letters using a repeating keyword.
local function vigenere_encrypt(plain, key)
	if #key == 0 then
		return plain
	end
	local result = {}
	local key_index = 1
	for ch in plain:gmatch(".") do
		if ch:match("%l") then
			local shift = key:byte((key_index - 1) % #key + 1) - 97
			result[#result + 1] = string.char(97 + (ch:byte() - 97 + shift) % 26)
			key_index = key_index + 1
		else
			result[#result + 1] = ch
		end
	end
	return table.concat(result)
end

-- vigenere_decrypt reverses a Vigenere-encrypted string.
local function vigenere_decrypt(cipher, key)
	if #key == 0 then
		return cipher
	end
	local result = {}
	local key_index = 1
	for ch in cipher:gmatch(".") do
		if ch:match("%l") then
			local shift = key:byte((key_index - 1) % #key + 1) - 97
			result[#result + 1] = string.char(97 + (ch:byte() - 97 - shift + 26) % 26)
			key_index = key_index + 1
		else
			result[#result + 1] = ch
		end
	end
	return table.concat(result)
end

-- binary_encode renders a string as a space-separated bit string.
local function binary_encode(data)
	local result = {}
	for i = 1, #data do
		local byte = data:byte(i)
		local bits = {}
		for bit = 7, 0, -1 do
			bits[#bits + 1] = tostring(math.floor(byte / (2 ^ bit)) % 2)
		end
		result[#result + 1] = table.concat(bits)
	end
	return table.concat(result, " ")
end

-- binary_decode parses a space-separated bit string back to a string.
local function binary_decode(text)
	local result = {}
	for bits in text:gmatch("%d+") do
		if #bits ~= 8 then
			return nil
		end
		local byte = 0
		for i = 1, 8 do
			local bit = tonumber(bits:sub(i, i))
			if bit ~= 0 and bit ~= 1 then
				return nil
			end
			byte = byte * 2 + bit
		end
		result[#result + 1] = string.char(byte)
	end
	return table.concat(result)
end

-- rot47 applies the printable-ASCII rotation cipher.
local function rot47(text)
	local result = {}
	for ch in text:gmatch(".") do
		local byte = ch:byte()
		if byte >= 33 and byte <= 126 then
			result[#result + 1] = string.char(33 + (byte - 33 + 47) % 94)
		else
			result[#result + 1] = ch
		end
	end
	return table.concat(result)
end
