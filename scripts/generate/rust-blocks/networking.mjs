// vibetyper rust dictionary data — networking & URL helpers
export const blocks = [
  String.raw`fn parse_host_port(input: &str) -> Option<(String, u16)> {
    let (host, port_text) = input.rsplit_once(':')?;
    let port: u16 = port_text.parse().ok()?;
    if port == 0 {
        return None;
    }
    if host.is_empty() {
        return None;
    }
    Some((host.to_string(), port))
}`,

  String.raw`fn default_port_for_scheme(scheme: &str) -> Option<u16> {
    match scheme.to_ascii_lowercase().as_str() {
        "http" => Some(80),
        "https" => Some(443),
        "ftp" => Some(21),
        "ssh" => Some(22),
        "smtp" => Some(25),
        "ws" => Some(80),
        "wss" => Some(443),
        _ => None,
    }
}`,

  String.raw`fn url_path_segments(path: &str) -> Vec<&str> {
    path.split('/')
        .filter(|segment| !segment.is_empty())
        .collect()
}`,

  String.raw`fn find_query_param(query: &str, key: &str) -> Option<String> {
    for pair in query.split('&') {
        if let Some((name, value)) = pair.split_once('=') {
            if name == key {
                return Some(value.to_string());
            }
        }
    }
    None
}`,

  String.raw`fn encode_path_segment(segment: &str) -> String {
    let mut out = String::with_capacity(segment.len() * 3);
    for byte in segment.as_bytes() {
        let unreserved = byte.is_ascii_alphanumeric()
            || *byte == b'-'
            || *byte == b'_'
            || *byte == b'.'
            || *byte == b'~';
        if unreserved {
            out.push(char::from(*byte));
        } else {
            out.push_str(&format!("%{:02X}", byte));
        }
    }
    out
}`,

  String.raw`fn parse_status_line(line: &str) -> Option<(u16, String)> {
    let mut parts = line.splitn(3, ' ');
    let version = parts.next()?;
    if !version.starts_with("HTTP/") {
        return None;
    }
    let code: u16 = parts.next()?.parse().ok()?;
    let reason = parts.next().unwrap_or("").to_string();
    Some((code, reason))
}`,

  String.raw`fn build_get_request_line(path: &str, host: &str) -> String {
    let safe_path = if path.is_empty() { "/" } else { path };
    format!(
        "GET {} HTTP/1.1\r\nHost: {}\r\nConnection: close\r\nUser-Agent: vibetyper/1.0",
        safe_path, host
    )
}`,

  String.raw`fn parse_headers_to_map(header_lines: &[String]) -> std::collections::HashMap<String, String> {
    let mut headers = std::collections::HashMap::new();
    for line in header_lines {
        if let Some((name, value)) = line.split_once(':') {
            headers.insert(
                name.trim().to_ascii_lowercase(),
                value.trim().to_string(),
            );
        }
    }
    headers
}`,

  String.raw`fn is_valid_http_method(method: &str) -> bool {
    match method {
        "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" => true,
        _ => false,
    }
}`,

  String.raw`fn ipv4_to_string(octets: [u8; 4]) -> String {
    octets
        .iter()
        .map(|octet| octet.to_string())
        .collect::<Vec<_>>()
        .join(".")
}`,

  String.raw`fn ipv4_from_string(text: &str) -> Option<[u8; 4]> {
    let parts: Vec<&str> = text.split('.').collect();
    if parts.len() != 4 {
        return None;
    }
    let mut octets = [0u8; 4];
    for (index, part) in parts.iter().enumerate() {
        let value: u16 = part.parse().ok()?;
        if value > 255 {
            return None;
        }
        octets[index] = value as u8;
    }
    Some(octets)
}`,

  String.raw`fn cidr_contains(ip: [u8; 4], cidr: &str) -> bool {
    let (network, prefix_text) = cidr.split_once('/').unwrap_or(("", "0"));
    let Ok(prefix) = prefix_text.parse::<u8>() else {
        return false;
    };
    let Some(network_octets) = ipv4_from_string(network) else {
        return false;
    };
    let mask = if prefix >= 32 { u32::MAX } else { u32::MAX << (32 - prefix) };
    let ip_value = u32::from_be_bytes(ip);
    let net_value = u32::from_be_bytes(network_octets);
    ip_value & mask == net_value & mask
}`,

  String.raw`fn sanitize_hostname(hostname: &str) -> String {
    hostname
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '.' {
                ch.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect()
}`,

  String.raw`fn build_url(scheme: &str, host: &str, port: u16, path: &str) -> String {
    let default = default_port_for_scheme(scheme);
    let port_part = if Some(port) == default {
        String::new()
    } else {
        format!(":{}", port)
    };
    let trimmed = path.trim_start_matches('/');
    format!("{}://{}{}/{}", scheme, host, port_part, trimmed)
}`,

  String.raw`// Last two labels of a hostname, e.g. "cdn.edge.gadgetnet.io" -> "gadgetnet.io".
fn extract_registered_domain(hostname: &str) -> Option<String> {
    let labels: Vec<&str> = hostname
        .split('.')
        .filter(|label| !label.is_empty())
        .collect();
    if labels.len() < 2 {
        return None;
    }
    let second = labels[labels.len() - 2];
    let last = labels[labels.len() - 1];
    Some(format!("{}.{}", second, last))
}`,

  String.raw`fn is_private_ip(octets: [u8; 4]) -> bool {
    match octets {
        [10, _, _, _] => true,
        [127, _, _, _] => true,
        [169, 254, _, _] => true,
        [172, second, _, _] if (16..=31).contains(&second) => true,
        [192, 168, _, _] => true,
        _ => false,
    }
}`,

  String.raw`fn mime_for_extension(extension: &str) -> &str {
    match extension.to_ascii_lowercase().as_str() {
        "html" | "htm" => "text/html; charset=utf-8",
        "json" => "application/json",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "txt" => "text/plain",
        "css" => "text/css",
        _ => "application/octet-stream",
    }
}`,

  String.raw`fn parse_cookie_pair(pair: &str) -> Option<(String, String)> {
    let (name, value) = pair.split_once('=')?;
    if name.trim().is_empty() {
        return None;
    }
    Some((name.trim().to_string(), value.to_string()))
}`,

  String.raw`fn build_query_string(pairs: &[(&str, &str)]) -> String {
    pairs
        .iter()
        .map(|(key, value)| format!("{}={}", key, value))
        .collect::<Vec<_>>()
        .join("&")
}`,

  String.raw`fn split_authority(authority: &str) -> Option<(String, String, u16)> {
    let (user_and_host, port_text) = authority.rsplit_once(':')?;
    let port: u16 = port_text.parse().ok()?;
    let (user, host) = match user_and_host.split_once('@') {
        Some((u, h)) => (u.to_string(), h.to_string()),
        None => (String::new(), user_and_host.to_string()),
    };
    Some((user, host, port))
}`,

  String.raw`fn is_redirect_status(code: u16) -> bool {
    if !(300..=399).contains(&code) {
        return false;
    }
    code != 304 && code != 305
}`,

  String.raw`fn parse_content_type(header: &str) -> (String, Option<String>) {
    let mut parts = header.split(';');
    let media_type = parts.next().unwrap_or("").trim().to_ascii_lowercase();
    let mut charset = None;
    for part in parts {
        if let Some((name, value)) = part.trim().split_once('=') {
            if name.trim().eq_ignore_ascii_case("charset") {
                charset = Some(value.trim().trim_matches('"').to_string());
            }
        }
    }
    (media_type, charset)
}`,
];
// total: 22
