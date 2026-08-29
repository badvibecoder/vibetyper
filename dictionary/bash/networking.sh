# http_get fetches a URL with curl and prints the response body.
http_get() {
    local url="${1:?missing url}"
    curl -fsSL "$url"
}

# http_post_json POSTs a JSON body and prints the response.
http_post_json() {
    local url="${1:?missing url}" data="${2:-{}}"
    curl -fsSL -X POST -H 'Content-Type: application/json' -d "$data" "$url"
}

# http_status prints only the HTTP status code of a request.
http_status() {
    local url="${1:?missing url}"
    curl -s -o /dev/null -w '%{http_code}\n' "$url"
}

# http_headers prints the response headers for a URL.
http_headers() {
    local url="${1:?missing url}"
    curl -sI "$url"
}

# check_http_ok succeeds only when a URL answers with 2xx.
check_http_ok() {
    local url="${1:?missing url}" code
    code=$(http_status "$url")
    [[ "$code" =~ ^2[0-9][0-9]$ ]]
}

# urlencode percent-encodes a string for use in a URL query.
urlencode() {
    local s="${1:-}"
    printf '%s' "$s" | jq -sRr @uri
}

# urldecode converts percent escapes back into characters.
urldecode() {
    local s="${1:-}"
    s=${s//+/ }
    printf '%b' "${s//%/\\x}"
}

# build_query joins key=value pairs into an encoded query string.
build_query() {
    local pair parts=()
    for pair in "$@"; do
        parts+=("$(urlencode "${pair%%=*}")=$(urlencode "${pair#*=}")")
    done
    printf '%s' "${parts[*]}" | tr ' ' '&'
}

# download_retry retries a download with exponential backoff.
download_retry() {
    local url="${1:?missing url}" out="${2:?missing output}" attempt
    for (( attempt = 0; attempt < 4; attempt++ )); do
        if curl -fsSL --retry 2 "$url" -o "$out"; then
            return 0
        fi
        sleep $(( 2 ** attempt ))
    done
    return 1
}

# download_progress fetches a file showing a transfer progress bar.
download_progress() {
    local url="${1:?missing url}" out="${2:-}"
    curl -fL --progress-bar "$url" -o "${out:-$(basename "$url")}"
}

# download_if_newer fetches a file only when the remote copy is newer.
download_if_newer() {
    local url="${1:?missing url}" out="${2:?missing output}"
    curl -fL -z "$out" "$url" -o "$out"
}

# dns_lookup resolves a hostname to its IP addresses.
dns_lookup() {
    local host="${1:?missing host}"
    getent ahosts "$host" | awk '{ print $1 }' | sort -u
}

# ping_host reports whether a host answers a single ping.
ping_host() {
    local host="${1:?missing host}"
    ping -c 1 -W 2 "$host" >/dev/null 2>&1
}

# tcp_port_open tests a TCP port using bash's /dev/tcp redirection.
tcp_port_open() {
    local host="${1:?missing host}" port="${2:?missing port}"
    (exec 3<>"/dev/tcp/$host/$port") 2>/dev/null
}

# wait_for_port polls a TCP port until it opens or times out.
wait_for_port() {
    local host="${1:-127.0.0.1}" port="${2:?missing port}" tries="${3:-30}" i
    for (( i = 0; i < tries; i++ )); do
        if tcp_port_open "$host" "$port"; then
            printf 'port %s:%s is open\n' "$host" "$port"
            return 0
        fi
        sleep 1
    done
    printf 'port %s:%s never opened\n' "$host" "$port" >&2
    return 1
}

# public_ip prints the machine's public IPv4 address.
public_ip() {
    curl -fsSL https://api.ipify.org
}

# local_ips prints the non-loopback IPv4 addresses of this host.
local_ips() {
    hostname -I 2>/dev/null | tr ' ' '\n' | grep -v '^127\.'
}

# default_gateway prints the ip of the default route.
default_gateway() {
    ip route show default | awk '{ print $3; exit }'
}

# fetch_json_field pulls one field from a JSON endpoint.
fetch_json_field() {
    local url="${1:?missing url}" field="${2:?missing field}"
    curl -fsSL "$url" | jq -r --arg f "$field" '.[$f]'
}

# github_release prints the latest release tag of a github repository.
github_release() {
    local repo="${1:?missing repo}"
    curl -fsSL "https://api.github.com/repos/$repo/releases/latest" | jq -r '.tag_name'
}

# upload_multipart sends a file as multipart form data.
upload_multipart() {
    local url="${1:?missing url}" file="${2:?missing file}" field="${3:-file}"
    curl -fsSL -F "$field=@$file" "$url"
}

# tls_expiry prints the expiration date of a host's TLS certificate.
tls_expiry() {
    local host="${1:?missing host}" port="${2:-443}"
    echo | openssl s_client -connect "$host:$port" -servername "$host" 2>/dev/null \
        | openssl x509 -noout -enddate
}

# http_head_check succeeds when a URL answers to a HEAD request.
http_head_check() {
    local url="${1:?missing url}"
    curl -fsSI "$url" >/dev/null
}

# bandwidth_sample reports transfer speed for a download in KB/s.
bandwidth_sample() {
    local url="${1:?missing url}"
    curl -s -o /dev/null -w 'downloaded %{size_download} bytes in %{time_total}s\n' "$url"
}
