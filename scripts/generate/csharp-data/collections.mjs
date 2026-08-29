// C# collection-operation blocks — one complete method per block.
export const collections = [
`// Merges two already-sorted lists into one sorted list.
public static List<int> MergeSortedLists(List<int> a, List<int> b)
{
    var merged = new List<int>(a.Count + b.Count);
    int i = 0;
    int j = 0;
    while (i < a.Count && j < b.Count)
    {
        if (a[i] <= b[j])
        {
            merged.Add(a[i++]);
        }
        else
        {
            merged.Add(b[j++]);
        }
    }
    while (i < a.Count)
    {
        merged.Add(a[i++]);
    }
    while (j < b.Count)
    {
        merged.Add(b[j++]);
    }
    return merged;
}`,
`// Reverses a list in place and returns it for chaining.
public static List<T> ReverseList<T>(List<T> list)
{
    list.Reverse();
    return list;
}`,
`// Rotates a list to the left by k positions, wrapping around.
public static void RotateList<T>(List<T> list, int k)
{
    if (list.Count < 2)
    {
        return;
    }
    int shift = ((k % list.Count) + list.Count) % list.Count;
    if (shift == 0)
    {
        return;
    }
    var rotated = list.Skip(shift).Concat(list.Take(shift)).ToList();
    list.Clear();
    list.AddRange(rotated);
}`,
`// Removes duplicate elements while keeping first-occurrence order.
public static List<T> DedupePreservingOrder<T>(List<T> items)
{
    return items.Distinct().ToList();
}`,
`// Builds a map from each element to how often it appears.
public static Dictionary<T, int> FrequencyMap<T>(List<T> items) where T : notnull
{
    var frequencies = new Dictionary<T, int>();
    foreach (T item in items)
    {
        frequencies[item] = frequencies.GetValueOrDefault(item) + 1;
    }
    return frequencies;
}`,
`// Splits a list into evens and odds, preserving relative order.
public static void PartitionEvenOdd(List<int> numbers, List<int> evens, List<int> odds)
{
    foreach (int n in numbers)
    {
        if (n % 2 == 0)
        {
            evens.Add(n);
        }
        else
        {
            odds.Add(n);
        }
    }
}`,
`// Elements that appear in both lists, without duplicates.
public static List<T> IntersectLists<T>(List<T> first, List<T> second)
{
    return first.Intersect(second).ToList();
}`,
`// Union of two lists without duplicates, preserving first-list order.
public static List<T> UnionLists<T>(List<T> first, List<T> second)
{
    return first.Union(second).ToList();
}`,
`// Chops a list into fixed-size sublists; the last chunk may be smaller.
public static List<List<T>> ChunkList<T>(List<T> items, int chunkSize)
{
    if (chunkSize <= 0)
    {
        throw new ArgumentOutOfRangeException(nameof(chunkSize), "must be positive");
    }
    return items.Chunk(chunkSize).Select(c => c.ToList()).ToList();
}`,
`// Flattens a nested list structure one level at a time, recursively.
public static List<object> FlattenNested(List<object> nested)
{
    var flat = new List<object>();
    foreach (object item in nested)
    {
        if (item is List<object> sublist)
        {
            flat.AddRange(FlattenNested(sublist));
        }
        else
        {
            flat.Add(item);
        }
    }
    return flat;
}`,
`// Returns the k most frequent elements in descending count order.
public static List<string> TopKFrequent(List<string> words, int k)
{
    return words
        .GroupBy(w => w)
        .OrderByDescending(g => g.Count())
        .Take(k)
        .Select(g => g.Key)
        .ToList();
}`,
`// Checks whether a list is sorted in non-decreasing order.
public static bool IsSorted(List<int> values)
{
    for (int i = 1; i < values.Count; i++)
    {
        if (values[i] < values[i - 1])
        {
            return false;
        }
    }
    return true;
}`,
`// Median of a list without modifying the caller's list.
public static double MedianOf(List<double> values)
{
    if (values.Count == 0)
    {
        throw new ArgumentException("values must not be empty", nameof(values));
    }
    var sorted = values.OrderBy(v => v).ToList();
    int mid = sorted.Count / 2;
    return sorted.Count % 2 == 1
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2.0;
}`,
`// Pairs up two lists into tuples, stopping at the shorter one.
public static List<(A First, B Second)> ZipLists<A, B>(List<A> left, List<B> right)
{
    return left.Zip(right).Select(p => (p.First, p.Second)).ToList();
}`,
`// Removes runs of consecutive equal elements, keeping one of each.
public static List<T> RemoveAdjacentDuplicates<T>(List<T> items)
{
    var result = new List<T>();
    foreach (T item in items)
    {
        if (result.Count == 0 || !result[^1]!.Equals(item))
        {
            result.Add(item);
        }
    }
    return result;
}`,
`// Length of the longest strictly increasing subsequence (DP).
public static int LongestIncreasingSubsequence(List<int> values)
{
    if (values.Count == 0)
    {
        return 0;
    }
    var dp = Enumerable.Repeat(1, values.Count).ToArray();
    int best = 1;
    for (int i = 0; i < values.Count; i++)
    {
        for (int j = 0; j < i; j++)
        {
            if (values[j] < values[i])
            {
                dp[i] = Math.Max(dp[i], dp[j] + 1);
            }
        }
        best = Math.Max(best, dp[i]);
    }
    return best;
}`,
`// Swaps adjacent pairs: [1,2,3,4] becomes [2,1,4,3].
public static List<T> SwapAdjacentPairs<T>(List<T> items)
{
    var swapped = new List<T>(items);
    for (int i = 0; i + 1 < swapped.Count; i += 2)
    {
        (swapped[i], swapped[i + 1]) = (swapped[i + 1], swapped[i]);
    }
    return swapped;
}`,
`// Groups words by their first letter.
public static Dictionary<char, List<string>> GroupByFirstLetter(List<string> words)
{
    return words
        .GroupBy(w => char.ToLowerInvariant(w[0]))
        .ToDictionary(g => g.Key, g => g.ToList());
}`,
`// Finds the one number missing from a sequence 0..n.
public static int FindMissingNumber(int[] values)
{
    long expected = (long)values.Length * (values.Length + 1) / 2;
    long actual = values.Sum(v => (long)v);
    return (int)(expected - actual);
}`,
`// Counts negative, zero, and positive entries in one pass.
public static (int Negatives, int Zeros, int Positives) SignCounts(List<int> values)
{
    int negatives = values.Count(v => v < 0);
    int zeros = values.Count(v => v == 0);
    return (negatives, zeros, values.Count - negatives - zeros);
}`,
];
