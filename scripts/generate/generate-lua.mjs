// generate-lua.mjs
// Generates the Lua dictionary for vibetyper: a set of .lua files whose
// functions each become one typing block (blank-line split mode).
//
// Run from anywhere:
//   node scripts/generate/generate-lua.mjs
//
// Each block is a complete, self-contained `local function ... end` unit.
// Blocks are separated by exactly one blank line and NEVER contain a blank
// line inside, so the blank-mode splitter yields one block per function.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../../dictionary/lua');
fs.mkdirSync(outDir, { recursive: true });

// ---------------------------------------------------------------------------
// 1. string_utils.lua
// ---------------------------------------------------------------------------
const string_utils = [
  `-- trim removes leading and trailing whitespace from a string.
local function trim(s)
	return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end`,

  `-- split breaks a string into a list on a literal delimiter.
local function split(s, sep)
	local parts = {}
	for piece in (s .. sep):gmatch("(.-)" .. sep:gsub("([^%w])", "%%%1")) do
		parts[#parts + 1] = piece
	end
	return parts
end`,

  `-- join concatenates a list of strings with a separator.
local function join(parts, sep)
	return table.concat(parts, sep)
end`,

  `-- starts_with checks whether s begins with the given prefix.
local function starts_with(s, prefix)
	return s:sub(1, #prefix) == prefix
end`,

  `-- ends_with checks whether s ends with the given suffix.
local function ends_with(s, suffix)
	return suffix == "" or s:sub(-#suffix) == suffix
end`,

  `-- upper_first capitalises the first letter of a string.
local function upper_first(s)
	if s == "" then
		return s
	end
	return s:sub(1, 1):upper() .. s:sub(2)
end`,

  `-- words splits a string into a list of whitespace-delimited words.
local function words(s)
	local result = {}
	for word in s:gmatch("%S+") do
		result[#result + 1] = word
	end
	return result
end`,

  `-- word_count counts whitespace-delimited words in a string.
local function word_count(s)
	local count = 0
	for _ in s:gmatch("%S+") do
		count = count + 1
	end
	return count
end`,

  `-- reverse_str returns the characters of s in reverse order.
local function reverse_str(s)
	local result = {}
	for i = #s, 1, -1 do
		result[#result + 1] = s:sub(i, i)
	end
	return table.concat(result)
end`,

  `-- count_occurrences counts non-overlapping occurrences of a substring.
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
end`,

  `-- contains reports whether s holds the given substring.
local function contains(s, sub)
	return s:find(sub, 1, true) ~= nil
end`,

  `-- replace_all swaps every occurrence of old for new (plain text).
local function replace_all(s, old, new)
	return (s:gsub(old:gsub("([^%w])", "%%%1"), new))
end`,

  `-- pad_left pads s on the left with pad to reach total length.
local function pad_left(s, total, pad)
	pad = pad or " "
	if #s >= total then
		return s
	end
	return string.rep(pad, total - #s) .. s
end`,

  `-- pad_right pads s on the right with pad to reach total length.
local function pad_right(s, total, pad)
	pad = pad or " "
	if #s >= total then
		return s
	end
	return s .. string.rep(pad, total - #s)
end`,

  `-- truncate shortens s to max_len characters with an ellipsis.
local function truncate(s, max_len)
	if #s <= max_len then
		return s
	end
	if max_len <= 3 then
		return s:sub(1, max_len)
	end
	return s:sub(1, max_len - 3) .. "..."
end`,

  `-- lines splits a string into a list of lines without the newlines.
local function lines(s)
	local result = {}
	for line in s:gmatch("[^\\n]*") do
		result[#result + 1] = line
	end
	return result
end`,

  `-- strip_newlines removes every newline from a string.
local function strip_newlines(s)
	return (s:gsub("[\\r\\n]", ""))
end`,

  `-- title_case capitalises the first letter of every word.
local function title_case(s)
	return (s:gsub("(%S)(%S*)", function(first, rest)
		return first:upper() .. rest:lower()
	end))
end`,

  `-- slugify turns text into a url-friendly slug.
local function slugify(s)
	local slug = s:lower()
	slug = slug:gsub("[^%w%s%-]", "")
	slug = slug:gsub("%s+", "-")
	slug = slug:gsub("%-+", "-")
	slug = slug:gsub("^%-", ""):gsub("%-$", "")
	return slug
end`,

  `-- mask keeps the first and last character, replacing the middle.
local function mask(s)
	if #s <= 2 then
		return s
	end
	return s:sub(1, 1) .. string.rep("*", #s - 2) .. s:sub(-1)
end`,

  `-- char_count counts how many times a character appears in s.
local function char_count(s, ch)
	local escaped = ch:gsub("([^%w])", "%%%1")
	local count = 0
	for _ in s:gmatch(escaped) do
		count = count + 1
	end
	return count
end`,
];

// ---------------------------------------------------------------------------
// 2. math_utils.lua
// ---------------------------------------------------------------------------
const math_utils = [
  `-- gcd computes the greatest common divisor via Euclid's algorithm.
local function gcd(a, b)
	a, b = math.abs(a), math.abs(b)
	while b ~= 0 do
		a, b = b, a % b
	end
	return a
end`,

  `-- lcm computes the least common multiple of two integers.
local function lcm(a, b)
	if a == 0 or b == 0 then
		return 0
	end
	return math.abs(a * b) / gcd(a, b)
end`,

  `-- is_prime checks primality up to the square root of n.
local function is_prime(n)
	if n < 2 then
		return false
	end
	if n % 2 == 0 then
		return n == 2
	end
	for d = 3, math.sqrt(n), 2 do
		if n % d == 0 then
			return false
		end
	end
	return true
end`,

  `-- nth_fib returns the n-th Fibonacci number, starting at 0.
local function nth_fib(n)
	if n <= 0 then
		return 0
	end
	local a, b = 0, 1
	for _ = 2, n do
		a, b = b, a + b
	end
	return b
end`,

  `-- factorial multiplies the integers from 1 to n.
local function factorial(n)
	if n < 0 then
		return nil
	end
	local result = 1
	for i = 2, n do
		result = result * i
	end
	return result
end`,

  `-- clamp confines a value to the inclusive range [lo, hi].
local function clamp(value, lo, hi)
	if value < lo then
		return lo
	end
	if value > hi then
		return hi
	end
	return value
end`,

  `-- lerp interpolates between a and b by t in the range [0, 1].
local function lerp(a, b, t)
	return a + (b - a) * clamp(t, 0, 1)
end`,

  `-- round rounds a number to the nearest integer or decimal place.
local function round(value, places)
	places = places or 0
	local factor = 10 ^ places
	return math.floor(value * factor + 0.5) / factor
end`,

  `-- mean returns the arithmetic average of a list of numbers.
local function mean(values)
	local total = 0
	for _, v in ipairs(values) do
		total = total + v
	end
	return total / #values
end`,

  `-- median finds the middle value of a sorted copy.
local function median(values)
	local sorted = {}
	for i, v in ipairs(values) do
		sorted[i] = v
	end
	table.sort(sorted)
	local mid = math.floor(#sorted / 2) + 1
	if #sorted % 2 == 1 then
		return sorted[mid]
	end
	return (sorted[mid - 1] + sorted[mid]) / 2
end`,

  `-- variance computes the population variance of a list.
local function variance(values)
	local m = mean(values)
	local total = 0
	for _, v in ipairs(values) do
		total = total + (v - m) ^ 2
	end
	return total / #values
end`,

  `-- stddev returns the population standard deviation.
local function stddev(values)
	return math.sqrt(variance(values))
end`,

  `-- percentile estimates the value at a given percentage rank.
local function percentile(values, p)
	local sorted = {}
	for i, v in ipairs(values) do
		sorted[i] = v
	end
	table.sort(sorted)
	if #sorted == 0 then
		return nil
	end
	local index = math.max(1, math.min(#sorted, math.ceil(p / 100 * #sorted)))
	return sorted[index]
end`,

  `-- is_power_of_two checks whether n is a positive power of two.
local function is_power_of_two(n)
	return n > 0 and (n & (n - 1)) == 0
end`,

  `-- next_power_of_two rounds n up to the next power of two.
local function next_power_of_two(n)
	if n <= 1 then
		return 1
	end
	local result = 1
	while result < n do
		result = result * 2
	end
	return result
end`,

  `-- digit_sum adds the decimal digits of a non-negative integer.
local function digit_sum(n)
	local m = math.abs(n)
	local total = 0
	while m > 0 do
		total = total + m % 10
		m = math.floor(m / 10)
	end
	return total
end`,

  `-- collatz_steps counts the steps to reach 1 in the Collatz sequence.
local function collatz_steps(n)
	if n <= 1 then
		return 0
	end
	local steps = 0
	while n ~= 1 do
		if n % 2 == 0 then
			n = n / 2
		else
			n = 3 * n + 1
		end
		steps = steps + 1
	end
	return steps
end`,

  `-- binomial computes n choose k using multiplicative form.
local function binomial(n, k)
	if k < 0 or k > n then
		return 0
	end
	k = math.min(k, n - k)
	local result = 1
	for i = 1, k do
		result = result * (n - i + 1) / i
	end
	return result
end`,

  `-- sigmoid squashes a raw score into the open interval (0, 1).
local function sigmoid(x)
	return 1 / (1 + math.exp(-x))
end`,

  `-- smoothstep eases a value through a hermite curve in [0, 1].
local function smoothstep(t)
	t = clamp(t, 0, 1)
	return t * t * (3 - 2 * t)
end`,

  `-- mod_angle wraps an angle in degrees into [0, 360).
local function mod_angle(degrees)
	return degrees % 360
end`,
];

