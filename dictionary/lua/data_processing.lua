-- mean returns the arithmetic average of a list of numbers.
local function mean(values)
	local total = 0
	for _, v in ipairs(values) do
		total = total + v
	end
	return total / #values
end

-- stddev returns the population standard deviation.
local function stddev(values)
	local m = mean(values)
	local total = 0
	for _, v in ipairs(values) do
		total = total + (v - m) ^ 2
	end
	return math.sqrt(total / #values)
end

-- clamp confines a value to the inclusive range [lo, hi].
local function clamp(value, lo, hi)
	if value < lo then
		return lo
	end
	if value > hi then
		return hi
	end
	return value
end

-- parse_csv_line splits a CSV row, honouring quoted fields.
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
end

-- parse_int_list converts "1,2,3" into a list of numbers.
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
end

-- filter_outliers drops values more than 3 stddevs from the mean.
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
end

-- normalize_values scales a list into the [0, 1] range.
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
end

-- zscore transforms values into standard scores.
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
end

-- histogram counts occurrences per exact value.
local function histogram(values)
	local counts = {}
	for _, v in ipairs(values) do
		counts[v] = (counts[v] or 0) + 1
	end
	return counts
end

-- cumulative_sum returns the running total at each index.
local function cumulative_sum(values)
	local result = {}
	local total = 0
	for i, v in ipairs(values) do
		total = total + v
		result[i] = total
	end
	return result
end

-- moving_average smooths a series with a sliding window.
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
end

-- delta computes the difference between consecutive values.
local function delta(values)
	if #values < 2 then
		return {}
	end
	local result = {}
	for i = 2, #values do
		result[i - 1] = values[i] - values[i - 1]
	end
	return result
end

-- clamp_values restricts every value to [lo, hi] in place.
local function clamp_values(values, lo, hi)
	for i, v in ipairs(values) do
		values[i] = clamp(v, lo, hi)
	end
	return values
end

-- dedupe_preserve_order removes repeats keeping first-seen order.
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
end

-- partition splits values into two lists by a predicate.
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
end

-- min_max_scale normalises values between new_min and new_max.
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
end

-- detect_peaks finds indices that exceed both neighbours.
local function detect_peaks(values)
	local peaks = {}
	for i = 2, #values - 1 do
		if values[i] > values[i - 1] and values[i] > values[i + 1] then
			peaks[#peaks + 1] = i
		end
	end
	return peaks
end

-- group_consecutive groups equal values into {value, count} pairs.
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
end

-- running_average computes the cumulative average at each step.
local function running_average(values)
	local result = {}
	local total = 0
	for i, v in ipairs(values) do
		total = total + v
		result[i] = total / i
	end
	return result
end

-- pairwise_add combines two same-length lists element-wise.
local function pairwise_add(a, b)
	if #a ~= #b then
		return nil
	end
	local result = {}
	for i = 1, #a do
		result[i] = a[i] + b[i]
	end
	return result
end

-- interleave merges two lists alternating their elements.
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
end

-- windowed pulls every contiguous window of size k.
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
end

-- bucketize maps values into n equal-width buckets and counts them.
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
end

-- cross_correlation measures similarity of two same-length series.
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
end
