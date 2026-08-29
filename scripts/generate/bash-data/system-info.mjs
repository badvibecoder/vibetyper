// Data module for scripts/generate/generate-bash.mjs.
// Hand-written, realistic Bash blocks: system information.

export default {
  file: 'system_info.sh',
  blocks: [
`# os_release prints the operating system name and version.
os_release() {
    . /etc/os-release
    printf '%s %s\\n' "\$NAME" "\$VERSION_ID"
}`,

`# kernel_version prints the running kernel release.
kernel_version() {
    uname -r
}`,

`# kernel_arch prints the machine hardware architecture.
kernel_arch() {
    uname -m
}`,

`# hostname_short prints the hostname without its domain part.
hostname_short() {
    hostname -s
}`,

`# fqdn prints the fully qualified domain name of this host.
fqdn() {
    hostname -f 2>/dev/null || hostname
}`,

`# current_user prints the effective user id and name.
current_user() {
    printf '%s (%s)\\n' "\$(id -un)" "\$(id -u)"
}`,

`# home_dir prints the home directory for a user name.
home_dir() {
    local user="\${1:-\$(id -un)}"
    getent passwd "\$user" | cut -d: -f6
}`,

`# mem_total prints total memory in megabytes.
mem_total() {
    awk '/MemTotal/ { printf "%d MB\\n", \$2 / 1024 }' /proc/meminfo
}`,

`# mem_free prints available memory in megabytes.
mem_free() {
    awk '/MemAvailable/ { printf "%d MB\\n", \$2 / 1024 }' /proc/meminfo
}`,

`# disk_free prints free space on the root filesystem in GB.
disk_free() {
    df -BG / | awk 'NR == 2 { print \$4 }'
}`,

`# uptime_seconds prints the system uptime in whole seconds.
uptime_seconds() {
    awk '{ print int(\$1) }' /proc/uptime
}`,

`# uptime_human prints the system uptime in days, hours and minutes.
uptime_human() {
    local seconds days hours minutes
    seconds=\$(uptime_seconds)
    days=\$(( seconds / 86400 ))
    hours=\$(( (seconds % 86400) / 3600 ))
    minutes=\$(( (seconds % 3600) / 60 ))
    printf '%dd %dh %dm\\n' "\$days" "\$hours" "\$minutes"
}`,

`# boot_time prints when the system was last booted.
boot_time() {
    who -b | awk '{ print \$3, \$4 }'
}`,

`# load_averages prints the 1, 5 and 15 minute load averages.
load_averages() {
    cat /proc/loadavg | cut -d' ' -f1-3
}`,

`# process_count_total counts all running processes.
process_count_total() {
    ps -e --no-headers | wc -l | tr -d '[:space:]'
}`,

`# users_logged lists the users currently logged in, deduplicated.
users_logged() {
    who | awk '{ print \$1 }' | sort -u
}`,

`# shell_version prints the bash version in use.
shell_version() {
    printf '%s\\n' "\${BASH_VERSION:-unknown}"
}`,

`# system_virtualization reports whether this host is a virtual machine.
system_virtualization() {
    systemd-detect-virt 2>/dev/null || printf 'none'
}`,

`# terminal_type prints the current terminal emulator.
terminal_type() {
    printf '%s\\n' "\${TERM:-unknown}"
}`,

`# locale_summary prints the active locale settings.
locale_summary() {
    printf 'LANG=%s LC_ALL=%s\\n' "\${LANG:-unset}" "\${LC_ALL:-unset}"
}`,

`# tool_versions prints the versions of common development tools.
tool_versions() {
    printf 'git: %s\\n' "\$(git --version 2>/dev/null | awk '{print \$3}')"
    printf 'node: %s\\n' "\$(node --version 2>/dev/null)"
    printf 'docker: %s\\n' "\$(docker --version 2>/dev/null | awk '{print \$3}')"
}`,

`# cpu_model prints the model name of the first processor.
cpu_model() {
    grep -m1 'model name' /proc/cpuinfo | cut -d: -f2 | sed 's/^ //'
}`,
  ],
};
