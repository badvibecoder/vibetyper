-- split_host_port separates "host:port" into its parts.
local function split_host_port(address)
	local host, port = address:match("^(.*):(%d+)$")
	if not host then
		return address, nil
	end
	return host, tonumber(port)
end

-- is_valid_port checks a TCP/UDP port number.
local function is_valid_port(port)
	return port >= 1 and port <= 65535
end

-- parse_url breaks a URL into scheme, host and path.
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
end

-- url_encode percent-encodes unsafe URL characters.
local function url_encode(s)
	return (s:gsub("([^%w%-_%.~])", function(ch)
		return string.format("%%%02X", ch:byte())
	end))
end

-- url_decode percent-decodes a URL-encoded string.
local function url_decode(s)
	return (s:gsub("%%(%x%x)", function(hex)
		return string.char(tonumber(hex, 16))
	end))
end

-- build_query_string encodes a parameter map into a query string.
local function build_query_string(params)
	local parts = {}
	for key, value in pairs(params) do
		parts[#parts + 1] = url_encode(key) .. "=" .. url_encode(value)
	end
	return table.concat(parts, "&")
end

-- parse_query_string turns a query string into a parameter map.
local function parse_query_string(query)
	local params = {}
	for pair in query:gmatch("[^&]+") do
		local key, value = pair:match("^([^=]*)=(.*)$")
		if key then
			params[url_decode(key)] = url_decode(value or "")
		end
	end
	return params
end

-- is_http_success classifies a status code as 2xx.
local function is_http_success(status)
	return status >= 200 and status < 300
end

-- http_status_text maps a status code to its reason phrase.
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
end

-- default_port returns the standard port for a scheme.
local function default_port(scheme)
	local ports = {
		http = 80,
		https = 443,
		ftp = 21,
		ssh = 22,
		smtp = 25,
	}
	return ports[scheme:lower()] or 0
end

-- backoff_delay computes an exponential backoff capped at 30s.
local function backoff_delay(attempt, base_ms)
	local delay = base_ms * (2 ^ attempt)
	return math.min(delay, 30000)
end

-- mask_ip hides the last octet of an IPv4 address.
local function mask_ip(address)
	local prefix = address:match("^(%d+%.%d+%.%d+)%.")
	if not prefix then
		return address
	end
	return prefix .. ".0"
end

-- is_local_address checks for loopback or private IPv4 prefixes.
local function is_local_address(address)
	if address == "127.0.0.1" or address == "localhost" then
		return true
	end
	return address:match("^192%.168%.") ~= nil or address:match("^10%.") ~= nil
end

-- extract_header parses one "Name: value" header line.
local function extract_header(line)
	local name, value = line:match("^([^:]+):%s*(.*)$")
	if not name then
		return nil, nil
	end
	return name, value
end

-- parse_headers converts raw header text into a map.
local function parse_headers(text)
	local headers = {}
	for line in text:gmatch("[^\r\n]+") do
		local name, value = extract_header(line)
		if name then
			headers[name:lower()] = value
		end
	end
	return headers
end

-- is_ipv6_like detects a colon-separated address shape.
local function is_ipv6_like(address)
	return address:find(":") ~= nil and address:find("%.") == nil
end

-- normalize_path collapses duplicate slashes and dot segments.
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
end

-- combine_url joins a base URL with a relative path.
local function combine_url(base, relative)
	if relative:sub(1, 1) == "/" then
		return base:gsub("/+$", "") .. relative
	end
	return base:gsub("/+$", "") .. "/" .. relative
end

-- content_type_from_ext guesses a MIME type from an extension.
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
end

-- is_html_content sniffs whether text looks like an HTML document.
local function is_html_content(text)
	local head = text:sub(1, 512):lower()
	return head:find("<html") ~= nil or head:find("<head") ~= nil
end
