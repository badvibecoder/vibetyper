package data_processing

import "core:math"
import "core:strconv"
import "core:strings"

Run :: struct {
	value: string,
	count: int,
}

// parse_csv_line splits a CSV row honouring quoted fields.
parse_csv_line :: proc(line: string) -> []string {
	fields := make([dynamic]string)
	defer delete(fields)
	current := strings.builder_make()
	defer strings.builder_destroy(&current)
	in_quotes := false
	for i := 0; i < len(line); i += 1 {
		ch := line[i]
		if ch == '"' {
			if in_quotes && i + 1 < len(line) && line[i + 1] == '"' {
				strings.write_byte(&current, '"')
				i += 1
			} else {
				in_quotes = !in_quotes
			}
		} else if ch == ',' && !in_quotes {
			append(&fields, strings.clone(strings.to_string(current)))
			strings.builder_reset(&current)
		} else {
			strings.write_byte(&current, ch)
		}
	}
	append(&fields, strings.clone(strings.to_string(current)))
	return fields[:]
}

// parse_int_list converts "1,2,3" into a slice of ints.
parse_int_list :: proc(s: string) -> ([]int, bool) {
	parts := strings.split(s, ",")
	defer delete(parts)
	result := make([dynamic]int)
	defer delete(result)
	for part in parts {
		trimmed := strings.trim_space(part)
		value, ok := strconv.parse_int(trimmed)
		if !ok {
			return nil, false
		}
		append(&result, value)
	}
	return result[:], true
}

// filter_outliers drops values more than 3 stddevs from the mean.
filter_outliers :: proc(values: []f64) -> []f64 {
	if len(values) < 3 {
		return values
	}
	m := mean(values)
	sd := stddev(values)
	if sd == 0 {
		return values
	}
	result := make([dynamic]f64)
	defer delete(result)
	for v in values {
		if abs(v - m) <= 3 * sd {
			append(&result, v)
		}
	}
	return result[:]
}

// normalize_values scales a slice into the [0, 1] range.
normalize_values :: proc(values: []f64) -> []f64 {
	if len(values) == 0 {
		return values
	}
	lo := values[0]
	hi := values[0]
	for v in values {
		lo = min(lo, v)
		hi = max(hi, v)
	}
	span := hi - lo
	if span == 0 {
		result := make([]f64, len(values))
		return result
	}
	result := make([]f64, len(values))
	for v, i in values {
		result[i] = (v - lo) / span
	}
	return result
}

// zscore transforms values into standard scores.
zscore :: proc(values: []f64) -> []f64 {
	m := mean(values)
	sd := stddev(values)
	result := make([]f64, len(values))
	if sd == 0 {
		return result
	}
	for v, i in values {
		result[i] = (v - m) / sd
	}
	return result
}

// bucketize maps values into n equal-width buckets and counts them.
bucketize :: proc(values: []f64, buckets: int) -> []int {
	if buckets <= 0 || len(values) == 0 {
		return nil
	}
	lo := values[0]
	hi := values[0]
	for v in values {
		lo = min(lo, v)
		hi = max(hi, v)
	}
	counts := make([]int, buckets)
	width := (hi - lo) / f64(buckets)
	for v in values {
		index := int((v - lo) / width)
		index = clamp(index, 0, buckets - 1)
		counts[index] += 1
	}
	return counts
}

// running_average computes the cumulative average at each step.
running_average :: proc(values: []f64) -> []f64 {
	result := make([]f64, len(values))
	total := 0.0
	for v, i in values {
		total += v
		result[i] = total / f64(i + 1)
	}
	return result
}

// moving_average smooths a series with a sliding window.
moving_average :: proc(values: []f64, window: int) -> []f64 {
	if window <= 0 {
		return values
	}
	n := len(values)
	result := make([]f64, n)
	sum := 0.0
	for i in 0 ..< n {
		sum += values[i]
		if i >= window {
			sum -= values[i - window]
		}
		result[i] = sum / f64(min(i + 1, window))
	}
	return result
}

// delta computes the difference between consecutive values.
delta :: proc(values: []f64) -> []f64 {
	if len(values) < 2 {
		return nil
	}
	result := make([]f64, len(values) - 1)
	for i in 1 ..< len(values) {
		result[i - 1] = values[i] - values[i - 1]
	}
	return result
}

// cumulative_sum returns the running total at each index.
cumulative_sum :: proc(values: []int) -> []int {
	result := make([]int, len(values))
	total := 0
	for v, i in values {
		total += v
		result[i] = total
	}
	return result
}