// ---------------------------------------------------------------------------
// 3. table_utils.lua
// ---------------------------------------------------------------------------
const table_utils = [
  `-- tsum totals every numeric element of a list.
local function tsum(values)
	local total = 0
	for _, v in ipairs(values) do
		total = total + v
	end
	return total
end`,

  `-- tproduct multiplies every element of a list together.
local function tproduct(values)
	local total = 1
	for _, v in ipairs(values) do
		total = total * v
	end
	return total
end`,

  `-- tcontains reports whether a list holds a value.
local function tcontains(values, target)
	for _, v in ipairs(values) do
		if v == target then
			return true
		end
	end
	return false
end`,

  `-- tindex_of finds the first index of a value, or nil.
local function tindex_of(values, target)
	for i, v in ipairs(values) do
		if v == target then
			return i
		end
	end
	return nil
end`,

  `-- tcount_where counts elements that satisfy a predicate.
local function tcount_where(values, predicate)
	local count = 0
	for _, v in ipairs(values) do
		if predicate(v) then
			count = count + 1
		end
	end
	return count
end`,

  `-- tfilter keeps only the elements that satisfy a predicate.
local function tfilter(values, predicate)
	local result = {}
	for _, v in ipairs(values) do
		if predicate(v) then
			result[#result + 1] = v
		end
	end
	return result
end`,

  `-- tmap transforms every element with a function.
local function tmap(values, fn)
	local result = {}
	for i, v in ipairs(values) do
		result[i] = fn(v)
	end
	return result
end`,

  `-- treduce folds a list left-to-right into a single value.
local function treduce(values, fn, initial)
	local acc = initial
	for _, v in ipairs(values) do
		acc = fn(acc, v)
	end
	return acc
end`,

  `-- tunique removes duplicates, keeping first-seen order.
local function tunique(values)
	local seen = {}
	local result = {}
	for _, v in ipairs(values) do
		if not seen[v] then
			seen[v] = true
			result[#result + 1] = v
		end
	end
	return result
end`,

  `-- treverse returns a new list with elements in reverse order.
local function treverse(values)
	local result = {}
	for i = #values, 1, -1 do
		result[#result + 1] = values[i]
	end
	return result
end`,

  `-- tslice extracts a range of elements, like string.sub for lists.
local function tslice(values, first, last)
	first = first or 1
	last = last or #values
	if first < 1 then
		first = 1
	end
	if last > #values then
		last = #values
	end
	local result = {}
	if first > last then
		return result
	end
	for i = first, last do
		result[#result + 1] = values[i]
	end
	return result
end`,

  `-- tflatten concatenates the elements of nested lists one level deep.
local function tflatten(rows)
	local result = {}
	for _, row in ipairs(rows) do
		for _, v in ipairs(row) do
			result[#result + 1] = v
		end
	end
	return result
end`,

  `-- tfrequencies tallies how often each value appears.
local function tfrequencies(values)
	local counts = {}
	for _, v in ipairs(values) do
		counts[v] = (counts[v] or 0) + 1
	end
	return counts
end`,

  `-- tmax finds the largest value in a list of numbers.
local function tmax(values)
	local best = values[1]
	for i = 2, #values do
		if values[i] > best then
			best = values[i]
		end
	end
	return best
end`,

  `-- tmin finds the smallest value in a list of numbers.
local function tmin(values)
	local best = values[1]
	for i = 2, #values do
		if values[i] < best then
			best = values[i]
		end
	end
	return best
end`,

  `-- tshuffle randomises a list with the Fisher-Yates shuffle.
local function tshuffle(values)
	for i = #values, 2, -1 do
		local j = math.random(i)
		values[i], values[j] = values[j], values[i]
	end
	return values
end`,

  `-- tchunk splits a list into sub-lists of at most size elements.
local function tchunk(values, size)
	local result = {}
	for i = 1, #values, size do
		result[#result + 1] = tslice(values, i, i + size - 1)
	end
	return result
end`,

  `-- tzip pairs up the elements of two equal-length lists.
local function tzip(keys, values)
	local result = {}
	for i = 1, math.min(#keys, #values) do
		result[i] = { key = keys[i], value = values[i] }
	end
	return result
end`,

  `-- tmerge appends every element of b onto a.
local function tmerge(a, b)
	local result = {}
	for _, v in ipairs(a) do
		result[#result + 1] = v
	end
	for _, v in ipairs(b) do
		result[#result + 1] = v
	end
	return result
end`,

  `-- tkeys returns the keys of a map as a list.
local function tkeys(map)
	local result = {}
	for k in pairs(map) do
		result[#result + 1] = k
	end
	return result
end`,

  `-- tgroup_by buckets list elements by a key function.
local function tgroup_by(values, keyfn)
	local groups = {}
	for _, v in ipairs(values) do
		local key = keyfn(v)
		groups[key] = groups[key] or {}
		groups[key][#groups[key] + 1] = v
	end
	return groups
end`,
];

// ---------------------------------------------------------------------------
// 4. validation.lua
// ---------------------------------------------------------------------------
const validation = [
  `-- is_email does a light structural email check.
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
end`,

  `-- is_phone accepts 7-15 digits with common separator characters.
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
end`,

  `-- is_url checks for a scheme://host shape without spaces.
local function is_url(s)
	local scheme = s:match("^(%a[%w+%-]*)://")
	if not scheme then
		return false
	end
	local rest = s:sub(#scheme + 4)
	return #rest > 0 and not rest:find("%s")
end`,

  `-- is_ipv4 validates a dotted-quad IPv4 address.
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
end`,

  `-- is_strong_password requires length, case, digit and symbol.
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
end`,

  `-- is_luhn validates a card number with the Luhn checksum.
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
end`,

  `-- is_date_iso validates a YYYY-MM-DD date string.
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
end`,

  `-- is_hex_color accepts #RGB or #RRGGBB form.
local function is_hex_color(s)
	if #s ~= 4 and #s ~= 7 then
		return false
	end
	if s:sub(1, 1) ~= "#" then
		return false
	end
	return s:sub(2):match("^[%x]+$") ~= nil
end`,

  `-- is_username enforces 3-20 alphanumeric chars plus _ and -.
local function is_username(s)
	if #s < 3 or #s > 20 then
		return false
	end
	return s:match("^[%w_%-]+$") ~= nil
end`,

  `-- is_non_empty rejects strings that are blank after trimming.
local function is_non_empty(s)
	return (s:gsub("^%s+", ""):gsub("%s+$", "")) ~= ""
end`,

  `-- is_numeric accepts an optional sign, digits and one decimal point.
local function is_numeric(s)
	return tonumber(s) ~= nil and s:match("^[%+%-]?%d*%.?%d+$") ~= nil
end`,

  `-- is_integer_string accepts an optional sign followed by digits only.
local function is_integer_string(s)
	return s:match("^[%+%-]?%d+$") ~= nil
end`,

  `-- is_within checks a value against inclusive bounds.
local function is_within(value, lo, hi)
	return value >= lo and value <= hi
end`,

  `-- is_one_of checks membership in a fixed set of choices.
local function is_one_of(value, choices)
	for _, choice in ipairs(choices) do
		if value == choice then
			return true
		end
	end
	return false
end`,

  `-- is_percent checks a value in the inclusive 0..100 range.
local function is_percent(value)
	return value >= 0 and value <= 100
end`,

  `-- is_ascii verifies every character fits in 7-bit ASCII.
local function is_ascii(s)
	for ch in s:gmatch(".") do
		if ch:byte() > 127 then
			return false
		end
	end
	return true
end`,

  `-- is_alphanumeric accepts letters and digits only.
local function is_alphanumeric(s)
	if s == "" then
		return false
	end
	return s:match("^[%w]+$") ~= nil
end`,

  `-- is_boolean accepts true/false/yes/no/1/0 in any case.
local function is_boolean(s)
	local lower = s:lower()
	return lower == "true" or lower == "false" or lower == "yes" or lower == "no" or lower == "1" or lower == "0"
end`,

  `-- is_valid_identifier checks a C-like identifier name.
local function is_valid_identifier(s)
	if s == "" then
		return false
	end
	if not s:sub(1, 1):match("[%a_]") then
		return false
	end
	return s:match("^[%w_]+$") ~= nil
end`,

  `-- is_zip_code matches a 5-digit or ZIP+4 postal code.
local function is_zip_code(s)
	if #s == 5 then
		return s:match("^%d%d%d%d%d$") ~= nil
	end
	if #s ~= 10 or s:sub(6, 6) ~= "-" then
		return false
	end
	return s:match("^%d%d%d%d%d%-%d%d%d%d$") ~= nil
end`,

  `-- is_sorted checks that a list is in non-decreasing order.
local function is_sorted(values)
	for i = 2, #values do
		if values[i] < values[i - 1] then
			return false
		end
	end
	return true
end`,
];

// ---------------------------------------------------------------------------
// 5. text_processing.lua
// ---------------------------------------------------------------------------
const text_processing = [
  `-- tokenize splits text into lowercase word tokens.
local function tokenize(text)
	local result = {}
	for word in text:lower():gmatch("%w+") do
		result[#result + 1] = word
	end
	return result
end`,

  `-- word_frequency tallies tokens into a map.
local function word_frequency(text)
	local counts = {}
	for word in text:lower():gmatch("%w+") do
		counts[word] = (counts[word] or 0) + 1
	end
	return counts
end`,

  `-- strip_punctuation removes non-alphanumeric characters.
local function strip_punctuation(text)
	return (text:gsub("[^%w%s]", ""))
end`,

  `-- count_sentences counts sentence-ending punctuation marks.
local function count_sentences(text)
	local count = 0
	for _ in text:gmatch("[%.%?!]") do
		count = count + 1
	end
	return count
end`,

  `-- is_palindrome checks whether text reads the same both ways.
local function is_palindrome(text)
	local clean = text:lower():gsub("[^%w]", "")
	return clean == clean:reverse()
end`,

  `-- pig_latin converts a single word to Pig Latin.
local function pig_latin(word)
	if word == "" then
		return word
	end
	local first = word:sub(1, 1):lower()
	if first:match("[aeiou]") then
		return word .. "way"
	end
	return word:sub(2) .. first .. "ay"
end`,

  `-- rot13 applies the classic Caesar variant to ASCII letters.
local function rot13(text)
	return (text:gsub("%a", function(ch)
		local base = ch:lower() == ch and 97 or 65
		return string.char((ch:byte() - base + 13) % 26 + base)
	end))
end`,

  `-- caesar shifts letters by a fixed amount, wrapping at z/Z.
local function caesar(text, shift)
	return (text:gsub("%a", function(ch)
		local base = ch:lower() == ch and 97 or 65
		return string.char((ch:byte() - base + shift) % 26 + base)
	end))
end`,

  `-- extract_quoted pulls the first double-quoted substring out of text.
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
end`,

  `-- remove_duplicate_words keeps the first occurrence of each word.
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
end`,

  `-- longest_word finds the largest token in a string.
local function longest_word(text)
	local best = ""
	for word in text:gmatch("%S+") do
		if #word > #best then
			best = word
		end
	end
	return best
end`,

  `-- shortest_word finds the smallest token in a string.
local function shortest_word(text)
	local best = nil
	for word in text:gmatch("%S+") do
		if not best or #word < #best then
			best = word
		end
	end
	return best
end`,

  `-- average_word_length returns the mean token length.
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
end`,

  `-- wrap_text breaks text into lines of at most width characters.
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
end`,

  `-- indent_lines prefixes every line of text with a marker.
local function indent_lines(text, marker)
	local result = {}
	for line in text:gmatch("[^\\n]*") do
		result[#result + 1] = marker .. line
	end
	return table.concat(result, "\\n")
end`,

  `-- normalize_spaces collapses runs of whitespace into single spaces.
local function normalize_spaces(text)
	return (text:gsub("%s+", " "):gsub("^%s", ""):gsub("%s$", ""))
end`,

  `-- capitalize_sentences capitalises the first letter of each sentence.
local function capitalize_sentences(text)
	local result = text:gsub("^%s*(%a)", function(first)
		return first:upper()
	end)
	return (result:gsub("([%.%?!]%s+)(%a)", function(punct, first)
		return punct .. first:upper()
	end))
end`,

  `-- count_syllables estimates syllables with a vowel-run heuristic.
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
end`,

  `-- redact keeps the first and last letter of each word, masking the middle.
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
end`,

  `-- reverse_words reverses the order of words in a sentence.
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
end`,

  `-- mask_email hides the local part of an email address.
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
end`,
];

