package filesystem

import "core:os"
import "core:path/filepath"
import "core:strings"

// file_exists reports whether a path refers to an existing file.
file_exists :: proc(path: string) -> bool {
	return os.exists(path) && os.is_file(path)
}

// read_text_file reads a whole file into a string.
read_text_file :: proc(path: string) -> (string, bool) {
	data, err := os.read_entire_file(path)
	if err != nil {
		return "", false
	}
	defer delete(data)
	return string(data), true
}

// write_text_file writes a string to a file, overwriting it.
write_text_file :: proc(path, content: string) -> bool {
	err := os.write_entire_file(path, transmute([]u8)content)
	return err == nil
}

// append_text adds a string to the end of a file.
append_text :: proc(path, content: string) -> bool {
	existing, ok := read_text_file(path)
	if !ok {
		existing = ""
	}
	err := os.write_entire_file(path, transmute([]u8)(existing + content))
	return err == nil
}

// read_lines splits a file into its lines without trailing newlines.
read_lines :: proc(path: string) -> ([]string, bool) {
	data, err := os.read_entire_file(path)
	if err != nil {
		return nil, false
	}
	defer delete(data)
	lines := strings.split_lines(string(data))
	return lines, true
}

// count_lines counts newline-separated lines in a file.
count_lines :: proc(path: string) -> (int, bool) {
	data, err := os.read_entire_file(path)
	if err != nil {
		return 0, false
	}
	defer delete(data)
	count := 1
	for b in data {
		if b == '\n' {
			count += 1
		}
	}
	return count, true
}

// getenv_default reads an environment variable with a fallback value.
getenv_default :: proc(name, fallback: string) -> string {
	value, ok := os.getenv(name)
	if !ok {
		return fallback
	}
	return value
}

// is_dir reports whether a path is a directory.
is_dir :: proc(path: string) -> bool {
	return os.is_directory(path)
}

// file_size returns the size of a file in bytes.
file_size :: proc(path: string) -> (i64, bool) {
	handle, err := os.open(path)
	if err != nil {
		return 0, false
	}
	defer os.close(handle)
	size, err2 := os.file_size(handle)
	if err2 != nil {
		return 0, false
	}
	return size, true
}

// remove_file deletes a file, ignoring missing files.
remove_file :: proc(path: string) -> bool {
	if !os.exists(path) {
		return true
	}
	return os.remove(path) == nil
}

// copy_file copies the bytes of one file to another.
copy_file :: proc(src, dst: string) -> bool {
	err := os.copy_file(dst, src)
	return err == nil
}

// rename_file moves a file from one path to another.
rename_file :: proc(from, to: string) -> bool {
	if !os.exists(from) {
		return false
	}
	return os.rename(from, to) == nil
}

// get_extension returns the extension including the dot.
get_extension :: proc(path: string) -> string {
	return filepath.ext(path)
}

// get_base_name returns the final path component.
get_base_name :: proc(path: string) -> string {
	return filepath.base(path)
}

// make_dirs creates a directory with standard permissions.
make_dirs :: proc(dir: string) -> bool {
	return os.make_directory(dir) == nil
}

// join_path joins path components with the platform separator.
join_path :: proc(parts: ..string) -> string {
	return filepath.join(parts[:]...)
}

// path_is_absolute checks for a leading slash.
path_is_absolute :: proc(path: string) -> bool {
	return len(path) > 0 && path[0] == '/'
}

// sanitize_filename replaces unsafe characters with underscores.
sanitize_filename :: proc(name: string) -> string {
	b := strings.builder_make()
	defer strings.builder_destroy(&b)
	for ch in name {
		ok := (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch == '.' || ch == '-' || ch == '_'
		if ok {
			strings.write_byte(&b, ch)
		} else {
			strings.write_byte(&b, '_')
		}
	}
	return strings.clone(strings.to_string(b))
}

// ensure_trailing_slash appends '/' if the path lacks one.
ensure_trailing_slash :: proc(dir: string) -> string {
	if len(dir) > 0 && dir[len(dir) - 1] == '/' {
		return dir
	}
	return dir + "/"
}

// file_extension_matches checks a path against a list of extensions.
file_extension_matches :: proc(path: string, extensions: []string) -> bool {
	ext := filepath.ext(path)
	for candidate in extensions {
		if ext == candidate {
			return true
		}
	}
	return false
}

// relative_path computes a path from base to target.
relative_path :: proc(base, target: string) -> string {
	if !strings.has_prefix(target, base) {
		return target
	}
	return strings.trim_prefix(target, base)
}

// path_depth counts the path segments in a slash-separated path.
path_depth :: proc(p: string) -> int {
	depth := 0
	for ch in p {
		if ch == '/' {
			depth += 1
		}
	}
	return depth
}
