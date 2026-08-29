// Reads an entire text file into one string using UTF-8.
public static string ReadFileAsString(string path)
{
    return System.IO.File.ReadAllText(path);
}

// Writes a string to a file, creating parent directories as needed.
public static void WriteStringToFile(string path, string content)
{
    string? directory = System.IO.Path.GetDirectoryName(path);
    if (!string.IsNullOrEmpty(directory))
    {
        System.IO.Directory.CreateDirectory(directory);
    }
    System.IO.File.WriteAllText(path, content);
}

// Lists regular file names in a directory.
public static List<string> ListFileNames(string directory)
{
    return System.IO.Directory.EnumerateFiles(directory)
        .Select(System.IO.Path.GetFileName)
        .Where(name => name != null)
        .Select(name => name!)
        .ToList();
}

// Extracts the extension of a file name, lowercased and without the dot.
public static string FileExtension(string fileName)
{
    string ext = System.IO.Path.GetExtension(fileName);
    return ext.Length > 1 ? ext[1..].ToLowerInvariant() : "";
}

// Formats a byte count into a human-readable size like "4.2 MB".
public static string HumanReadableSize(long bytes)
{
    if (bytes < 1024)
    {
        return $"{bytes} B";
    }
    string[] units = { "KB", "MB", "GB", "TB" };
    double size = bytes;
    int unit = -1;
    while (size >= 1024 && unit < units.Length - 1)
    {
        size /= 1024;
        unit++;
    }
    return $"{size:F1} {units[unit]}";
}

// Copies a file to a destination, replacing an existing target.
public static void CopyFile(string source, string target)
{
    System.IO.File.Copy(source, target, overwrite: true);
}

// Recursively deletes a directory tree and everything inside it.
public static void DeleteRecursively(string root)
{
    if (!System.IO.Directory.Exists(root))
    {
        return;
    }
    foreach (string file in System.IO.Directory.EnumerateFiles(root, "*", System.IO.SearchOption.AllDirectories))
    {
        System.IO.File.Delete(file);
    }
    System.IO.Directory.Delete(root, recursive: true);
}

// Walks a directory tree collecting every file with a given extension.
public static List<string> FindFilesByExtension(string root, string extension)
{
    return System.IO.Directory.EnumerateFiles(root, $"*.{extension}", System.IO.SearchOption.AllDirectories)
        .OrderBy(f => f)
        .ToList();
}

// Counts the non-blank lines in a text file.
public static int CountNonBlankLines(string path)
{
    return System.IO.File.ReadLines(path).Count(line => !string.IsNullOrWhiteSpace(line));
}

// Reads a file and keeps only lines matching a keyword.
public static List<string> ReadLinesContaining(string path, string keyword)
{
    return System.IO.File.ReadLines(path)
        .Where(line => line.Contains(keyword, StringComparison.OrdinalIgnoreCase))
        .ToList();
}

// True when the file's last-modified time is older than the given age.
public static bool IsOlderThan(string path, TimeSpan age)
{
    DateTime modified = System.IO.File.GetLastWriteTimeUtc(path);
    return modified < DateTime.UtcNow - age;
}

// Sanitizes a file name so it is safe to store on disk.
public static string SanitizeFilename(string name)
{
    string cleaned = System.Text.RegularExpressions.Regex.Replace(name, "[^a-zA-Z0-9._-]", "_");
    cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, "_+", "_");
    return cleaned.Length > 120 ? cleaned[..120] : cleaned;
}

// Appends one line to a file, creating it if missing.
public static void AppendLine(string path, string line)
{
    System.IO.File.AppendAllText(path, line + Environment.NewLine);
}

// Reads a CSV file into a list of rows, each row a list of fields.
public static List<List<string>> ReadCsvFile(string path)
{
    var rows = new List<List<string>>();
    foreach (string rawLine in System.IO.File.ReadLines(path))
    {
        if (!string.IsNullOrWhiteSpace(rawLine))
        {
            rows.Add(ParseCsvLine(rawLine));
        }
    }
    return rows;
}

// Lists a directory's entries with their kind and size.
public static List<string> DescribeDirectory(string directory)
{
    var lines = new List<string>();
    foreach (string entry in System.IO.Directory.EnumerateFileSystemEntries(directory).OrderBy(e => e))
    {
        if (System.IO.Directory.Exists(entry))
        {
            lines.Add($"[dir]  {System.IO.Path.GetFileName(entry)}");
        }
        else
        {
            var info = new System.IO.FileInfo(entry);
            lines.Add($"[file] {info.Length,10:N0}  {info.Name}");
        }
    }
    return lines;
}

// Normalizes a file path, resolving "." and ".." segments.
public static string NormalizedPath(string path)
{
    return System.IO.Path.GetFullPath(path);
}

// Appends a timestamp to a file's base name, keeping the extension.
public static string NameWithTimestamp(string fileName)
{
    string base_ = System.IO.Path.GetFileNameWithoutExtension(fileName);
    string ext = System.IO.Path.GetExtension(fileName);
    string stamp = DateTime.Now.ToString("yyyyMMdd-HHmmss");
    return $"{base_}-{stamp}{ext}";
}

// Splits a path into its component segments.
public static List<string> PathSegments(string path)
{
    return path.Split(System.IO.Path.DirectorySeparatorChar, System.IO.Path.AltDirectorySeparatorChar)
        .Where(segment => segment.Length > 0)
        .ToList();
}

// Creates a directory if it does not exist yet, returning whether it
// was newly created.
public static bool EnsureDirectory(string directory)
{
    if (System.IO.Directory.Exists(directory))
    {
        return false;
    }
    System.IO.Directory.CreateDirectory(directory);
    return true;
}

// Reads a simple "key=value" settings file into a map.
public static Dictionary<string, string> ReadSettings(string path)
{
    var settings = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    foreach (string rawLine in System.IO.File.ReadLines(path))
    {
        string line = rawLine.Trim();
        if (line.Length == 0 || line.StartsWith('#'))
        {
            continue;
        }
        int eq = line.IndexOf('=');
        if (eq <= 0)
        {
            continue;
        }
        settings[line[..eq].Trim()] = line[(eq + 1)..].Trim();
    }
    return settings;
}