// ---------------------------------------------------------------------------
// 6. data_processing.lua
// ---------------------------------------------------------------------------
const data_processing = [
  `-- mean returns the arithmetic average of a list of numbers.
local function mean(values)
	local total = 0
	for _, v in ipairs(values) do
		total = total + v
	end
	return total / #values
end`,

  `-- stddev returns the population standard deviation.
local function stddev(values)
	local m = mean(values)
	local total = 0
	for _, v in ipairs(values) do
		total = total + (v - m) ^ 2
	end
	return math.sqrt(total / #values)
end`,

  `-- clamp confines a value to the inclusive range [lo, hi].
local function clamp(value, lo, hi)
	if value < lo then
		return lo
	end
	if value > hi then
		return hi
	end
	return value
end`,

  `-- parse_csv_line splits a CSV row, honouring quoted fields.
local function parse_csv_line(line)
	local fields = {}
	local current = ""
	local in_quotes = false
	local i = 1
	while i <= #line do
		local ch = line:sub(i, i)
		if ch == '"' then
			if in_quotes and line:sub(i + 1, i + 1) == '"' then
				current = current .. '"'
				i = i + 1
			else
				in_quotes = not in_quotes
			end
		elseif ch == "," and not in_quotes then
			fields[#fields + 1] = current
			current = ""
		else
			current = current .. ch
		end
		i = i + 1
	end
	fields[#fields + 1] = current
	return fields
end`,

  `-- parse_int_list converts "1,2,3" into a list of numbers.
local function parse_int_list(s)
	local result = {}
	for part in s:gmatch("[^,]+") do
		local value = tonumber(part:match("^%s*(.-)%s*$"))
		if not value then
			return nil
		end
		result[#result + 1] = value
	end
	return result
end`,

  `-- filter_outliers drops values more than 3 stddevs from the mean.
local function filter_outliers(values)
	if #values < 3 then
		return values
	end
	local m = mean(values)
	local sd = stddev(values)
	if sd == 0 then
		return values
	end
	local result = {}
	for _, v in ipairs(values) do
		if math.abs(v - m) <= 3 * sd then
			result[#result + 1] = v
		end
	end
	return result
end`,

  `-- normalize_values scales a list into the [0, 1] range.
local function normalize_values(values)
	if #values == 0 then
		return values
	end
	local lo, hi = values[1], values[1]
	for _, v in ipairs(values) do
		lo = math.min(lo, v)
		hi = math.max(hi, v)
	end
	local span = hi - lo
	local result = {}
	if span == 0 then
		for i = 1, #values do
			result[i] = 0
		end
		return result
	end
	for i, v in ipairs(values) do
		result[i] = (v - lo) / span
	end
	return result
end`,

  `-- zscore transforms values into standard scores.
local function zscore(values)
	local m = mean(values)
	local sd = stddev(values)
	local result = {}
	if sd == 0 then
		for i = 1, #values do
			result[i] = 0
		end
		return result
	end
	for i, v in ipairs(values) do
		result[i] = (v - m) / sd
	end
	return result
end`,

  `-- histogram counts occurrences per exact value.
local function histogram(values)
	local counts = {}
	for _, v in ipairs(values) do
		counts[v] = (counts[v] or 0) + 1
	end
	return counts
end`,

  `-- cumulative_sum returns the running total at each index.
local function cumulative_sum(values)
	local result = {}
	local total = 0
	for i, v in ipairs(values) do
		total = total + v
		result[i] = total
	end
	return result
end`,

  `-- moving_average smooths a series with a sliding window.
local function moving_average(values, window)
	local result = {}
	local total = 0
	for i = 1, #values do
		total = total + values[i]
		if i > window then
			total = total - values[i - window]
		end
		result[i] = total / math.min(i, window)
	end
	return result
end`,

  `-- delta computes the difference between consecutive values.
local function delta(values)
	if #values < 2 then
		return {}
	end
	local result = {}
	for i = 2, #values do
		result[i - 1] = values[i] - values[i - 1]
	end
	return result
end`,

  `-- clamp_values restricts every value to [lo, hi] in place.
local function clamp_values(values, lo, hi)
	for i, v in ipairs(values) do
		values[i] = clamp(v, lo, hi)
	end
	return values
end`,

  `-- dedupe_preserve_order removes repeats keeping first-seen order.
local function dedupe_preserve_order(values)
	local seen = {}
	local result = {}
	for _, v in ipairs(values) do
		if not seen[v] then
			seen[v] = true
			result[#result + 1] = v
		end
	end
	return result
end`,

  `-- partition splits values into two lists by a predicate.
local function partition(values, predicate)
	local trues, falses = {}, {}
	for _, v in ipairs(values) do
		if predicate(v) then
			trues[#trues + 1] = v
		else
			falses[#falses + 1] = v
		end
	end
	return trues, falses
end`,

  `-- min_max_scale normalises values between new_min and new_max.
local function min_max_scale(values, new_min, new_max)
	if #values == 0 then
		return values
	end
	local lo, hi = values[1], values[1]
	for _, v in ipairs(values) do
		lo = math.min(lo, v)
		hi = math.max(hi, v)
	end
	local result = {}
	if hi == lo then
		for i = 1, #values do
			result[i] = (new_min + new_max) / 2
		end
		return result
	end
	for i, v in ipairs(values) do
		result[i] = new_min + (v - lo) / (hi - lo) * (new_max - new_min)
	end
	return result
end`,

  `-- detect_peaks finds indices that exceed both neighbours.
local function detect_peaks(values)
	local peaks = {}
	for i = 2, #values - 1 do
		if values[i] > values[i - 1] and values[i] > values[i + 1] then
			peaks[#peaks + 1] = i
		end
	end
	return peaks
end`,

  `-- group_consecutive groups equal values into {value, count} pairs.
local function group_consecutive(values)
	if #values == 0 then
		return {}
	end
	local runs = {}
	local current = values[1]
	local count = 1
	for i = 2, #values do
		if values[i] == current then
			count = count + 1
		else
			runs[#runs + 1] = { value = current, count = count }
			current = values[i]
			count = 1
		end
	end
	runs[#runs + 1] = { value = current, count = count }
	return runs
end`,

  `-- running_average computes the cumulative average at each step.
local function running_average(values)
	local result = {}
	local total = 0
	for i, v in ipairs(values) do
		total = total + v
		result[i] = total / i
	end
	return result
end`,

  `-- pairwise_add combines two same-length lists element-wise.
local function pairwise_add(a, b)
	if #a ~= #b then
		return nil
	end
	local result = {}
	for i = 1, #a do
		result[i] = a[i] + b[i]
	end
	return result
end`,

  `-- interleave merges two lists alternating their elements.
local function interleave(a, b)
	local result = {}
	local n = math.max(#a, #b)
	for i = 1, n do
		if a[i] ~= nil then
			result[#result + 1] = a[i]
		end
		if b[i] ~= nil then
			result[#result + 1] = b[i]
		end
	end
	return result
end`,

  `-- windowed pulls every contiguous window of size k.
local function windowed(values, size)
	if size <= 0 or size > #values then
		return {}
	end
	local result = {}
	for start = 1, #values - size + 1 do
		local window = {}
		for i = 0, size - 1 do
			window[i + 1] = values[start + i]
		end
		result[#result + 1] = window
	end
	return result
end`,

  `-- bucketize maps values into n equal-width buckets and counts them.
local function bucketize(values, buckets)
	if buckets <= 0 or #values == 0 then
		return {}
	end
	local lo, hi = values[1], values[1]
	for _, v in ipairs(values) do
		lo = math.min(lo, v)
		hi = math.max(hi, v)
	end
	local counts = {}
	for i = 1, buckets do
		counts[i] = 0
	end
	local width = (hi - lo) / buckets
	for _, v in ipairs(values) do
		local index = math.floor((v - lo) / width) + 1
		index = clamp(index, 1, buckets)
		counts[index] = counts[index] + 1
	end
	return counts
end`,

  `-- cross_correlation measures similarity of two same-length series.
local function cross_correlation(a, b)
	if #a ~= #b or #a == 0 then
		return 0
	end
	local ma, mb = mean(a), mean(b)
	local num, da, db = 0, 0, 0
	for i = 1, #a do
		local x = a[i] - ma
		local y = b[i] - mb
		num = num + x * y
		da = da + x * x
		db = db + y * y
	end
	local denom = math.sqrt(da * db)
	if denom == 0 then
		return 0
	end
	return num / denom
end`,
];

