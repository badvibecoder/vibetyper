// Swaps keys and values; duplicate values collapse to the last key.
public static Dictionary<V, K> InvertMap<K, V>(Dictionary<K, V> source) where K : notnull where V : notnull
{
    var inverted = new Dictionary<V, K>();
    foreach ((K key, V value) in source)
    {
        inverted[value] = key;
    }
    return inverted;
}

// Adds the counts from the second map into the first, mutating it.
public static Dictionary<string, int> MergeCountMaps(
    Dictionary<string, int> target, Dictionary<string, int> extra)
{
    foreach ((string key, int value) in extra)
    {
        target[key] = target.GetValueOrDefault(key) + value;
    }
    return target;
}

// Returns the value that occurs most often across a map's values.
public static string MostFrequentValue(Dictionary<string, string> source)
{
    return source.Values
        .GroupBy(v => v)
        .OrderByDescending(g => g.Count())
        .First()
        .Key;
}

// Groups words by their length into a map of length -> words.
public static Dictionary<int, List<string>> GroupByLength(List<string> words)
{
    return words
        .GroupBy(w => w.Length)
        .OrderBy(g => g.Key)
        .ToDictionary(g => g.Key, g => g.ToList());
}

// Returns a copy of a map sorted by value in ascending order.
public static Dictionary<string, int> SortByValue(Dictionary<string, int> source)
{
    return source.OrderBy(kv => kv.Value)
        .ToDictionary(kv => kv.Key, kv => kv.Value);
}

// Renders a map as a list of "key=value" strings.
public static List<string> MapToPairs(Dictionary<string, string> source)
{
    return source.Select(kv => $"{kv.Key}={kv.Value}").ToList();
}

// Keys whose values differ between two maps.
public static List<string> DiffMapKeys(
    Dictionary<string, string> before, Dictionary<string, string> after)
{
    var allKeys = new HashSet<string>(before.Keys);
    allKeys.UnionWith(after.Keys);
    return allKeys.Where(key => before.GetValueOrDefault(key) != after.GetValueOrDefault(key)).ToList();
}

// Collects every key that maps to the given value.
public static List<K> KeysForValue<K, V>(Dictionary<K, V> source, V wanted) where K : notnull
{
    return source.Where(kv => EqualityComparer<V>.Default.Equals(kv.Value, wanted))
        .Select(kv => kv.Key)
        .ToList();
}

// Keeps only entries whose key appears in both maps, summing values.
public static Dictionary<string, int> IntersectMaps(
    Dictionary<string, int> a, Dictionary<string, int> b)
{
    return a.Keys
        .Where(b.ContainsKey)
        .ToDictionary(key => key, key => a[key] + b[key]);
}

// Histogram of character frequencies in a string.
public static Dictionary<char, int> CharHistogram(string text)
{
    var histogram = new Dictionary<char, int>();
    foreach (char c in text)
    {
        histogram[c] = histogram.GetValueOrDefault(c) + 1;
    }
    return histogram;
}

// Indexes words under every prefix that starts them.
public static Dictionary<string, List<string>> IndexWordsByPrefix(List<string> words)
{
    var index = new Dictionary<string, List<string>>();
    foreach (string word in words)
    {
        for (int len = 1; len <= Math.Min(3, word.Length); len++)
        {
            string prefix = word[..len];
            if (!index.TryGetValue(prefix, out List<string>? bucket))
            {
                bucket = new List<string>();
                index[prefix] = bucket;
            }
            bucket.Add(word);
        }
    }
    return index;
}

// Reads or creates a cached value atomically.
public static V GetOrAdd<K, V>(Dictionary<K, V> cache, K key, Func<K, V> factory) where K : notnull
{
    if (cache.TryGetValue(key, out V? existing))
    {
        return existing;
    }
    V created = factory(key);
    cache[key] = created;
    return created;
}

// Sums integer values of a map, skipping keys with no entry.
public static int SumValuesByKey(Dictionary<string, int> source, List<string> keys)
{
    int total = 0;
    foreach (string key in keys)
    {
        total += source.GetValueOrDefault(key);
    }
    return total;
}

// Returns the smallest and largest (key, value) pairs by value.
public static (KeyValuePair<string, int> Min, KeyValuePair<string, int> Max) MinAndMaxEntries(
    Dictionary<string, int> source)
{
    var ordered = source.OrderBy(kv => kv.Value).ToList();
    return (ordered.First(), ordered.Last());
}

// Renames a key, preserving its value and dropping the old key.
public static Dictionary<string, int> RenameKey(
    Dictionary<string, int> source, string oldKey, string newKey)
{
    var renamed = new Dictionary<string, int>(source);
    if (renamed.Remove(oldKey, out int value))
    {
        renamed[newKey] = value;
    }
    return renamed;
}

// Splits a map into two buckets based on a value threshold.
public static void SplitByThreshold(
    Dictionary<string, int> source, int threshold,
    Dictionary<string, int> below, Dictionary<string, int> atOrAbove)
{
    foreach ((string key, int value) in source)
    {
        if (value < threshold)
        {
            below[key] = value;
        }
        else
        {
            atOrAbove[key] = value;
        }
    }
}

// Word-frequency map for a body of text, case-insensitive.
public static Dictionary<string, int> WordFrequencies(string text)
{
    var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
    foreach (string word in text.Split(' ', StringSplitOptions.RemoveEmptyEntries))
    {
        counts[word] = counts.GetValueOrDefault(word) + 1;
    }
    return counts;
}

// Builds an index of category -> list of names in that category.
public static Dictionary<string, List<string>> BuildCategoryIndex(
    List<string> names, List<string> categories)
{
    var index = new Dictionary<string, List<string>>();
    for (int i = 0; i < names.Count; i++)
    {
        if (!index.TryGetValue(categories[i], out List<string>? bucket))
        {
            bucket = new List<string>();
            index[categories[i]] = bucket;
        }
        bucket.Add(names[i]);
    }
    return index;
}

// Top n entries by value, as a list of entries in descending order.
public static List<KeyValuePair<string, int>> TopNByValue(Dictionary<string, int> source, int n)
{
    return source.OrderByDescending(kv => kv.Value).Take(n).ToList();
}

// Transforms every value with a function, returning a new map.
public static Dictionary<string, int> TransformValues(
    Dictionary<string, int> source, Func<int, int> transform)
{
    return source.ToDictionary(kv => kv.Key, kv => transform(kv.Value));
}
