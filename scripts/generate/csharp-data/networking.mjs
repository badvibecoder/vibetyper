// C# networking blocks — one complete method per block.
export const networking = [
`// A port is valid when it is an integer between 1 and 65535.
public static bool IsValidPort(int port)
{
    return port is >= 1 and <= 65535;
}`,
`// Strips control characters from a header value to avoid injection.
public static string SanitizeHeaderValue(string? value)
{
    return value is null
        ? ""
        : System.Text.RegularExpressions.Regex.Replace(value, "[\\r\\n]", "").Trim();
}`,
`// Builds a query string from a map of parameters.
public static string BuildQueryString(Dictionary<string, string> parameters)
{
    return string.Join("&", parameters.Select(kv => $"{kv.Key}={kv.Value}"));
}`,
`// Parses a query string into a map, last value winning per key.
public static Dictionary<string, string> ParseQueryString(string? query)
{
    var parameters = new Dictionary<string, string>();
    if (string.IsNullOrEmpty(query))
    {
        return parameters;
    }
    foreach (string pair in query.Split('&', StringSplitOptions.RemoveEmptyEntries))
    {
        int eq = pair.IndexOf('=');
        if (eq > 0)
        {
            parameters[pair[..eq]] = pair[(eq + 1)..];
        }
    }
    return parameters;
}`,
`// Joins a base URL and a path, avoiding duplicate slashes.
public static string JoinUrlPath(string baseUrl, string path)
{
    string left = baseUrl.TrimEnd('/');
    string right = path.StartsWith('/') ? path : "/" + path;
    return left + right;
}`,
`// Pulls the host name out of a URL, dropping scheme and port.
public static string ExtractHostname(string url)
{
    return Uri.TryCreate(url, UriKind.Absolute, out Uri? uri) ? uri.Host : "";
}`,
`// Masks all but the last octet of an IPv4 address.
public static string MaskIpAddress(string ip)
{
    string[] octets = ip.Split('.');
    if (octets.Length != 4)
    {
        return "***";
    }
    return $"{octets[0]}.{octets[1]}.{octets[2]}.***";
}`,
`// Maps an HTTP status code to its standard reason phrase.
public static string HttpStatusReason(int code)
{
    return code switch
    {
        200 => "OK",
        201 => "Created",
        204 => "No Content",
        301 => "Moved Permanently",
        304 => "Not Modified",
        400 => "Bad Request",
        401 => "Unauthorized",
        403 => "Forbidden",
        404 => "Not Found",
        409 => "Conflict",
        429 => "Too Many Requests",
        500 => "Internal Server Error",
        503 => "Service Unavailable",
        _ => "Unknown",
    };
}`,
`// Builds an HTTP Basic auth header value from user and password.
public static string BasicAuthHeader(string user, string password)
{
    string credentials = $"{user}:{password}";
    string encoded = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(credentials));
    return "Basic " + encoded;
}`,
`// Normalizes a URL by lowercasing the host and trimming trailing slashes.
public static string NormalizeUrl(string url)
{
    if (!Uri.TryCreate(url, UriKind.Absolute, out Uri? uri))
    {
        return url;
    }
    string path = string.IsNullOrEmpty(uri.AbsolutePath) ? "/" : uri.AbsolutePath;
    string port = uri.IsDefaultPort ? "" : $":{uri.Port}";
    return $"{uri.Scheme}://{uri.Host.ToLowerInvariant()}{port}{path}";
}`,
`// True when an IPv4 address falls inside a CIDR block.
public static bool IpInCidr(string ip, string cidr)
{
    string[] parts = cidr.Split('/');
    int prefix = int.Parse(parts[1]);
    uint ipValue = IpToUint(ip);
    uint network = IpToUint(parts[0]);
    uint mask = prefix == 0 ? 0u : ~(uint.MaxValue >> prefix);
    return (ipValue & mask) == (network & mask);
}

private static uint IpToUint(string ip)
{
    string[] octets = ip.Split('.');
    return (uint.Parse(octets[0]) << 24)
        | (uint.Parse(octets[1]) << 16)
        | (uint.Parse(octets[2]) << 8)
        | uint.Parse(octets[3]);
}`,
`// Guesses the browser family from a user-agent string.
public static string BrowserFamily(string userAgent)
{
    string ua = userAgent.ToLowerInvariant();
    if (ua.Contains("edg", StringComparison.Ordinal))
    {
        return "Edge";
    }
    if (ua.Contains("firefox", StringComparison.Ordinal))
    {
        return "Firefox";
    }
    if (ua.Contains("chrome", StringComparison.Ordinal))
    {
        return "Chrome";
    }
    if (ua.Contains("safari", StringComparison.Ordinal))
    {
        return "Safari";
    }
    if (ua.Contains("curl", StringComparison.Ordinal))
    {
        return "curl";
    }
    return "Unknown";
}`,
`// Percent-encodes a single path segment for safe URL use.
public static string EncodePathSegment(string segment)
{
    return Uri.EscapeDataString(segment).Replace("%20", "+");
}`,
`// Extracts the domain portion of an email address.
public static string DomainFromEmail(string email)
{
    int at = email.IndexOf('@');
    if (at <= 0 || at == email.Length - 1)
    {
        return "";
    }
    return email[(at + 1)..].ToLowerInvariant();
}`,
`// Validates a host name: labels of letters, digits, and hyphens.
public static bool IsValidHostname(string? host)
{
    if (string.IsNullOrEmpty(host) || host.Length > 253)
    {
        return false;
    }
    foreach (string label in host.Split('.'))
    {
        if (label.Length == 0 || label.Length > 63)
        {
            return false;
        }
        if (label[0] == '-' || label[^1] == '-')
        {
            return false;
        }
        if (!label.All(c => char.IsLetterOrDigit(c) || c == '-'))
        {
            return false;
        }
    }
    return true;
}`,
`// Advances a round-robin index, wrapping back to zero.
public static int NextRoundRobin(int current, int size)
{
    return size <= 0 ? 0 : (current + 1) % size;
}`,
`// Token-bucket style check: allows a request unless the limit was
// already reached in the current window.
public static bool RateLimitAllows(
    ref DateTime windowStart, ref int used, int limit, TimeSpan window)
{
    DateTime now = DateTime.UtcNow;
    if (now - windowStart >= window)
    {
        windowStart = now;
        used = 0;
    }
    if (used >= limit)
    {
        return false;
    }
    used++;
    return true;
}`,
`// Maps a file extension to a common content type.
public static string ContentTypeForExtension(string ext)
{
    return ext.ToLowerInvariant() switch
    {
        "html" => "text/html",
        "css" => "text/css",
        "js" => "application/javascript",
        "json" => "application/json",
        "png" => "image/png",
        "jpg" or "jpeg" => "image/jpeg",
        "svg" => "image/svg+xml",
        "txt" => "text/plain",
        "pdf" => "application/pdf",
        "zip" => "application/zip",
        _ => "application/octet-stream",
    };
}`,
`// True when the host is a loopback address.
public static bool IsLoopback(string host)
{
    return host == "localhost"
        || host == "127.0.0.1"
        || host == "::1"
        || host.StartsWith("127.", StringComparison.Ordinal);
}`,
`// Extracts the port from a "host:port" string, with a fallback.
public static int PortFromAddress(string address, int fallback)
{
    int colon = address.LastIndexOf(':');
    if (colon <= 0 || colon == address.Length - 1)
    {
        return fallback;
    }
    return int.TryParse(address[(colon + 1)..], out int port) ? port : fallback;
}`,
];