// ---------------------------------------------------------------------------
// 7. filesystem.lua
// ---------------------------------------------------------------------------
const filesystem = [
  `-- file_exists reports whether a path names an existing file.
local function file_exists(path)
	local f = io.open(path, "r")
	if f then
		f:close()
		return true
	end
	return false
end`,

  `-- read_text reads an entire file into a string.
local function read_text(path)
	local f, err = io.open(path, "r")
	if not f then
		return nil, err
	end
	local content = f:read("*a")
	f:close()
	return content
end`,

  `-- write_text writes a string to a file, overwriting it.
local function write_text(path, content)
	local f, err = io.open(path, "w")
	if not f then
		return false, err
	end
	f:write(content)
	f:close()
	return true
end`,

  `-- append_text adds a string to the end of a file.
local function append_text(path, content)
	local f, err = io.open(path, "a")
	if not f then
		return false, err
	end
	f:write(content)
	f:close()
	return true
end`,

  `-- read_lines returns the lines of a file as a list.
local function read_lines(path)
	local result = {}
	local f, err = io.open(path, "r")
	if not f then
		return nil, err
	end
	for line in f:lines() do
		result[#result + 1] = line
	end
	f:close()
	return result
end`,

  `-- count_lines counts the newline-separated lines in a file.
local function count_lines(path)
	local f, err = io.open(path, "r")
	if not f then
		return nil, err
	end
	local count = 0
	for _ in f:lines() do
		count = count + 1
	end
	f:close()
	return count
end`,

  `-- file_size returns the byte length of a file.
local function file_size(path)
	local f, err = io.open(path, "rb")
	if not f then
		return nil, err
	end
	local size = f:seek("end")
	f:close()
	return size
end`,

  `-- remove_file deletes a file, ignoring missing files.
local function remove_file(path)
	local ok, err = os.remove(path)
	if not ok and err ~= "No such file or directory" then
		return false, err
	end
	return true
end`,

  `-- rename_file moves a file from one path to another.
local function rename_file(from, to)
	return os.rename(from, to)
end`,

  `-- get_extension returns the extension without the dot.
local function get_extension(path)
	local ext = path:match("%.([^%.]+)$")
	if ext then
		return ext
	end
	return ""
end`,

  `-- get_basename returns the final path component.
local function get_basename(path)
	return path:match("[^/]+$") or path
end`,

  `-- path_join joins path components with a single slash.
local function path_join(...)
	local parts = {}
	for i = 1, select("#", ...) do
		local part = select(i, ...)
		part = part:gsub("^/+", ""):gsub("/+$", "")
		if part ~= "" then
			parts[#parts + 1] = part
		end
	end
	return table.concat(parts, "/")
end`,

  `-- path_is_absolute checks for a leading slash.
local function path_is_absolute(path)
	return path:sub(1, 1) == "/"
end`,

  `-- sanitize_filename replaces unsafe characters with underscores.
local function sanitize_filename(name)
	return (name:gsub("[^%w%.%-_]", "_"))
end`,

  `-- ensure_trailing_slash appends a slash if the path lacks one.
local function ensure_trailing_slash(dir)
	if dir:sub(-1) == "/" then
		return dir
	end
	return dir .. "/"
end`,

  `-- getenv_default reads an environment variable with a fallback.
local function getenv_default(name, fallback)
	local value = os.getenv(name)
	if value then
		return value
	end
	return fallback
end`,

  `-- home_dir returns the current user's home directory.
local function home_dir()
	return getenv_default("HOME", getenv_default("USERPROFILE", "."))
end`,

  `-- dirname returns the directory portion of a path.
local function dirname(path)
	local dir = path:match("^(.*)/[^/]*$")
	if dir then
		return dir
	end
	return "."
end`,

  `-- touch_file creates a file if it does not exist.
local function touch_file(path)
	local f, err = io.open(path, "a")
	if not f then
		return false, err
	end
	f:close()
	return true
end`,

  `-- file_extension_matches checks a path against a list of extensions.
local function file_extension_matches(path, extensions)
	local ext = get_extension(path):lower()
	for _, candidate in ipairs(extensions) do
		if ext == candidate then
			return true
		end
	end
	return false
end`,

  `-- is_empty_dir reports whether a directory has no entries.
local function is_empty_dir(path)
	local f = io.popen("ls -A " .. path)
	if not f then
		return false
	end
	local entries = 0
	for _ in f:lines() do
		entries = entries + 1
	end
	f:close()
	return entries == 0
end`,
];

// ---------------------------------------------------------------------------
// 8. networking.lua
// ---------------------------------------------------------------------------
const networking = [
  `-- split_host_port separates "host:port" into its parts.
local function split_host_port(address)
	local host, port = address:match("^(.*):(%d+)$")
	if not host then
		return address, nil
	end
	return host, tonumber(port)
end`,

  `-- is_valid_port checks a TCP/UDP port number.
local function is_valid_port(port)
	return port >= 1 and port <= 65535
end`,

  `-- parse_url breaks a URL into scheme, host and path.
local function parse_url(url)
	local scheme, rest = url:match("^(%a[%w+%-]*)://(.*)$")
	if not scheme then
		return nil, nil, url
	end
	local host, path = rest:match("^([^/]*)(.*)$")
	if path == "" then
		path = "/"
	end
	return scheme, host, path
end`,

  `-- url_encode percent-encodes unsafe URL characters.
local function url_encode(s)
	return (s:gsub("([^%w%-_%.~])", function(ch)
		return string.format("%%%02X", ch:byte())
	end))
end`,

  `-- url_decode percent-decodes a URL-encoded string.
local function url_decode(s)
	return (s:gsub("%%(%x%x)", function(hex)
		return string.char(tonumber(hex, 16))
	end))
end`,

  `-- build_query_string encodes a parameter map into a query string.
local function build_query_string(params)
	local parts = {}
	for key, value in pairs(params) do
		parts[#parts + 1] = url_encode(key) .. "=" .. url_encode(value)
	end
	return table.concat(parts, "&")
end`,

  `-- parse_query_string turns a query string into a parameter map.
local function parse_query_string(query)
	local params = {}
	for pair in query:gmatch("[^&]+") do
		local key, value = pair:match("^([^=]*)=(.*)$")
		if key then
			params[url_decode(key)] = url_decode(value or "")
		end
	end
	return params
end`,

  `-- is_http_success classifies a status code as 2xx.
local function is_http_success(status)
	return status >= 200 and status < 300
end`,

  `-- http_status_text maps a status code to its reason phrase.
local function http_status_text(status)
	local reasons = {
		[200] = "OK",
		[201] = "Created",
		[204] = "No Content",
		[301] = "Moved Permanently",
		[400] = "Bad Request",
		[401] = "Unauthorized",
		[403] = "Forbidden",
		[404] = "Not Found",
		[500] = "Internal Server Error",
		[503] = "Service Unavailable",
	}
	return reasons[status] or "Unknown"
end`,

  `-- default_port returns the standard port for a scheme.
local function default_port(scheme)
	local ports = {
		http = 80,
		https = 443,
		ftp = 21,
		ssh = 22,
		smtp = 25,
	}
	return ports[scheme:lower()] or 0
end`,

  `-- backoff_delay computes an exponential backoff capped at 30s.
local function backoff_delay(attempt, base_ms)
	local delay = base_ms * (2 ^ attempt)
	return math.min(delay, 30000)
end`,

  `-- mask_ip hides the last octet of an IPv4 address.
local function mask_ip(address)
	local prefix = address:match("^(%d+%.%d+%.%d+)%.")
	if not prefix then
		return address
	end
	return prefix .. ".0"
end`,

  `-- is_local_address checks for loopback or private IPv4 prefixes.
local function is_local_address(address)
	if address == "127.0.0.1" or address == "localhost" then
		return true
	end
	return address:match("^192%.168%.") ~= nil or address:match("^10%.") ~= nil
end`,

  `-- extract_header parses one "Name: value" header line.
local function extract_header(line)
	local name, value = line:match("^([^:]+):%s*(.*)$")
	if not name then
		return nil, nil
	end
	return name, value
end`,

  `-- parse_headers converts raw header text into a map.
local function parse_headers(text)
	local headers = {}
	for line in text:gmatch("[^\\r\\n]+") do
		local name, value = extract_header(line)
		if name then
			headers[name:lower()] = value
		end
	end
	return headers
end`,

  `-- is_ipv6_like detects a colon-separated address shape.
local function is_ipv6_like(address)
	return address:find(":") ~= nil and address:find("%.") == nil
end`,

  `-- normalize_path collapses duplicate slashes and dot segments.
local function normalize_path(path)
	local segments = {}
	for segment in path:gmatch("[^/]+") do
		if segment == ".." then
			segments[#segments] = nil
		elseif segment ~= "." then
			segments[#segments + 1] = segment
		end
	end
	local prefix = path:sub(1, 1) == "/" and "/" or ""
	return prefix .. table.concat(segments, "/")
end`,

  `-- combine_url joins a base URL with a relative path.
local function combine_url(base, relative)
	if relative:sub(1, 1) == "/" then
		return base:gsub("/+$", "") .. relative
	end
	return base:gsub("/+$", "") .. "/" .. relative
end`,

  `-- content_type_from_ext guesses a MIME type from an extension.
local function content_type_from_ext(path)
	local types = {
		html = "text/html",
		css = "text/css",
		js = "application/javascript",
		json = "application/json",
		png = "image/png",
		jpg = "image/jpeg",
		gif = "image/gif",
		svg = "image/svg+xml",
		txt = "text/plain",
	}
	return types[get_extension(path):lower()] or "application/octet-stream"
end`,

  `-- is_html_content sniffs whether text looks like an HTML document.
local function is_html_content(text)
	local head = text:sub(1, 512):lower()
	return head:find("<html") ~= nil or head:find("<head") ~= nil
end`,
];

// ---------------------------------------------------------------------------
// Framework + first batch
// ---------------------------------------------------------------------------
const files = [
  { name: 'string_utils.lua', procs: string_utils },
  { name: 'math_utils.lua', procs: math_utils },
  { name: 'table_utils.lua', procs: table_utils },
  { name: 'validation.lua', procs: validation },
  { name: 'text_processing.lua', procs: text_processing },
  { name: 'data_processing.lua', procs: data_processing },
  { name: 'filesystem.lua', procs: filesystem },
  { name: 'networking.lua', procs: networking },
];

