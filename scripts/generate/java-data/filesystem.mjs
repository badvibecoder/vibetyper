// Java filesystem blocks — one complete method per block.
export const filesystem = [
`// Reads an entire text file into one string using UTF-8.
public static String readFileAsString(java.nio.file.Path file) throws java.io.IOException {
    return java.nio.file.Files.readString(file);
}`,
`// Writes a string to a file, creating parent directories as needed.
public static void writeStringToFile(java.nio.file.Path file, String content) throws java.io.IOException {
    java.nio.file.Files.createDirectories(file.getParent());
    java.nio.file.Files.writeString(file, content);
}`,
`// Lists regular files in a directory, skipping sub-directories.
public static List<String> listFileNames(java.nio.file.Path dir) throws java.io.IOException {
    List<String> names = new ArrayList<>();
    try (var stream = java.nio.file.Files.list(dir)) {
        stream.filter(java.nio.file.Files::isRegularFile)
                .forEach(p -> names.add(p.getFileName().toString()));
    }
    return names;
}`,
`// Extracts the extension of a file name, lowercased and without the dot.
public static String fileExtension(String fileName) {
    int dot = fileName.lastIndexOf('.');
    if (dot < 0 || dot == fileName.length() - 1) {
        return "";
    }
    return fileName.substring(dot + 1).toLowerCase();
}`,
`// Formats a byte count into a human-readable size like "4.2 MB".
public static String humanReadableSize(long bytes) {
    if (bytes < 1024) {
        return bytes + " B";
    }
    String[] units = { "KB", "MB", "GB", "TB" };
    double size = bytes;
    int unit = -1;
    while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit++;
    }
    return String.format("%.1f %s", size, units[unit]);
}`,
`// Copies a file to a destination, replacing an existing target.
public static void copyFile(java.nio.file.Path source, java.nio.file.Path target) throws java.io.IOException {
    java.nio.file.Files.copy(source, target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
}`,
`// Recursively deletes a directory tree and everything inside it.
public static void deleteRecursively(java.nio.file.Path root) throws java.io.IOException {
    if (!java.nio.file.Files.exists(root)) {
        return;
    }
    try (var stream = java.nio.file.Files.walk(root)) {
        stream.sorted(java.util.Comparator.reverseOrder()).forEach(p -> {
            try {
                java.nio.file.Files.deleteIfExists(p);
            } catch (java.io.IOException e) {
                throw new java.io.UncheckedIOException(e);
            }
        });
    }
}`,
`// Walks a directory tree collecting every file with a given extension.
public static List<java.nio.file.Path> findFilesByExtension(
        java.nio.file.Path root, String extension) throws java.io.IOException {
    List<java.nio.file.Path> found = new ArrayList<>();
    try (var stream = java.nio.file.Files.walk(root)) {
        stream.filter(java.nio.file.Files::isRegularFile)
                .filter(p -> p.getFileName().toString().endsWith("." + extension))
                .forEach(found::add);
    }
    return found;
}`,
`// Counts the non-blank lines in a text file.
public static long countNonBlankLines(java.nio.file.Path file) throws java.io.IOException {
    try (var lines = java.nio.file.Files.lines(file)) {
        return lines.filter(line -> !line.trim().isEmpty()).count();
    }
}`,
`// Reads a file and keeps only lines matching a keyword.
public static List<String> readLinesContaining(java.nio.file.Path file, String keyword)
        throws java.io.IOException {
    try (var lines = java.nio.file.Files.lines(file)) {
        return lines.filter(line -> line.contains(keyword)).collect(Collectors.toList());
    }
}`,
`// True when the file's last-modified time is older than the given age.
public static boolean isOlderThan(java.nio.file.Path file, java.time.Duration age)
        throws java.io.IOException {
    java.nio.file.attribute.FileTime modified =
            java.nio.file.Files.getLastModifiedTime(file);
    return modified.toInstant().isBefore(java.time.Instant.now().minus(age));
}`,
`// Sanitizes a file name so it is safe to store on disk.
public static String sanitizeFilename(String name) {
    String cleaned = name.replaceAll("[^a-zA-Z0-9._-]", "_");
    cleaned = cleaned.replaceAll("_+", "_");
    return cleaned.substring(0, Math.min(cleaned.length(), 120));
}`,
`// Appends one line to a file, creating it if missing.
public static void appendLine(java.nio.file.Path file, String line) throws java.io.IOException {
    java.nio.file.Files.writeString(file, line + System.lineSeparator(),
            java.nio.file.StandardOpenOption.CREATE,
            java.nio.file.StandardOpenOption.APPEND);
}`,
`// Reads a CSV file into a list of rows, each row a list of fields.
public static List<List<String>> readCsvFile(java.nio.file.Path file) throws java.io.IOException {
    List<List<String>> rows = new ArrayList<>();
    for (String rawLine : java.nio.file.Files.readAllLines(file)) {
        if (!rawLine.trim().isEmpty()) {
            rows.add(parseCsvLine(rawLine));
        }
    }
    return rows;
}`,
`// Prints a directory tree with indentation, one entry per line.
public static List<String> describeTree(java.nio.file.Path root, int depth)
        throws java.io.IOException {
    List<String> lines = new ArrayList<>();
    String indent = "  ".repeat(depth);
    try (var entries = java.nio.file.Files.list(root)) {
        List<java.nio.file.Path> sorted = new ArrayList<>();
        entries.forEach(sorted::add);
        Collections.sort(sorted);
        for (java.nio.file.Path entry : sorted) {
            lines.add(indent + entry.getFileName());
            if (java.nio.file.Files.isDirectory(entry) && depth < 3) {
                lines.addAll(describeTree(entry, depth + 1));
            }
        }
    }
    return lines;
}`,
`// Normalizes a file path, resolving "." and ".." segments.
public static String normalizedPath(String path) {
    return java.nio.file.Paths.get(path).normalize().toString();
}`,
`// Appends a timestamp to a file's base name, keeping the extension.
public static String nameWithTimestamp(String fileName) {
    String base = fileName;
    String ext = "";
    int dot = fileName.lastIndexOf('.');
    if (dot > 0) {
        base = fileName.substring(0, dot);
        ext = fileName.substring(dot);
    }
    String stamp = java.time.LocalDateTime.now()
            .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
    return base + "-" + stamp + ext;
}`,
`// Splits a path into its component segments.
public static List<String> pathSegments(String path) {
    List<String> segments = new ArrayList<>();
    for (String segment : path.split("[\\\\\\\\/]")) {
        if (!segment.isEmpty()) {
            segments.add(segment);
        }
    }
    return segments;
}`,
`// Creates a directory if it does not exist yet, returning whether it
// was newly created.
public static boolean ensureDirectory(java.nio.file.Path dir) throws java.io.IOException {
    if (java.nio.file.Files.isDirectory(dir)) {
        return false;
    }
    java.nio.file.Files.createDirectories(dir);
    return true;
}`,
`// Reads a simple .properties-style file into a map.
public static Map<String, String> readProperties(java.nio.file.Path file) throws java.io.IOException {
    Map<String, String> props = new HashMap<>();
    for (String line : java.nio.file.Files.readAllLines(file)) {
        String trimmed = line.trim();
        if (trimmed.isEmpty() || trimmed.startsWith("#") || trimmed.startsWith("!")) {
            continue;
        }
        int eq = trimmed.indexOf('=');
        int colon = trimmed.indexOf(':');
        int sep;
        if (eq == -1 && colon == -1) {
            continue;
        }
        if (eq == -1) {
            sep = colon;
        } else if (colon == -1) {
            sep = eq;
        } else {
            sep = Math.min(eq, colon);
        }
        if (sep <= 0) {
            continue;
        }
        props.put(trimmed.substring(0, sep).trim(), trimmed.substring(sep + 1).trim());
    }
    return props;
}`,
];
