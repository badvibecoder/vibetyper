// A port is valid when it is an integer between 1 and 65535.
public static boolean isValidPort(int port) {
    return port >= 1 && port <= 65535;
}

// Strips control characters from a header value to avoid injection.
public static String sanitizeHeaderValue(String value) {
    return value == null ? "" : value.replaceAll("[\\r\\n]", "").trim();
}

// Builds a query string from a map of parameters.
public static String buildQueryString(Map<String, String> params) {
    StringBuilder query = new StringBuilder();
    for (Map.Entry<String, String> entry : params.entrySet()) {
        if (query.length() > 0) {
            query.append('&');
        }
        query.append(entry.getKey()).append('=').append(entry.getValue());
    }
    return query.toString();
}

// Parses a query string into a map, last value winning per key.
public static Map<String, String> parseQueryString(String query) {
    Map<String, String> params = new LinkedHashMap<>();
    if (query == null || query.isEmpty()) {
        return params;
    }
    for (String pair : query.split("&")) {
        int eq = pair.indexOf('=');
        if (eq > 0) {
            params.put(pair.substring(0, eq), pair.substring(eq + 1));
        }
    }
    return params;
}

// Joins a base URL and a path, avoiding duplicate slashes.
public static String joinUrlPath(String base, String path) {
    String left = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
    String right = path.startsWith("/") ? path : "/" + path;
    return left + right;
}

// Pulls the host name out of a URL, dropping scheme and port.
public static String extractHostname(String url) {
    try {
        java.net.URI uri = new java.net.URI(url);
        String host = uri.getHost();
        return host == null ? "" : host;
    } catch (java.net.URISyntaxException e) {
        return "";
    }
}

// Masks all but the last octet of an IPv4 address.
public static String maskIpAddress(String ip) {
    String[] octets = ip.split("\\.");
    if (octets.length != 4) {
        return "***";
    }
    return octets[0] + "." + octets[1] + "." + octets[2] + ".***";
}

// Maps an HTTP status code to its standard reason phrase.
public static String httpStatusReason(int code) {
    switch (code) {
        case 200: return "OK";
        case 201: return "Created";
        case 204: return "No Content";
        case 301: return "Moved Permanently";
        case 304: return "Not Modified";
        case 400: return "Bad Request";
        case 401: return "Unauthorized";
        case 403: return "Forbidden";
        case 404: return "Not Found";
        case 409: return "Conflict";
        case 429: return "Too Many Requests";
        case 500: return "Internal Server Error";
        case 503: return "Service Unavailable";
        default: return "Unknown";
    }
}

// Builds an HTTP Basic auth header value from user and password.
public static String basicAuthHeader(String user, String password) {
    String credentials = user + ":" + password;
    String encoded = java.util.Base64.getEncoder().encodeToString(credentials.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    return "Basic " + encoded;
}

// Normalizes a URL by lowercasing host and trimming trailing slashes.
public static String normalizeUrl(String url) {
    try {
        java.net.URI uri = new java.net.URI(url);
        String host = uri.getHost();
        if (host == null) {
            return url;
        }
        String scheme = uri.getScheme().toLowerCase();
        String path = uri.getPath();
        if (path == null || path.isEmpty()) {
            path = "/";
        }
        int port = uri.getPort();
        String portPart = port == -1 ? "" : ":" + port;
        return scheme + "://" + host.toLowerCase() + portPart + path;
    } catch (java.net.URISyntaxException e) {
        return url;
    }
}

// True when an IPv4 address falls inside a CIDR block.
public static boolean ipInCidr(String ip, String cidr) {
    String[] parts = cidr.split("/");
    String[] ipOctets = ip.split("\\.");
    String[] netOctets = parts[0].split("\\.");
    int prefix = Integer.parseInt(parts[1]);
    int ipInt = 0;
    int netInt = 0;
    for (int i = 0; i < 4; i++) {
        ipInt = (ipInt << 8) | Integer.parseInt(ipOctets[i]);
        netInt = (netInt << 8) | Integer.parseInt(netOctets[i]);
    }
    int mask = prefix == 0 ? 0 : -1 << (32 - prefix);
    return (ipInt & mask) == (netInt & mask);
}

// Guesses the device family from a user-agent string.
public static String browserFamily(String userAgent) {
    String ua = userAgent.toLowerCase();
    if (ua.contains("edg")) {
        return "Edge";
    }
    if (ua.contains("firefox")) {
        return "Firefox";
    }
    if (ua.contains("chrome") && !ua.contains("edg")) {
        return "Chrome";
    }
    if (ua.contains("safari") && !ua.contains("chrome")) {
        return "Safari";
    }
    if (ua.contains("curl")) {
        return "curl";
    }
    return "Unknown";
}

// Percent-encodes a single path segment for safe URL use.
public static String encodePathSegment(String segment) {
    try {
        return java.net.URLEncoder.encode(segment, java.nio.charset.StandardCharsets.UTF_8)
                .replace("+", "%20");
    } catch (Exception e) {
        return segment;
    }
}

// Extracts the domain portion of an email address.
public static String domainFromEmail(String email) {
    int at = email.indexOf('@');
    if (at <= 0 || at == email.length() - 1) {
        return "";
    }
    return email.substring(at + 1).toLowerCase();
}

// Validates a host name: labels of letters, digits, and hyphens.
public static boolean isValidHostname(String host) {
    if (host == null || host.length() > 253 || host.startsWith(".") || host.endsWith(".")) {
        return false;
    }
    for (String label : host.split("\\.")) {
        if (label.isEmpty() || label.length() > 63 || !label.matches("[a-zA-Z0-9-]+")) {
            return false;
        }
        if (label.startsWith("-") || label.endsWith("-")) {
            return false;
        }
    }
    return true;
}

// Advances a round-robin index, wrapping back to zero.
public static int nextRoundRobin(int current, int size) {
    if (size <= 0) {
        return 0;
    }
    return (current + 1) % size;
}

// Token-bucket style check: allows a request unless the limit was
// already reached in the current window.
public static boolean rateLimitAllows(long[] windowStart, int[] used, int limit, long windowMillis) {
    long now = System.currentTimeMillis();
    if (now - windowStart[0] >= windowMillis) {
        windowStart[0] = now;
        used[0] = 0;
    }
    if (used[0] >= limit) {
        return false;
    }
    used[0]++;
    return true;
}

// Maps a file extension to a common content type.
public static String contentTypeForExtension(String ext) {
    switch (ext.toLowerCase()) {
        case "html": return "text/html";
        case "css": return "text/css";
        case "js": return "application/javascript";
        case "json": return "application/json";
        case "png": return "image/png";
        case "jpg": case "jpeg": return "image/jpeg";
        case "svg": return "image/svg+xml";
        case "txt": return "text/plain";
        case "pdf": return "application/pdf";
        case "zip": return "application/zip";
        default: return "application/octet-stream";
    }
}

// True when the host is a loopback address.
public static boolean isLoopback(String host) {
    return host.equals("localhost")
            || host.equals("127.0.0.1")
            || host.equals("::1")
            || host.startsWith("127.");
}

// Extracts the port from a "host:port" string, with a fallback.
public static int portFromAddress(String address, int fallback) {
    int colon = address.lastIndexOf(':');
    if (colon <= 0 || colon == address.length() - 1) {
        return fallback;
    }
    try {
        return Integer.parseInt(address.substring(colon + 1));
    } catch (NumberFormatException e) {
        return fallback;
    }
}