// ---------------------------------------------------------------------------
// 9. formatting.lua
// ---------------------------------------------------------------------------
const formatting = [
  `-- pad_number zero-pads an integer to a fixed width.
local function pad_number(value, width)
	local text = tostring(math.abs(value))
	if value < 0 then
		return "-" .. string.rep("0", math.max(0, width - #text)) .. text
	end
	return string.rep("0", math.max(0, width - #text)) .. text
end`,

  `-- comma_separate inserts thousands separators into an integer.
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
end`,

  `-- format_percent renders a ratio as a percentage with one decimal.
local function format_percent(ratio)
	return string.format("%.1f%%", ratio * 100)
end`,

  `-- format_bytes renders a byte count in human-readable units.
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
end`,

  `-- format_duration renders milliseconds as clock-style text.
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
end`,

  `-- align_right pads text on the left to a column width.
local function align_right(text, width)
	if #text >= width then
		return text
	end
	return string.rep(" ", width - #text) .. text
end`,

  `-- align_left pads text on the right to a column width.
local function align_left(text, width)
	if #text >= width then
		return text
	end
	return text .. string.rep(" ", width - #text)
end`,

  `-- pluralize appends an "s" unless the count is one.
local function pluralize(count, singular)
	if count == 1 then
		return string.format("%d %s", count, singular)
	end
	return string.format("%d %s", count, singular .. "s")
end`,

  `-- format_money renders cents as a currency string.
local function format_money(cents)
	local negative = cents < 0
	local absolute = math.abs(cents)
	local dollars = math.floor(absolute / 100)
	local remainder = absolute % 100
	local sign = negative and "-" or ""
	return string.format("%s$%d.%02d", sign, dollars, remainder)
end`,

  `-- truncate_middle keeps the head and tail of a long string.
local function truncate_middle(s, max_len)
	if #s <= max_len then
		return s
	end
	local keep = math.floor((max_len - 1) / 2)
	return s:sub(1, keep) .. "..." .. s:sub(-keep)
end`,

  `-- wrap_brackets surrounds a value with a configurable pair.
local function wrap_brackets(value, open, close)
	return open .. value .. close
end`,

  `-- prefix_lines prepends a marker to each line of text.
local function prefix_lines(text, marker)
	local result = {}
	for line in text:gmatch("[^\\n]*") do
		result[#result + 1] = marker .. line
	end
	return table.concat(result, "\\n")
end`,

  `-- format_key_value renders "key=value" joined by a separator.
local function format_key_value(key, value, sep)
	return key .. (sep or "=") .. value
end`,

  `-- escape_html escapes the five HTML-significant characters.
local function escape_html(text)
	local entities = { ["&"] = "&amp;", ["<"] = "&lt;", [">"] = "&gt;", ['"'] = "&quot;", ["'"] = "&#39;" }
	return (text:gsub("[&<>\\\"']", entities))
end`,

  `-- escape_shell_arg quotes an argument for POSIX shells.
local function escape_shell_arg(arg)
	return "'" .. arg:gsub("'", "'\\\\''") .. "'"
end`,

  `-- indent_block indents every line of text by a number of spaces.
local function indent_block(text, indent)
	return prefix_lines(text, string.rep(" ", indent))
end`,

  `-- join_oxford joins items with commas and a final "and".
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
end`,

  `-- pad_center centres text within a width using spaces.
local function pad_center(text, width)
	if #text >= width then
		return text
	end
	local left = math.floor((width - #text) / 2)
	local right = width - #text - left
	return string.rep(" ", left) .. text .. string.rep(" ", right)
end`,

  `-- format_table aligns rows of cells into fixed-width columns.
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
end`,

  `-- format_number aligns a column of numbers to the right.
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
end`,

  `-- numbered_list renders items as "1. item" lines.
local function numbered_list(items)
	local result = {}
	for i, item in ipairs(items) do
		result[#result + 1] = string.format("%d. %s", i, item)
	end
	return table.concat(result, "\\n")
end`,
];

// ---------------------------------------------------------------------------
// 10. data_structures.lua
// ---------------------------------------------------------------------------
const data_structures = [
  `-- stack_new creates an empty stack backed by a list.
local function stack_new()
	return {}
end`,

  `-- stack_push places a value on top of the stack.
local function stack_push(stack, value)
	stack[#stack + 1] = value
end`,

  `-- stack_pop removes and returns the top value, if any.
local function stack_pop(stack)
	if #stack == 0 then
		return nil
	end
	return table.remove(stack)
end`,

  `-- stack_peek returns the top value without removing it.
local function stack_peek(stack)
	return stack[#stack]
end`,

  `-- queue_new creates an empty queue.
local function queue_new()
	return { items = {}, head = 1 }
end`,

  `-- queue_push appends an item to the back of the queue.
local function queue_push(queue, value)
	queue.items[#queue.items + 1] = value
end`,

  `-- queue_pop removes the oldest item from the front of the queue.
local function queue_pop(queue)
	if queue.head > #queue.items then
		return nil
	end
	local value = queue.items[queue.head]
	queue.items[queue.head] = nil
	queue.head = queue.head + 1
	if queue.head > 256 then
		local compact = {}
		for i = queue.head, #queue.items do
			compact[#compact + 1] = queue.items[i]
		end
		queue.items = compact
		queue.head = 1
	end
	return value
end`,

  `-- deque_push_front inserts a value at the head of a deque.
local function deque_push_front(deque, value)
	table.insert(deque, 1, value)
end`,

  `-- deque_pop_back removes the value at the tail of a deque.
local function deque_pop_back(deque)
	return table.remove(deque)
end`,

  `-- list_push prepends a node to a linked list.
local function list_push(head, value)
	return { value = value, next = head }
end`,

  `-- list_find locates the first node holding a value.
local function list_find(head, value)
	local current = head
	while current do
		if current.value == value then
			return current
		end
		current = current.next
	end
	return nil
end`,

  `-- list_length counts the nodes in a linked list.
local function list_length(head)
	local count = 0
	local current = head
	while current do
		count = count + 1
		current = current.next
	end
	return count
end`,

  `-- list_reverse reverses a linked list in place.
local function list_reverse(head)
	local prev = nil
	local current = head
	while current do
		local next = current.next
		current.next = prev
		prev = current
		current = next
	end
	return prev
end`,

  `-- bst_insert adds a value to a binary search tree.
local function bst_insert(root, value)
	if not root then
		return { value = value }
	end
	if value < root.value then
		root.left = bst_insert(root.left, value)
	elseif value > root.value then
		root.right = bst_insert(root.right, value)
	end
	return root
end`,

  `-- bst_search looks up a value in a binary search tree.
local function bst_search(root, value)
	local current = root
	while current do
		if value == current.value then
			return current
		end
		if value < current.value then
			current = current.left
		else
			current = current.right
		end
	end
	return nil
end`,

  `-- bst_min returns the smallest value in the tree.
local function bst_min(root)
	local current = root
	while current and current.left do
		current = current.left
	end
	return current and current.value
end`,

  `-- bst_height measures the longest root-to-leaf path.
local function bst_height(root)
	if not root then
		return 0
	end
	return 1 + math.max(bst_height(root.left), bst_height(root.right))
end`,

  `-- bst_inorder collects values in sorted order.
local function bst_inorder(root)
	local result = {}
	local function walk(node)
		if not node then
			return
		end
		walk(node.left)
		result[#result + 1] = node.value
		walk(node.right)
	end
	walk(root)
	return result
end`,

  `-- heap_push inserts a value into a binary min-heap.
local function heap_push(heap, value)
	heap[#heap + 1] = value
	local i = #heap
	while i > 1 do
		local parent = math.floor(i / 2)
		if heap[parent] <= heap[i] then
			break
		end
		heap[parent], heap[i] = heap[i], heap[parent]
		i = parent
	end
end`,

  `-- heap_pop removes the minimum value from a binary min-heap.
local function heap_pop(heap)
	if #heap == 0 then
		return nil
	end
	local top = heap[1]
	local last = table.remove(heap)
	if #heap > 0 then
		heap[1] = last
		local i = 1
		while true do
			local left, right = i * 2, i * 2 + 1
			local smallest = i
			if left <= #heap and heap[left] < heap[smallest] then
				smallest = left
			end
			if right <= #heap and heap[right] < heap[smallest] then
				smallest = right
			end
			if smallest == i then
				break
			end
			heap[i], heap[smallest] = heap[smallest], heap[i]
			i = smallest
		end
	end
	return top
end`,

  `-- heap_peek returns the minimum value without removing it.
local function heap_peek(heap)
	return heap[1]
end`,
];

