package collections

import "core:slice"

Key_Value :: struct {
	key:   string,
	value: int,
}

// sum returns the total of a slice of integers.
sum :: proc(values: []int) -> int {
	total := 0
	for v in values {
		total += v
	}
	return total
}

// product multiplies every element of a slice together.
product :: proc(values: []int) -> int {
	total := 1
	for v in values {
		total *= v
	}
	return total
}

// min_index returns the index of the smallest element.
min_index :: proc(values: []f64) -> int {
	if len(values) == 0 {
		return -1
	}
	best := 0
	for i in 1 ..< len(values) {
		if values[i] < values[best] {
			best = i
		}
	}
	return best
}

// max_index returns the index of the largest element.
max_index :: proc(values: []f64) -> int {
	if len(values) == 0 {
		return -1
	}
	best := 0
	for i in 1 ..< len(values) {
		if values[i] > values[best] {
			best = i
		}
	}
	return best
}

// contains reports whether an integer slice holds a value.
contains :: proc(values: []int, target: int) -> bool {
	for v in values {
		if v == target {
			return true
		}
	}
	return false
}

// index_of finds the first position of a value, or -1.
index_of :: proc(values: []string, target: string) -> int {
	for v, i in values {
		if v == target {
			return i
		}
	}
	return -1
}

// count_where counts elements that satisfy a predicate via callback.
count_where :: proc(values: []int, predicate: proc(int) -> bool) -> int {
	count := 0
	for v in values {
		if predicate(v) {
			count += 1
		}
	}
	return count
}

// all reports whether every element satisfies the predicate.
all :: proc(values: []bool) -> bool {
	for v in values {
		if !v {
			return false
		}
	}
	return true
}

// any reports whether at least one element is true.
any :: proc(values: []bool) -> bool {
	for v in values {
		if v {
			return true
		}
	}
	return false
}

// reverse reverses a slice in place.
reverse :: proc(values: []int) {
	for i in 0 ..< len(values) / 2 {
		j := len(values) - 1 - i
		values[i], values[j] = values[j], values[i]
	}
}

// unique keeps only the first occurrence of each value.
unique :: proc(values: []string) -> []string {
	seen := make(map[string]bool)
	defer delete(seen)
	result := make([dynamic]string)
	defer delete(result)
	for v in values {
		if !seen[v] {
			seen[v] = true
			append(&result, v)
		}
	}
	return result[:]
}

// frequency counts how often each value appears.
frequency :: proc(values: []string) -> map[string]int {
	counts := make(map[string]int)
	for v in values {
		counts[v] += 1
	}
	return counts
}

// chunk splits a slice into fixed-size pieces.
chunk :: proc(values: []int, size: int) -> [][]int {
	if size <= 0 {
		return nil
	}
	result := make([][]int, 0, (len(values) + size - 1) / size)
	for start := 0; start < len(values); start += size {
		end := min(start + size, len(values))
		piece := make([]int, end - start)
		copy(piece, values[start:end])
		append(&result, piece)
	}
	return result
}

// rotate_left shifts elements left by k positions.
rotate_left :: proc(values: []int, k: int) {
	n := len(values)
	if n == 0 {
		return
	}
	shift := ((k % n) + n) % n
	if shift == 0 {
		return
	}
	slice.reverse(values[:shift])
	slice.reverse(values[shift:])
	slice.reverse(values)
}

// zip pairs two slices into a slice of struct pairs.
zip :: proc(keys: []string, values: []int) -> []Key_Value {
	n := min(len(keys), len(values))
	result := make([]Key_Value, n)
	for i in 0 ..< n {
		result[i] = Key_Value{key = keys[i], value = values[i]}
	}
	return result
}

// flatten concatenates a slice of slices into one slice.
flatten :: proc(rows: [][]int) -> []int {
	total := 0
	for row in rows {
		total += len(row)
	}
	result := make([]int, 0, total)
	for row in rows {
		for v in row {
			append(&result, v)
		}
	}
	return result
}

// slice_equal compares two integer slices element by element.
slice_equal :: proc(a, b: []int) -> bool {
	if len(a) != len(b) {
		return false
	}
	for i in 0 ..< len(a) {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

// remove_at deletes the element at index, shifting the rest.
remove_at :: proc(values: ^[dynamic]int, index: int) -> bool {
	if index < 0 || index >= len(values^) {
		return false
	}
	ordered_remove(values, index)
	return true
}

// insert_at places a value at an index, shifting the rest right.
insert_at :: proc(values: ^[dynamic]int, index: int, value: int) {
	if index < 0 {
		index = 0
	}
	if index > len(values^) {
		index = len(values^)
	}
	append(values, 0)
	for i := len(values^) - 1; i > index; i -= 1 {
		values[i] = values[i - 1]
	}
	values[index] = value
}

// swap exchanges two elements of a slice by index.
swap :: proc(values: []int, i, j: int) -> bool {
	if i < 0 || j < 0 || i >= len(values) || j >= len(values) {
		return false
	}
	values[i], values[j] = values[j], values[i]
	return true
}

// fill sets every element of a slice to a fixed value.
fill :: proc(values: []f64, value: f64) {
	for i in 0 ..< len(values) {
		values[i] = value
	}
}

// take returns the first n elements, or all if n is too large.
take :: proc(values: []int, n: int) -> []int {
	if n >= len(values) {
		return values
	}
	return values[:n]
}
