-- file_exists reports whether a path names an existing file.
local function file_exists(path)
	local f = io.open(path, "r")
	if f then
		f:close()
		return true
	end
	return false
end

-- read_text reads an entire file into a string.
local function read_text(path)
	local f, err = io.open(path, "r")
	if not f then
		return nil, err
	end
	local content = f:read("*a")
	f:close()
	return content
end

-- write_text writes a string to a file, overwriting it.
local function write_text(path, content)
	local f, err = io.open(path, "w")
	if not f then
		return false, err
	end
	f:write(content)
	f:close()
	return true
end

-- append_text adds a string to the end of a file.
local function append_text(path, content)
	local f, err = io.open(path, "a")
	if not f then
		return false, err
	end
	f:write(content)
	f:close()
	return true
end

-- read_lines returns the lines of a file as a list.
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
end

-- count_lines counts the newline-separated lines in a file.
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
end

-- file_size returns the byte length of a file.
local function file_size(path)
	local f, err = io.open(path, "rb")
	if not f then
		return nil, err
	end
	local size = f:seek("end")
	f:close()
	return size
end

-- remove_file deletes a file, ignoring missing files.
local function remove_file(path)
	local ok, err = os.remove(path)
	if not ok and err ~= "No such file or directory" then
		return false, err
	end
	return true
end

-- rename_file moves a file from one path to another.
local function rename_file(from, to)
	return os.rename(from, to)
end

-- get_extension returns the extension without the dot.
local function get_extension(path)
	local ext = path:match("%.([^%.]+)$")
	if ext then
		return ext
	end
	return ""
end

-- get_basename returns the final path component.
local function get_basename(path)
	return path:match("[^/]+$") or path
end

-- path_join joins path components with a single slash.
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
end

-- path_is_absolute checks for a leading slash.
local function path_is_absolute(path)
	return path:sub(1, 1) == "/"
end

-- sanitize_filename replaces unsafe characters with underscores.
local function sanitize_filename(name)
	return (name:gsub("[^%w%.%-_]", "_"))
end

-- ensure_trailing_slash appends a slash if the path lacks one.
local function ensure_trailing_slash(dir)
	if dir:sub(-1) == "/" then
		return dir
	end
	return dir .. "/"
end

-- getenv_default reads an environment variable with a fallback.
local function getenv_default(name, fallback)
	local value = os.getenv(name)
	if value then
		return value
	end
	return fallback
end

-- home_dir returns the current user's home directory.
local function home_dir()
	return getenv_default("HOME", getenv_default("USERPROFILE", "."))
end

-- dirname returns the directory portion of a path.
local function dirname(path)
	local dir = path:match("^(.*)/[^/]*$")
	if dir then
		return dir
	end
	return "."
end

-- touch_file creates a file if it does not exist.
local function touch_file(path)
	local f, err = io.open(path, "a")
	if not f then
		return false, err
	end
	f:close()
	return true
end

-- file_extension_matches checks a path against a list of extensions.
local function file_extension_matches(path, extensions)
	local ext = get_extension(path):lower()
	for _, candidate in ipairs(extensions) do
		if ext == candidate then
			return true
		end
	end
	return false
end

-- is_empty_dir reports whether a directory has no entries.
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
end