// ---------------------------------------------------------------------------
// 11. algorithms.lua
// ---------------------------------------------------------------------------
const algorithms = [
  `-- insertion_sort sorts a list in place by insertion.
local function insertion_sort(values)
	for i = 2, #values do
		local key = values[i]
		local j = i - 1
		while j >= 1 and values[j] > key do
			values[j + 1] = values[j]
			j = j - 1
		end
		values[j + 1] = key
	end
	return values
end`,

  `-- selection_sort repeatedly selects the smallest remaining element.
local function selection_sort(values)
	for i = 1, #values do
		local smallest = i
		for j = i + 1, #values do
			if values[j] < values[smallest] then
				smallest = j
			end
		end
		values[i], values[smallest] = values[smallest], values[i]
	end
	return values
end`,

  `-- bubble_sort bubbles the largest values to the end.
local function bubble_sort(values)
	local n = #values
	for i = 1, n do
		local swapped = false
		for j = 1, n - i do
			if values[j] > values[j + 1] then
				values[j], values[j + 1] = values[j + 1], values[j]
				swapped = true
			end
		end
		if not swapped then
			break
		end
	end
	return values
end`,

  `-- merge combines two sorted lists into one sorted list.
local function merge(left, right)
	local result = {}
	local i, j = 1, 1
	while i <= #left and j <= #right do
		if left[i] <= right[j] then
			result[#result + 1] = left[i]
			i = i + 1
		else
			result[#result + 1] = right[j]
			j = j + 1
		end
	end
	while i <= #left do
		result[#result + 1] = left[i]
		i = i + 1
	end
	while j <= #right do
		result[#result + 1] = right[j]
		j = j + 1
	end
	return result
end`,

  `-- merge_sort sorts a list recursively by divide and conquer.
local function merge_sort(values)
	if #values <= 1 then
		return values
	end
	local mid = math.floor(#values / 2)
	local left = {}
	local right = {}
	for i = 1, mid do
		left[i] = values[i]
	end
	for i = mid + 1, #values do
		right[i - mid] = values[i]
	end
	return merge(merge_sort(left), merge_sort(right))
end`,

  `-- binary_search finds a value in a sorted list in O(log n).
local function binary_search(values, target)
	local lo, hi = 1, #values
	while lo <= hi do
		local mid = math.floor((lo + hi) / 2)
		if values[mid] == target then
			return mid
		end
		if values[mid] < target then
			lo = mid + 1
		else
			hi = mid - 1
		end
	end
	return nil
end`,

  `-- linear_search scans an unsorted list for a value.
local function linear_search(values, target)
	for i, v in ipairs(values) do
		if v == target then
			return i
		end
	end
	return nil
end`,

  `-- two_sum finds indices of two values that add up to a target.
local function two_sum(values, target)
	local seen = {}
	for i, v in ipairs(values) do
		local needed = target - v
		if seen[needed] then
			return seen[needed], i
		end
		seen[v] = i
	end
	return nil
end`,

  `-- max_subarray finds the largest sum of a contiguous subarray.
local function max_subarray(values)
	if #values == 0 then
		return 0
	end
	local best = values[1]
	local current = values[1]
	for i = 2, #values do
		current = math.max(values[i], current + values[i])
		best = math.max(best, current)
	end
	return best
end`,

  `-- lis_length returns the length of the longest increasing subsequence.
local function lis_length(values)
	if #values == 0 then
		return 0
	end
	local lengths = {}
	local best = 1
	for i = 1, #values do
		lengths[i] = 1
		for j = 1, i - 1 do
			if values[j] < values[i] then
				lengths[i] = math.max(lengths[i], lengths[j] + 1)
			end
		end
		best = math.max(best, lengths[i])
	end
	return best
end`,

  `-- knapsack_01 computes the maximum value under a weight limit.
local function knapsack_01(weights, values, capacity)
	local dp = {}
	for w = 0, capacity do
		dp[w] = 0
	end
	for i = 1, #weights do
		for w = capacity, weights[i], -1 do
			dp[w] = math.max(dp[w], dp[w - weights[i]] + values[i])
		end
	end
	return dp[capacity]
end`,

  `-- edit_distance computes the Levenshtein distance of two strings.
local function edit_distance(a, b)
	local prev = {}
	for j = 0, #b do
		prev[j] = j
	end
	for i = 1, #a do
		local curr = { [0] = i }
		for j = 1, #b do
			local cost = a:sub(i, i) == b:sub(j, j) and 0 or 1
			curr[j] = math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
		end
		prev = curr
	end
	return prev[#b]
end`,

  `-- lcs_length returns the length of the longest common subsequence.
local function lcs_length(a, b)
	local table = {}
	for i = 0, #a do
		table[i] = {}
		for j = 0, #b do
			table[i][j] = 0
		end
	end
	for i = 1, #a do
		for j = 1, #b do
			if a:sub(i, i) == b:sub(j, j) then
				table[i][j] = table[i - 1][j - 1] + 1
			else
				table[i][j] = math.max(table[i - 1][j], table[i][j - 1])
			end
		end
	end
	return table[#a][#b]
end`,

  `-- coin_change returns the fewest coins for a target amount.
local function coin_change(coins, amount)
	local dp = {}
	dp[0] = 0
	for i = 1, amount do
		dp[i] = math.huge
	end
	for i = 1, amount do
		for _, coin in ipairs(coins) do
			if coin <= i then
				dp[i] = math.min(dp[i], dp[i - coin] + 1)
			end
		end
	end
	if dp[amount] == math.huge then
		return nil
	end
	return dp[amount]
end`,

  `-- is_anagram checks whether two strings reuse the same letters.
local function is_anagram(a, b)
	if #a ~= #b then
		return false
	end
	local counts = {}
	for ch in a:gmatch(".") do
		counts[ch] = (counts[ch] or 0) + 1
	end
	for ch in b:gmatch(".") do
		counts[ch] = (counts[ch] or 0) - 1
		if counts[ch] < 0 then
			return false
		end
	end
	return true
end`,

  `-- majority_element finds the value appearing more than n/2 times.
local function majority_element(values)
	local candidate, balance = nil, 0
	for _, v in ipairs(values) do
		if balance == 0 then
			candidate = v
		end
		if v == candidate then
			balance = balance + 1
		else
			balance = balance - 1
		end
	end
	local count = 0
	for _, v in ipairs(values) do
		if v == candidate then
			count = count + 1
		end
	end
	if count > #values / 2 then
		return candidate
	end
	return nil
end`,

  `-- matrix_multiply multiplies two matrices with compatible dimensions.
local function matrix_multiply(a, b)
	local rows, inner, cols = #a, #a[1], #b[1]
	if inner ~= #b then
		return nil
	end
	local result = {}
	for i = 1, rows do
		result[i] = {}
		for j = 1, cols do
			local total = 0
			for k = 1, inner do
				total = total + a[i][k] * b[k][j]
			end
			result[i][j] = total
		end
	end
	return result
end`,

  `-- sieve returns the primes up to and including a limit.
local function sieve(limit)
	if limit < 2 then
		return {}
	end
	local composite = {}
	for i = 2, math.floor(math.sqrt(limit)) do
		if not composite[i] then
			for j = i * i, limit, i do
				composite[j] = true
			end
		end
	end
	local primes = {}
	for i = 2, limit do
		if not composite[i] then
			primes[#primes + 1] = i
		end
	end
	return primes
end`,

  `-- floyd_cycle detects a cycle in a functional graph of indices.
local function floyd_cycle(next)
	if #next < 2 then
		return false
	end
	local slow, fast = 1, 1
	for _ = 1, #next + 1 do
		slow = next[slow]
		fast = next[fast]
		if not fast then
			return false
		end
		fast = next[fast]
		if slow == fast then
			return true
		end
	end
	return false
end`,

  `-- count_inversions counts pairs out of order (naive O(n^2)).
local function count_inversions(values)
	local count = 0
	for i = 1, #values do
		for j = i + 1, #values do
			if values[i] > values[j] then
				count = count + 1
			end
		end
	end
	return count
end`,

  `-- partition_qs reorders a list around a pivot and returns its index.
local function partition_qs(values, lo, hi)
	local pivot = values[hi]
	local i = lo - 1
	for j = lo, hi - 1 do
		if values[j] <= pivot then
			i = i + 1
			values[i], values[j] = values[j], values[i]
		end
	end
	values[i + 1], values[hi] = values[hi], values[i + 1]
	return i + 1
end`,
];

// ---------------------------------------------------------------------------
// 12. coroutines.lua
// ---------------------------------------------------------------------------
const coroutines = [
  `-- make_counter yields the integers starting at start.
local function make_counter(start)
	local i = start or 0
	return coroutine.wrap(function()
		while true do
			coroutine.yield(i)
			i = i + 1
		end
	end)
end`,

  `-- make_range yields the integers from first to last inclusive.
local function make_range(first, last, step)
	step = step or 1
	return coroutine.wrap(function()
		for i = first, last, step do
			coroutine.yield(i)
		end
	end)
end`,

  `-- make_fib yields the Fibonacci sequence forever.
local function make_fib()
	return coroutine.wrap(function()
		local a, b = 0, 1
		while true do
			coroutine.yield(a)
			a, b = b, a + b
		end
	end)
end`,

  `-- take_n yields the first n values produced by a generator.
local function take_n(generator, n)
	return coroutine.wrap(function()
		for i = 1, n do
			local value = generator()
			if value == nil then
				return
			end
			coroutine.yield(value)
		end
	end)
end`,

  `-- enumerate wraps a generator, yielding index and value pairs.
local function enumerate(generator)
	return coroutine.wrap(function()
		local index = 1
		while true do
			local value = generator()
			if value == nil then
				return
			end
			coroutine.yield(index, value)
			index = index + 1
		end
	end)
end`,

  `-- filter_gen yields only the values that satisfy a predicate.
local function filter_gen(generator, predicate)
	return coroutine.wrap(function()
		while true do
			local value = generator()
			if value == nil then
				return
			end
			if predicate(value) then
				coroutine.yield(value)
			end
		end
	end)
end`,

  `-- map_gen transforms every value a generator produces.
local function map_gen(generator, fn)
	return coroutine.wrap(function()
		while true do
			local value = generator()
			if value == nil then
				return
			end
			coroutine.yield(fn(value))
		end
	end)
end`,

  `-- reduce_gen folds a generator's values into a single result.
local function reduce_gen(generator, fn, initial)
	local acc = initial
	while true do
		local value = generator()
		if value == nil then
			return acc
		end
		acc = fn(acc, value)
	end
end`,

  `-- chain_gens yields the values of each generator in sequence.
local function chain_gens(...)
	local gens = { ... }
	return coroutine.wrap(function()
		for _, gen in ipairs(gens) do
			while true do
				local value = gen()
				if value == nil then
					break
				end
				coroutine.yield(value)
			end
		end
	end)
end`,

  `-- interleave_gens alternates values from two generators.
local function interleave_gens(a, b)
	return coroutine.wrap(function()
		while true do
			local va = a()
			local vb = b()
			if va == nil and vb == nil then
				return
			end
			if va ~= nil then
				coroutine.yield(va)
			end
			if vb ~= nil then
				coroutine.yield(vb)
			end
		end
	end)
end`,

  `-- zip_gens yields pairs of values from two generators.
local function zip_gens(a, b)
	return coroutine.wrap(function()
		while true do
			local va = a()
			local vb = b()
			if va == nil or vb == nil then
				return
			end
			coroutine.yield(va, vb)
		end
	end)
end`,

  `-- generator_to_table drains a generator into a list.
local function generator_to_table(generator)
	local result = {}
	while true do
		local value = generator()
		if value == nil then
			return result
		end
		result[#result + 1] = value
	end
end`,

  `-- make_lines yields the lines of a string one by one.
local function make_lines(text)
	return coroutine.wrap(function()
		for line in text:gmatch("[^\\n]*") do
			coroutine.yield(line)
		end
	end)
end`,

  `-- producer_consumer pumps values through a coroutine stage.
local function producer_consumer(source, transform)
	return coroutine.wrap(function()
		while true do
			local value = source()
			if value == nil then
				return
			end
			coroutine.yield(transform(value))
		end
	end)
end`,

  `-- batch_processor yields the input list in batches of size n.
local function batch_processor(values, n)
	return coroutine.wrap(function()
		for i = 1, #values, n do
			local batch = {}
			for j = i, math.min(i + n - 1, #values) do
				batch[#batch + 1] = values[j]
			end
			coroutine.yield(batch)
		end
	end)
end`,

  `-- make_timer yields elapsed seconds since the generator started.
local function make_timer()
	local start = os.clock()
	return coroutine.wrap(function()
		while true do
			coroutine.yield(os.clock() - start)
		end
	end)
end`,

  `-- make_powers yields n ^ exponent for increasing exponents.
local function make_powers(base)
	return coroutine.wrap(function()
		local value = 1
		while true do
			coroutine.yield(value)
			value = value * base
		end
	end)
end`,

  `-- make_permutations yields all permutations of a small list.
local function make_permutations(values)
	local n = #values
	return coroutine.wrap(function()
		local function permute(k)
			if k == n then
				local copy = {}
				for i, v in ipairs(values) do
					copy[i] = v
				end
				coroutine.yield(copy)
				return
			end
			for i = k, n do
				values[k], values[i] = values[i], values[k]
				permute(k + 1)
				values[k], values[i] = values[i], values[k]
			end
		end
		permute(1)
	end)
end`,

  `-- run_scheduler round-robins a set of coroutine tasks until they finish.
local function run_scheduler(tasks)
	local step = 0
	while #tasks > 0 do
		local task = table.remove(tasks, 1)
		local ok = coroutine.resume(task, step)
		step = step + 1
		if ok and coroutine.status(task) ~= "dead" then
			tasks[#tasks + 1] = task
		end
	end
	return step
end`,

  `-- run_with_budget resumes a generator until a time budget runs out.
local function run_with_budget(generator, max_seconds)
	local start = os.clock()
	local result = {}
	while os.clock() - start < max_seconds do
		local value = generator()
		if value == nil then
			break
		end
		result[#result + 1] = value
	end
	return result
end`,

  `-- make_collatz yields the Collatz sequence from n until it reaches 1.
local function make_collatz(n)
	return coroutine.wrap(function()
		local current = n
		while current ~= 1 do
			coroutine.yield(current)
			if current % 2 == 0 then
				current = current / 2
			else
				current = 3 * current + 1
			end
		end
		coroutine.yield(1)
	end)
end`,
];

