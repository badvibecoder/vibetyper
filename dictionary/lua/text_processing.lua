-- tokenize splits text into lowercase word tokens.
local function tokenize(text)
	local result = {}
	for word in text:lower():gmatch("%w+") do
		result[#result + 1] = word
	end
	return result
end

-- word_frequency tallies tokens into a map.
local function word_frequency(text)
	local counts = {}
	for word in text:lower():gmatch("%w+") do
		counts[word] = (counts[word] or 0) + 1
	end
	return counts
end

-- strip_punctuation removes non-alphanumeric characters.
local function strip_punctuation(text)
	return (text:gsub("[^%w%s]", ""))
end

-- count_sentences counts sentence-ending punctuation marks.
local function count_sentences(text)
	local count = 0
	for _ in text:gmatch("[%.%?!]") do
		count = count + 1
	end
	return count
end

-- is_palindrome checks whether text reads the same both ways.
local function is_palindrome(text)
	local clean = text:lower():gsub("[^%w]", "")
	return clean == clean:reverse()
end

-- pig_latin converts a single word to Pig Latin.
local function pig_latin(word)
	if word == "" then
		return word
	end
	local first = word:sub(1, 1):lower()
	if first:match("[aeiou]") then
		return word .. "way"
	end
	return word:sub(2) .. first .. "ay"
end

-- rot13 applies the classic Caesar variant to ASCII letters.
local function rot13(text)
	return (text:gsub("%a", function(ch)
		local base = ch:lower() == ch and 97 or 65
		return string.char((ch:byte() - base + 13) % 26 + base)
	end))
end

-- caesar shifts letters by a fixed amount, wrapping at z/Z.
local function caesar(text, shift)
	return (text:gsub("%a", function(ch)
		local base = ch:lower() == ch and 97 or 65
		return string.char((ch:byte() - base + shift) % 26 + base)
	end))
end

-- extract_quoted pulls the first double-quoted substring out of text.
local function extract_quoted(text)
	local start = text:find('"')
	if not start then
		return nil
	end
	local finish = text:find('"', start + 1)
	if not finish then
		return nil
	end
	return text:sub(start + 1, finish - 1)
end

-- remove_duplicate_words keeps the first occurrence of each word.
local function remove_duplicate_words(text)
	local seen = {}
	local result = {}
	for word in text:gmatch("%S+") do
		local key = word:lower()
		if not seen[key] then
			seen[key] = true
			result[#result + 1] = word
		end
	end
	return table.concat(result, " ")
end

-- longest_word finds the largest token in a string.
local function longest_word(text)
	local best = ""
	for word in text:gmatch("%S+") do
		if #word > #best then
			best = word
		end
	end
	return best
end

-- shortest_word finds the smallest token in a string.
local function shortest_word(text)
	local best = nil
	for word in text:gmatch("%S+") do
		if not best or #word < #best then
			best = word
		end
	end
	return best
end

-- average_word_length returns the mean token length.
local function average_word_length(text)
	local total, count = 0, 0
	for word in text:gmatch("%S+") do
		total = total + #word
		count = count + 1
	end
	if count == 0 then
		return 0
	end
	return total / count
end

-- wrap_text breaks text into lines of at most width characters.
local function wrap_text(text, width)
	local result = {}
	local current = ""
	for word in text:gmatch("%S+") do
		if current ~= "" and #current + 1 + #word > width then
			result[#result + 1] = current
			current = ""
		end
		if current ~= "" then
			current = current .. " "
		end
		current = current .. word
	end
	if current ~= "" then
		result[#result + 1] = current
	end
	return result
end

-- indent_lines prefixes every line of text with a marker.
local function indent_lines(text, marker)
	local result = {}
	for line in text:gmatch("[^\n]*") do
		result[#result + 1] = marker .. line
	end
	return table.concat(result, "\n")
end

-- normalize_spaces collapses runs of whitespace into single spaces.
local function normalize_spaces(text)
	return (text:gsub("%s+", " "):gsub("^%s", ""):gsub("%s$", ""))
end

-- capitalize_sentences capitalises the first letter of each sentence.
local function capitalize_sentences(text)
	local result = text:gsub("^%s*(%a)", function(first)
		return first:upper()
	end)
	return (result:gsub("([%.%?!]%s+)(%a)", function(punct, first)
		return punct .. first:upper()
	end))
end

-- count_syllables estimates syllables with a vowel-run heuristic.
local function count_syllables(word)
	local lower = word:lower()
	local count = 0
	local in_vowel = false
	for ch in lower:gmatch(".") do
		local is_vowel = ch:match("[aeiou]")
		if is_vowel and not in_vowel then
			count = count + 1
		end
		in_vowel = is_vowel
	end
	if #lower > 1 and lower:sub(-1) == "e" and count > 1 then
		count = count - 1
	end
	return math.max(count, 1)
end

-- redact keeps the first and last letter of each word, masking the middle.
local function redact(text)
	local result = {}
	for word in text:gmatch("%S+") do
		if #word <= 2 then
			result[#result + 1] = word
		else
			result[#result + 1] = word:sub(1, 1) .. string.rep("*", #word - 2) .. word:sub(-1)
		end
	end
	return table.concat(result, " ")
end

-- reverse_words reverses the order of words in a sentence.
local function reverse_words(text)
	local result = {}
	for word in text:gmatch("%S+") do
		result[#result + 1] = word
	end
	local out = {}
	for i = #result, 1, -1 do
		out[#out + 1] = result[i]
	end
	return table.concat(out, " ")
end

-- mask_email hides the local part of an email address.
local function mask_email(email)
	local at = email:find("@")
	if not at then
		return email
	end
	local local_part = email:sub(1, at - 1)
	if #local_part <= 2 then
		return string.rep("*", #local_part) .. email:sub(at)
	end
	return local_part:sub(1, 1) .. string.rep("*", #local_part - 2) .. local_part:sub(-1) .. email:sub(at)
end