// clamp_values restricts every value to [lo, hi].
clamp_values :: proc(values: []f64, lo, hi: f64) {
	for i in 0 ..< len(values) {
		values[i] = clamp(values[i], lo, hi)
	}
}

// dedupe_preserve_order removes repeats keeping first-seen order.
dedupe_preserve_order :: proc(values: []int) -> []int {
	seen := make(map[int]bool)
	defer delete(seen)
	result := make([dynamic]int)
	defer delete(result)
	for v in values {
		if !seen[v] {
			seen[v] = true
			append(&result, v)
		}
	}
	return result[:]
}

// partition splits values by a predicate into true and false groups.
partition :: proc(values: []int, predicate: proc(int) -> bool) -> ([]int, []int) {
	trues := make([dynamic]int)
	falses := make([dynamic]int)
	defer delete(trues)
	defer delete(falses)
	for v in values {
		if predicate(v) {
			append(&trues, v)
		} else {
			append(&falses, v)
		}
	}
	return trues[:], falses[:]
}

// histogram counts occurrences per exact value.
histogram :: proc(values: []string) -> map[string]int {
	counts := make(map[string]int)
	for v in values {
		counts[v] += 1
	}
	return counts
}

// min_max_scale normalizes each value between new_min and new_max.
min_max_scale :: proc(values: []f64, new_min, new_max: f64) -> []f64 {
	if len(values) == 0 {
		return values
	}
	lo := values[0]
	hi := values[0]
	for v in values {
		lo = min(lo, v)
		hi = max(hi, v)
	}
	result := make([]f64, len(values))
	if hi == lo {
		for i in 0 ..< len(values) {
			result[i] = (new_min + new_max) / 2
		}
		return result
	}
	for v, i in values {
		result[i] = new_min + (v - lo) / (hi - lo) * (new_max - new_min)
	}
	return result
}

// detect_peaks finds indices that exceed both neighbours.
detect_peaks :: proc(values: []f64) -> []int {
	if len(values) < 3 {
		return nil
	}
	peaks := make([dynamic]int)
	defer delete(peaks)
	for i in 1 ..< len(values) - 1 {
		if values[i] > values[i - 1] && values[i] > values[i + 1] {
			append(&peaks, i)
		}
	}
	return peaks[:]
}

// group_consecutive groups identical values into (value, count) pairs.
group_consecutive :: proc(values: []string) -> []Run {
	if len(values) == 0 {
		return nil
	}
	runs := make([dynamic]Run)
	defer delete(runs)
	current := values[0]
	count := 1
	for i in 1 ..< len(values) {
		if values[i] == current {
			count += 1
		} else {
			append(&runs, Run{value = current, count = count})
			current = values[i]
			count = 1
		}
	}
	append(&runs, Run{value = current, count = count})
	return runs[:]
}

// cross_correlation measures similarity of two same-length series.
cross_correlation :: proc(a, b: []f64) -> f64 {
	if len(a) != len(b) || len(a) == 0 {
		return 0
	}
	ma := mean(a)
	mb := mean(b)
	num := 0.0
	da := 0.0
	db := 0.0
	for i in 0 ..< len(a) {
		x := a[i] - ma
		y := b[i] - mb
		num += x * y
		da += x * x
		db += y * y
	}
	denom := math.sqrt(da * db)
	if denom == 0 {
		return 0
	}
	return num / denom
}

// pairwise_add combines two same-length slices element-wise.
pairwise_add :: proc(a, b: []f64) -> ([]f64, bool) {
	if len(a) != len(b) {
		return nil, false
	}
	result := make([]f64, len(a))
	for i in 0 ..< len(a) {
		result[i] = a[i] + b[i]
	}
	return result, true
}

// interleave merges two slices alternating their elements.
interleave :: proc(a, b: []int) -> []int {
	result := make([]int, 0, len(a) + len(b))
	n := max(len(a), len(b))
	for i in 0 ..< n {
		if i < len(a) {
			append(&result, a[i])
		}
		if i < len(b) {
			append(&result, b[i])
		}
	}
	return result
}

// windowed pulls every contiguous window of size k as sub-slices.
windowed :: proc(values: []int, size: int) -> [][]int {
	if size <= 0 || size > len(values) {
		return nil
	}
	result := make([][]int, 0, len(values) - size + 1)
	for start in 0 ..= len(values) - size {
		window := make([]int, size)
		copy(window, values[start:start + size])
		append(&result, window)
	}
	return result
}