// ---------------------------------------------------------------------------
// 13. models.lua
// ---------------------------------------------------------------------------
const models = [
  `-- new_user builds a User record with sane defaults.
local function new_user(name, email, role)
	return {
		name = name,
		email = email,
		role = role or "viewer",
		active = true,
	}
end`,

  `-- validate_user checks the invariants of a User record.
local function validate_user(user)
	if #user.name < 2 then
		return false, "name too short"
	end
	if not user.email:find("@") then
		return false, "invalid email"
	end
	if user.role ~= "admin" and user.role ~= "editor" and user.role ~= "viewer" then
		return false, "unknown role"
	end
	return true
end`,

  `-- describe_user renders a User as a one-line summary.
local function describe_user(user)
	local state = user.active and "active" or "inactive"
	return string.format("%s <%s> [%s, %s]", user.name, user.email, user.role, state)
end`,

  `-- new_order creates an Order in the pending state.
local function new_order(customer)
	return {
		customer = customer,
		items = {},
		total_cents = 0,
		status = "pending",
	}
end`,

  `-- validate_order ensures an Order is shippable.
local function validate_order(order)
	if #order.items == 0 then
		return false, "empty order"
	end
	if order.total_cents <= 0 then
		return false, "zero total"
	end
	if order.status ~= "pending" and order.status ~= "paid" and order.status ~= "shipped" then
		return false, "bad status"
	end
	return true
end`,

  `-- describe_order summarises an order for a receipt line.
local function describe_order(order)
	local money = string.format("$%d.%02d", math.floor(order.total_cents / 100), order.total_cents % 100)
	return string.format(
		"Order for %s: %d items, %s, %s",
		order.customer,
		#order.items,
		money,
		order.status
	)
end`,

  `-- new_product creates a Product with zero stock.
local function new_product(sku, name, price_cents)
	return {
		sku = sku,
		name = name,
		price_cents = price_cents,
		stock = 0,
	}
end`,

  `-- validate_product checks catalog invariants for a Product.
local function validate_product(product)
	if #product.sku < 3 then
		return false, "sku too short"
	end
	if product.price_cents <= 0 then
		return false, "price must be positive"
	end
	if product.stock < 0 then
		return false, "negative stock"
	end
	return true
end`,

  `-- describe_product formats a catalog line for a product.
local function describe_product(product)
	return string.format("%s  %-30s %s", product.sku, product.name, format_money(product.price_cents))
end`,

  `-- new_booking creates a pending reservation.
local function new_booking(resource, date, start_hour, end_hour)
	return {
		resource = resource,
		date = date,
		start_hour = start_hour,
		end_hour = end_hour,
		status = "pending",
	}
end`,

  `-- validate_booking checks that a booking window is sane.
local function validate_booking(booking)
	if booking.end_hour <= booking.start_hour then
		return false, "window must end after it starts"
	end
	if booking.start_hour < 0 or booking.end_hour > 24 then
		return false, "hour out of range"
	end
	if not booking.date:match("^%d%d%d%d%-%d%d%-%d%d$") then
		return false, "invalid date"
	end
	return true
end`,

  `-- describe_booking renders a booking as a calendar line.
local function describe_booking(booking)
	return string.format(
		"%s  %02d:00-%02d:00  %s",
		booking.date,
		booking.start_hour,
		booking.end_hour,
		booking.resource
	)
end`,

  `-- new_task creates a backlog task with default priority.
local function new_task(title, assignee)
	return {
		title = title,
		assignee = assignee,
		priority = 3,
		estimate = 1,
		status = "backlog",
	}
end`,

  `-- validate_task checks that a task can be scheduled.
local function validate_task(task)
	if #task.title == 0 then
		return false, "title required"
	end
	if task.priority < 1 or task.priority > 5 then
		return false, "priority must be 1..5"
	end
	if task.estimate < 1 then
		return false, "estimate must be positive"
	end
	return true
end`,

  `-- describe_task summarises a task for a sprint board.
local function describe_task(task)
	return string.format("[P%d] %s (est %dd, %s)", task.priority, task.title, task.estimate, task.status)
end`,

  `-- new_account opens an account with an opening deposit.
local function new_account(owner, opening_balance)
	return {
		owner = owner,
		balance = opening_balance,
		limit = 100000,
		currency = "USD",
	}
end`,

  `-- validate_account ensures account fields are coherent.
local function validate_account(account)
	if #account.owner == 0 then
		return false, "owner required"
	end
	if account.balance < 0 then
		return false, "negative balance"
	end
	if account.limit < 0 then
		return false, "negative limit"
	end
	return true
end`,

  `-- describe_account renders an account for a statement header.
local function describe_account(account)
	return string.format("%s: %s %s", account.owner, format_money(account.balance), account.currency)
end`,

  `-- new_invoice computes tax and total for a subtotal.
local function new_invoice(number, order_id, subtotal, tax_rate)
	local tax = math.floor(subtotal * tax_rate)
	return {
		number = number,
		order_id = order_id,
		subtotal = subtotal,
		tax = tax,
		total = subtotal + tax,
		paid = false,
	}
end`,

  `-- validate_invoice checks that an invoice balances.
local function validate_invoice(invoice)
	if invoice.total ~= invoice.subtotal + invoice.tax then
		return false, "total does not balance"
	end
	if invoice.subtotal < 0 or invoice.tax < 0 then
		return false, "negative amount"
	end
	return true
end`,

  `-- describe_invoice summarises an invoice for a payment list.
local function describe_invoice(invoice)
	local money = string.format("$%d.%02d", math.floor(invoice.total / 100), invoice.total % 100)
	local state = invoice.paid and "paid" or "open"
	return string.format("%s #%d: %s (%s)", invoice.number, invoice.order_id, money, state)
end`,
];

// ---------------------------------------------------------------------------
// 14. time_utils.lua
// ---------------------------------------------------------------------------
const time_utils = [
  `-- now_unix returns the current Unix timestamp in seconds.
local function now_unix()
	return os.time()
end`,

  `-- is_leap_year checks the Gregorian leap-year rule.
local function is_leap_year(year)
	if year % 400 == 0 then
		return true
	end
	if year % 100 == 0 then
		return false
	end
	return year % 4 == 0
end`,

  `-- days_in_month returns the day count for a month and year.
local function days_in_month(year, month)
	local days = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 }
	if month == 2 and is_leap_year(year) then
		return 29
	end
	return days[month]
end`,

  `-- day_of_week returns the weekday name for a date.
local function day_of_week(year, month, day)
	local t = os.time({ year = year, month = month, day = day })
	return os.date("%A", t)
end`,

  `-- format_hhmm renders a timestamp as HH:MM.
local function format_hhmm(unix)
	return os.date("%H:%M", unix)
end`,

  `-- seconds_to_hhmmss splits a duration into clock text.
local function seconds_to_hhmmss(total)
	local hours = math.floor(total / 3600)
	local minutes = math.floor((total % 3600) / 60)
	local seconds = total % 60
	return string.format("%02d:%02d:%02d", hours, minutes, seconds)
end`,

  `-- month_name returns the English name of a month number.
local function month_name(month)
	local names = { "January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December" }
	return names[month]
end`,

  `-- is_weekend reports whether a date falls on Saturday or Sunday.
local function is_weekend(year, month, day)
	local weekday = day_of_week(year, month, day)
	return weekday == "Saturday" or weekday == "Sunday"
end`,

  `-- add_days shifts a calendar date forward by a number of days.
local function add_days(year, month, day, days)
	local t = os.time({ year = year, month = month, day = day }) + days * 86400
	local d = os.date("*t", t)
	return d.year, d.month, d.day
end`,

  `-- diff_days returns the whole days between two timestamps.
local function diff_days(later, earlier)
	return math.floor((later - earlier) / 86400)
end`,

  `-- age_from_birthdate computes whole years since a birth date.
local function age_from_birthdate(birth_year, birth_month, birth_day)
	local now = os.date("*t")
	local age = now.year - birth_year
	if now.month < birth_month or (now.month == birth_month and now.day < birth_day) then
		age = age - 1
	end
	return age
end`,

  `-- unix_to_iso formats a timestamp as YYYY-MM-DD.
local function unix_to_iso(unix)
	return os.date("%Y-%m-%d", unix)
end`,

  `-- iso_to_unix parses a YYYY-MM-DD date into a timestamp.
local function iso_to_unix(iso)
	local year, month, day = iso:match("^(%d%d%d%d)-(%d%d)-(%d%d)$")
	if not year then
		return nil
	end
	return os.time({ year = tonumber(year), month = tonumber(month), day = tonumber(day) })
end`,

  `-- relative_label describes how long ago a timestamp was.
local function relative_label(unix)
	local seconds = os.time() - unix
	if seconds < 60 then
		return "just now"
	end
	if seconds < 3600 then
		return string.format("%dm ago", math.floor(seconds / 60))
	end
	if seconds < 86400 then
		return string.format("%dh ago", math.floor(seconds / 3600))
	end
	return string.format("%dd ago", math.floor(seconds / 86400))
end`,

  `-- minutes_since_midnight converts a clock to minutes.
local function minutes_since_midnight(hour, minute)
	return hour * 60 + minute
end`,

  `-- hours_between returns the fractional hours between two timestamps.
local function hours_between(from, to)
	return (to - from) / 3600
end`,

  `-- is_iso_date validates a YYYY-MM-DD string and its calendar values.
local function is_iso_date(iso)
	local year, month, day = iso:match("^(%d%d%d%d)-(%d%d)-(%d%d)$")
	if not year then
		return false
	end
	year, month, day = tonumber(year), tonumber(month), tonumber(day)
	if month < 1 or month > 12 or day < 1 then
		return false
	end
	return day <= days_in_month(year, month)
end`,

  `-- schedule_next_hour returns the next whole hour at or after a timestamp.
local function schedule_next_hour(unix)
	local d = os.date("*t", unix)
	d.minute = 0
	d.second = 0
	return os.time(d)
end`,

  `-- timestamp_label formats a timestamp as "YYYY-MM-DD HH:MM".
local function timestamp_label(unix)
	return os.date("%Y-%m-%d %H:%M", unix)
end`,

  `-- weekday_number maps a date to 0 for Sunday through 6 for Saturday.
local function weekday_number(year, month, day)
	local t = os.time({ year = year, month = month, day = day })
	return tonumber(os.date("%w", t))
end`,

  `-- unix_to_clock returns hour, minute and second of a timestamp.
local function unix_to_clock(unix)
	local d = os.date("*t", unix)
	return d.hour, d.minute, d.second
end`,
];

