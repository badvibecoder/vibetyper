// Arithmetic mean of a list of doubles.
public static double AverageOf(List<double> values)
{
    return values.Count == 0 ? 0.0 : values.Average();
}

// Min-max normalization mapping values into [0, 1].
public static List<double> NormalizeValues(List<double> values)
{
    double min = values.Min();
    double max = values.Max();
    if (Math.Abs(max - min) < double.Epsilon)
    {
        return Enumerable.Repeat(0.5, values.Count).ToList();
    }
    return values.Select(v => (v - min) / (max - min)).ToList();
}

// Standard score (z-score) of a value within a sample.
public static double ZScore(double value, List<double> sample)
{
    double mean = sample.Average();
    double variance = sample.Sum(v => (v - mean) * (v - mean)) / sample.Count;
    double stdDev = Math.Sqrt(variance);
    if (stdDev == 0)
    {
        return 0;
    }
    return (value - mean) / stdDev;
}

// Simple moving average with a fixed window size.
public static List<double> MovingAverage(List<double> values, int window)
{
    var averages = new List<double>();
    double running = 0;
    for (int i = 0; i < values.Count; i++)
    {
        running += values[i];
        if (i >= window)
        {
            running -= values[i - window];
        }
        if (i >= window - 1)
        {
            averages.Add(running / window);
        }
    }
    return averages;
}

// Splits one CSV line into fields, honoring double-quoted cells.
public static List<string> ParseCsvLine(string line)
{
    var fields = new List<string>();
    var current = new System.Text.StringBuilder();
    bool inQuotes = false;
    for (int i = 0; i < line.Length; i++)
    {
        char c = line[i];
        if (inQuotes && c == '"' && i + 1 < line.Length && line[i + 1] == '"')
        {
            current.Append('"');
            i++;
        }
        else if (c == '"')
        {
            inQuotes = !inQuotes;
        }
        else if (c == ',' && !inQuotes)
        {
            fields.Add(current.ToString());
            current.Clear();
        }
        else
        {
            current.Append(c);
        }
    }
    fields.Add(current.ToString());
    return fields;
}

// Parses "key=value" pairs separated by newlines into a map.
public static Dictionary<string, string> ParseKeyValuePairs(string raw)
{
    var pairs = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    foreach (string line in raw.Split('\n'))
    {
        int eq = line.IndexOf('=');
        if (eq <= 0)
        {
            continue;
        }
        string key = line[..eq].Trim();
        string value = line[(eq + 1)..].Trim();
        pairs[key] = value;
    }
    return pairs;
}

// Tallies log-level keywords found in a list of log lines.
public static Dictionary<string, int> SummarizeLogLevels(List<string> lines)
{
    string[] levels = { "DEBUG", "INFO", "WARN", "ERROR" };
    var counts = new Dictionary<string, int>();
    foreach (string line in lines)
    {
        string upper = line.ToUpperInvariant();
        string? hit = levels.FirstOrDefault(level => upper.Contains(level, StringComparison.Ordinal));
        if (hit != null)
        {
            counts[hit] = counts.GetValueOrDefault(hit) + 1;
        }
    }
    return counts;
}

// Removes records that share the same id, keeping the first one.
public static List<Dictionary<string, string>> DedupeByKey(
    List<Dictionary<string, string>> rows, string key)
{
    var seen = new HashSet<string>();
    var unique = new List<Dictionary<string, string>>();
    foreach (var row in rows)
    {
        if (seen.Add(row.GetValueOrDefault(key) ?? ""))
        {
            unique.Add(row);
        }
    }
    return unique;
}

// Sorts rows first by category, then by amount descending.
public static List<Dictionary<string, object>> SortByMultipleCriteria(
    List<Dictionary<string, object>> rows)
{
    return rows
        .OrderBy(r => (string)r["category"])
        .ThenByDescending(r => (double)r["amount"])
        .ToList();
}

// Buckets a list of numbers into ranges of ten, e.g. 10s, 20s.
public static Dictionary<int, List<int>> BucketByTens(List<int> values)
{
    return values
        .GroupBy(v => v / 10 * 10)
        .OrderBy(g => g.Key)
        .ToDictionary(g => g.Key, g => g.ToList());
}