// ---------------------------------------------------------------------------
// 15. geometry.lua
// ---------------------------------------------------------------------------
const geometry = [
  `-- vec2_new builds a 2D vector.
local function vec2_new(x, y)
	return { x = x or 0, y = y or 0 }
end`,

  `-- vec2_add sums two 2D vectors component-wise.
local function vec2_add(a, b)
	return { x = a.x + b.x, y = a.y + b.y }
end`,

  `-- vec2_sub subtracts b from a component-wise.
local function vec2_sub(a, b)
	return { x = a.x - b.x, y = a.y - b.y }
end`,

  `-- vec2_dot computes the dot product of two 2D vectors.
local function vec2_dot(a, b)
	return a.x * b.x + a.y * b.y
end`,

  `-- vec2_length returns the Euclidean magnitude.
local function vec2_length(v)
	return math.sqrt(v.x * v.x + v.y * v.y)
end`,

  `-- vec2_normalize returns a unit vector, or the zero vector.
local function vec2_normalize(v)
	local length = vec2_length(v)
	if length == 0 then
		return { x = 0, y = 0 }
	end
	return { x = v.x / length, y = v.y / length }
end`,

  `-- vec2_scale multiplies a vector by a scalar.
local function vec2_scale(v, factor)
	return { x = v.x * factor, y = v.y * factor }
end`,

  `-- distance_2d measures the straight-line distance between points.
local function distance_2d(a, b)
	local dx = a.x - b.x
	local dy = a.y - b.y
	return math.sqrt(dx * dx + dy * dy)
end`,

  `-- midpoint_2d averages two points.
local function midpoint_2d(a, b)
	return { x = (a.x + b.x) / 2, y = (a.y + b.y) / 2 }
end`,

  `-- rect_new builds an axis-aligned rectangle.
local function rect_new(x, y, width, height)
	return { x = x, y = y, width = width, height = height }
end`,

  `-- rect_contains tests whether a point lies inside a rectangle.
local function rect_contains(r, p)
	return p.x >= r.x and p.x <= r.x + r.width and p.y >= r.y and p.y <= r.y + r.height
end`,

  `-- circle_area computes the area of a circle by radius.
local function circle_area(radius)
	return math.pi * radius * radius
end`,

  `-- circle_contains tests point membership in a circle.
local function circle_contains(cx, cy, radius, p)
	local dx = p.x - cx
	local dy = p.y - cy
	return dx * dx + dy * dy <= radius * radius
end`,

  `-- polygon_area computes the area via the shoelace formula.
local function polygon_area(points)
	if #points < 3 then
		return 0
	end
	local total = 0
	for i = 1, #points do
		local j = i % #points + 1
		total = total + points[i].x * points[j].y - points[j].x * points[i].y
	end
	return math.abs(total) / 2
end`,

  `-- centroid_2d averages a set of points into one.
local function centroid_2d(points)
	if #points == 0 then
		return { x = 0, y = 0 }
	end
	local x, y = 0, 0
	for _, p in ipairs(points) do
		x = x + p.x
		y = y + p.y
	end
	return { x = x / #points, y = y / #points }
end`,

  `-- reflect_2d mirrors a vector across a unit normal.
local function reflect_2d(v, normal)
	local dot = vec2_dot(v, normal)
	return { x = v.x - 2 * dot * normal.x, y = v.y - 2 * dot * normal.y }
end`,

  `-- project_scalar yields the scalar projection of a onto b.
local function project_scalar(a, b)
	local length = vec2_length(b)
	if length == 0 then
		return 0
	end
	return vec2_dot(a, b) / length
end`,

  `-- angle_between returns the angle between two vectors in radians.
local function angle_between(a, b)
	local length_a = vec2_length(a)
	local length_b = vec2_length(b)
	if length_a == 0 or length_b == 0 then
		return 0
	end
	local cosine = vec2_dot(a, b) / (length_a * length_b)
	return math.acos(math.max(-1, math.min(1, cosine)))
end`,

  `-- vec3_dot computes the dot product of two 3D vectors.
local function vec3_dot(a, b)
	return a.x * b.x + a.y * b.y + a.z * b.z
end`,

  `-- vec3_cross computes the cross product of two 3D vectors.
local function vec3_cross(a, b)
	return {
		x = a.y * b.z - a.z * b.y,
		y = a.z * b.x - a.x * b.z,
		z = a.x * b.y - a.y * b.x,
	}
end`,

  `-- vec3_length returns the Euclidean magnitude of a 3D vector.
local function vec3_length(v)
	return math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
end`,
];

// ---------------------------------------------------------------------------
// 16. encoding.lua
// ---------------------------------------------------------------------------
const encoding = [
  `-- to_hex encodes bytes as lowercase hexadecimal text.
local function to_hex(data)
	local digits = "0123456789abcdef"
	local result = {}
	for i = 1, #data do
		local byte = data:byte(i)
		result[#result + 1] = digits:sub(byte // 16 + 1, byte // 16 + 1)
		result[#result + 1] = digits:sub(byte % 16 + 1, byte % 16 + 1)
	end
	return table.concat(result)
end`,

  `-- from_hex decodes hexadecimal text back into a string.
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
end`,

  `-- to_base64 encodes a string using the standard alphabet.
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
end`,

  `-- base64_value maps one base64 character to its 6-bit value.
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
end`,

  `-- from_base64 decodes standard base64 text into a string.
local function from_base64(text)
	local buffer = 0
	local bits = 0
	local result = {}
	for ch in text:gmatch(".") do
		if ch == "=" or ch == "\\n" or ch == "\\r" then
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
end`,

  String.raw`-- json_escape escapes a string for embedding in JSON.
local function json_escape(s)
	local escapes = { ['"'] = '\\"', ["\\"] = "\\\\", ["\n"] = "\\n", ["\t"] = "\\t", ["\r"] = "\\r" }
	return (s:gsub('[%c\\"]', escapes))
end`,

  String.raw`-- json_unescape reverses the common JSON escape sequences.
local function json_unescape(s)
	local unescapes = { n = "\n", t = "\t", r = "\r", ['"'] = '"', ["\\"] = "\\" }
	return (s:gsub("\\(.)", function(esc)
		return unescapes[esc] or esc
	end))
end`,

  `-- csv_escape quotes a field when it contains special characters.
local function csv_escape(field)
	if field:find('[,%"\\n]') then
		return '"' .. field:gsub('"', '""') .. '"'
	end
	return field
end`,

  `-- xml_escape encodes the five XML entities.
local function xml_escape(text)
	local entities = { ["&"] = "&amp;", ["<"] = "&lt;", [">"] = "&gt;", ['"'] = "&quot;", ["'"] = "&apos;" }
	return (text:gsub("[&<>\\\"']", entities))
end`,

  `-- xml_unescape decodes the five standard XML entities.
local function xml_unescape(text)
	local result = text:gsub("&lt;", "<")
	result = result:gsub("&gt;", ">")
	result = result:gsub("&quot;", '"')
	result = result:gsub("&apos;", "'")
	result = result:gsub("&amp;", "&")
	return result
end`,

  `-- markdown_escape neutralises markdown punctuation.
local function markdown_escape(text)
	return (text:gsub("([%p])", "\\\\%1"))
end`,

  `-- regex_escape escapes metacharacters for use in a literal pattern.
local function regex_escape(text)
	return (text:gsub("([%^%$%(%)%%%.%[%]%*%+%-%?])", "%%%1"))
end`,

  `-- run_length_encode compresses repeated characters as count+char pairs.
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
end`,

  `-- run_length_decode reverses run-length encoded text.
local function run_length_decode(data)
	local result = {}
	for count, ch in data:gmatch("(%d+)(.)") do
		result[#result + 1] = string.rep(ch, tonumber(count))
	end
	return table.concat(result)
end`,

  `-- hamming_distance counts differing bits between two bytes.
local function hamming_distance(a, b)
	local xor = a ~ b
	local count = 0
	while xor ~= 0 do
		count = count + xor % 2
		xor = math.floor(xor / 2)
	end
	return count
end`,

  `-- xor_obfuscate scrambles bytes with a repeating key.
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
end`,

  `-- xor_deobfuscate reverses xor_obfuscate (symmetric cipher).
local function xor_deobfuscate(data, key)
	return xor_obfuscate(data, key)
end`,

  `-- vigenere_encrypt shifts letters using a repeating keyword.
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
end`,

  `-- vigenere_decrypt reverses a Vigenere-encrypted string.
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
end`,

  `-- binary_encode renders a string as a space-separated bit string.
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
end`,

  `-- binary_decode parses a space-separated bit string back to a string.
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
end`,

  `-- rot47 applies the printable-ASCII rotation cipher.
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
end`,
];

files.push(
  { name: 'formatting.lua', procs: formatting },
  { name: 'data_structures.lua', procs: data_structures },
  { name: 'algorithms.lua', procs: algorithms },
  { name: 'coroutines.lua', procs: coroutines },
  { name: 'models.lua', procs: models },
  { name: 'time_utils.lua', procs: time_utils },
  { name: 'geometry.lua', procs: geometry },
  { name: 'encoding.lua', procs: encoding },
);

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------
let total = 0;
for (const f of files) {
  for (const block of f.procs) {
    if (block.includes('\n\n')) {
      throw new Error(`${f.name}: a block contains a blank line and would split`);
    }
  }
  const body = f.procs.join('\n\n');
  fs.writeFileSync(path.join(outDir, f.name), body + '\n');
  total += f.procs.length;
  console.log(`${f.name}: ${f.procs.length} functions`);
}
console.log(`Wrote ${files.length} Lua files, ${total} functions total -> ${outDir}`);