// Running totals: result[i] = sum of values[0..i].
public static List<int> CumulativeSum(List<int> values)
{
    var totals = new List<int>(values.Count);
    int running = 0;
    foreach (int value in values)
    {
        running += value;
        totals.Add(running);
    }
    return totals;
}

// Drops statistical outliers using the interquartile range rule.
public static List<double> RemoveOutliers(List<double> values)
{
    var sorted = values.OrderBy(v => v).ToList();
    double q1 = sorted[sorted.Count / 4];
    double q3 = sorted[sorted.Count * 3 / 4];
    double iqr = q3 - q1;
    double lower = q1 - 1.5 * iqr;
    double upper = q3 + 1.5 * iqr;
    return values.Where(v => v >= lower && v <= upper).ToList();
}

// Transposes a rectangular matrix of doubles.
public static double[,] TransposeMatrix(double[,] matrix)
{
    int rows = matrix.GetLength(0);
    int cols = matrix.GetLength(1);
    var transposed = new double[cols, rows];
    for (int i = 0; i < rows; i++)
    {
        for (int j = 0; j < cols; j++)
        {
            transposed[j, i] = matrix[i, j];
        }
    }
    return transposed;
}

// Dot product of two equal-length vectors.
public static double DotProduct(double[] a, double[] b)
{
    if (a.Length != b.Length)
    {
        throw new ArgumentException("vectors must have equal length");
    }
    return a.Zip(b, (x, y) => x * y).Sum();
}

// Counts how many records fall into each named category.
public static Dictionary<string, int> CountByCategory(List<string> categories)
{
    return categories.GroupBy(c => c).ToDictionary(g => g.Key, g => g.Count());
}

// Builds display rows, formatting each field for a fixed-width table.
public static List<string> BuildReportRows(
    List<Dictionary<string, object>> records, List<string> columns)
{
    var rows = new List<string>();
    foreach (var record in records)
    {
        var cells = columns.Select(column =>
            record.TryGetValue(column, out object? value)
                ? value is double d ? d.ToString("F2") : value.ToString() ?? "N/A"
                : "N/A");
        rows.Add(string.Join(" | ", cells));
    }
    return rows;
}

// Joins rows from two lists on a shared id column.
public static List<Dictionary<string, object>> JoinOnId(
    List<Dictionary<string, object>> left, List<Dictionary<string, object>> right)
{
    var joined = new List<Dictionary<string, object>>();
    foreach (var l in left)
    {
        foreach (var r in right)
        {
            if (Equals(l["id"], r["id"]))
            {
                var merged = new Dictionary<string, object>(l);
                foreach ((string key, object value) in r)
                {
                    merged[key] = value;
                }
                joined.Add(merged);
            }
        }
    }
    return joined;
}

// Downsamples a series by keeping every nth element.
public static List<double> Downsample(List<double> values, int step)
{
    return values.Where((_, index) => index % step == 0).ToList();
}

// Pivots a flat list of (category, status) pairs into counts per status.
public static Dictionary<string, Dictionary<string, int>> PivotStatusCounts(
    List<string> categories, List<string> statuses)
{
    var pivot = new Dictionary<string, Dictionary<string, int>>();
    for (int i = 0; i < categories.Count; i++)
    {
        if (!pivot.TryGetValue(categories[i], out Dictionary<string, int>? statusCounts))
        {
            statusCounts = new Dictionary<string, int>();
            pivot[categories[i]] = statusCounts;
        }
        statusCounts[statuses[i]] = statusCounts.GetValueOrDefault(statuses[i]) + 1;
    }
    return pivot;
}

// Trims and collapses whitespace on every string field of a record.
public static Dictionary<string, string> SanitizeRecord(Dictionary<string, string> record)
{
    return record.ToDictionary(
        kv => kv.Key,
        kv => string.IsNullOrWhiteSpace(kv.Value)
            ? ""
            : System.Text.RegularExpressions.Regex.Replace(kv.Value.Trim(), "\s+", " "));
}
