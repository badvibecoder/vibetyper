// C# algorithm blocks — one complete method per block.
export const algorithms = [
`// Recursive binary search over a sorted range.
public static int BinarySearchRecursive(int[] sorted, int target, int low, int high)
{
    if (low > high)
    {
        return -1;
    }
    int mid = low + (high - low) / 2;
    if (sorted[mid] == target)
    {
        return mid;
    }
    if (sorted[mid] < target)
    {
        return BinarySearchRecursive(sorted, target, mid + 1, high);
    }
    return BinarySearchRecursive(sorted, target, low, mid - 1);
}`,
`// Linear search returning the first matching index or -1.
public static int LinearSearch(int[] values, int target)
{
    for (int i = 0; i < values.Length; i++)
    {
        if (values[i] == target)
        {
            return i;
        }
    }
    return -1;
}`,
`// Counting sort for non-negative integers in a small range.
public static void CountingSort(int[] values, int maxValue)
{
    var counts = new int[maxValue + 1];
    foreach (int value in values)
    {
        counts[value]++;
    }
    int index = 0;
    for (int i = 0; i <= maxValue; i++)
    {
        while (counts[i] > 0)
        {
            values[index++] = i;
            counts[i]--;
        }
    }
}`,
`// Quickselect: the kth smallest value (0-indexed), average O(n).
public static int QuickSelect(int[] values, int k)
{
    int low = 0;
    int high = values.Length - 1;
    while (low <= high)
    {
        int pivotIndex = Partition(values, low, high);
        if (pivotIndex == k)
        {
            return values[pivotIndex];
        }
        if (pivotIndex < k)
        {
            low = pivotIndex + 1;
        }
        else
        {
            high = pivotIndex - 1;
        }
    }
    throw new ArgumentOutOfRangeException(nameof(k), "k out of range");
}

private static int Partition(int[] values, int low, int high)
{
    int pivot = values[high];
    int store = low;
    for (int i = low; i < high; i++)
    {
        if (values[i] < pivot)
        {
            (values[i], values[store]) = (values[store], values[i]);
            store++;
        }
    }
    values[high] = values[store];
    values[store] = pivot;
    return store;
}`,
`// Fast exponentiation by squaring.
public static long Power(long base_, int exponent)
{
    if (exponent == 0)
    {
        return 1;
    }
    long half = Power(base_, exponent / 2);
    long result = half * half;
    if (exponent % 2 == 1)
    {
        result *= base_;
    }
    return result;
}`,
`// Records the moves of the Tower of Hanoi puzzle.
public static List<string> TowerOfHanoi(int disks, char from, char to, char via)
{
    var moves = new List<string>();
    if (disks == 1)
    {
        moves.Add($"{from} -> {to}");
        return moves;
    }
    moves.AddRange(TowerOfHanoi(disks - 1, from, via, to));
    moves.Add($"{from} -> {to}");
    moves.AddRange(TowerOfHanoi(disks - 1, via, to, from));
    return moves;
}`,
`// All permutations of a string via backtracking.
public static List<string> GeneratePermutations(string input)
{
    var results = new List<string>();
    Permute(input.ToCharArray(), 0, results);
    return results;
}

private static void Permute(char[] chars, int start, List<string> results)
{
    if (start == chars.Length)
    {
        results.Add(new string(chars));
        return;
    }
    for (int i = start; i < chars.Length; i++)
    {
        (chars[start], chars[i]) = (chars[i], chars[start]);
        Permute(chars, start + 1, results);
        (chars[start], chars[i]) = (chars[i], chars[start]);
    }
}`,
`// Every subset of a set, enumerated with bit masks.
public static List<List<int>> GenerateSubsets(List<int> set)
{
    var subsets = new List<List<int>>();
    int n = set.Count;
    for (int mask = 0; mask < 1 << n; mask++)
    {
        var subset = new List<int>();
        for (int i = 0; i < n; i++)
        {
            if ((mask & 1 << i) != 0)
            {
                subset.Add(set[i]);
            }
        }
        subsets.Add(subset);
    }
    return subsets;
}`,
`// Greedy coin change using the largest denominations first.
public static List<int> CoinChangeGreedy(int amount, int[] coins)
{
    int[] sorted = coins.OrderByDescending(c => c).ToArray();
    var change = new List<int>();
    foreach (int coin in sorted)
    {
        while (amount >= coin)
        {
            amount -= coin;
            change.Add(coin);
        }
    }
    return amount == 0 ? change : new List<int>();
}`,
`// Minimum number of coins to make an amount (dynamic programming).
public static int MinCoinsForAmount(int amount, int[] coins)
{
    var dp = Enumerable.Repeat(int.MaxValue, amount + 1).ToArray();
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
    {
        foreach (int coin in coins)
        {
            if (coin <= a && dp[a - coin] != int.MaxValue)
            {
                dp[a] = Math.Min(dp[a], dp[a - coin] + 1);
            }
        }
    }
    return dp[amount] == int.MaxValue ? -1 : dp[amount];
}`,
`// Length of the longest common subsequence of two strings.
public static int LongestCommonSubsequence(string a, string b)
{
    int[,] dp = new int[a.Length + 1, b.Length + 1];
    for (int i = 1; i <= a.Length; i++)
    {
        for (int j = 1; j <= b.Length; j++)
        {
            if (a[i - 1] == b[j - 1])
            {
                dp[i, j] = dp[i - 1, j - 1] + 1;
            }
            else
            {
                dp[i, j] = Math.Max(dp[i - 1, j], dp[i, j - 1]);
            }
        }
    }
    return dp[a.Length, b.Length];
}`,
`// True when every character of a appears in b, in order.
public static bool IsSubsequence(string a, string b)
{
    int i = 0;
    foreach (char c in b)
    {
        if (i < a.Length && a[i] == c)
        {
            i++;
        }
    }
    return i == a.Length;
}`,
`// Number of inversions in an array, counted during a merge sort.
public static long CountInversions(int[] values)
{
    return CountInversionsRange(values, new int[values.Length], 0, values.Length - 1);
}

private static long CountInversionsRange(int[] values, int[] aux, int low, int high)
{
    if (low >= high)
    {
        return 0;
    }
    int mid = low + (high - low) / 2;
    long count = CountInversionsRange(values, aux, low, mid)
        + CountInversionsRange(values, aux, mid + 1, high);
    Array.Copy(values, low, aux, low, high - low + 1);
    int i = low;
    int j = mid + 1;
    int k = low;
    while (i <= mid && j <= high)
    {
        if (aux[i] <= aux[j])
        {
            values[k++] = aux[i++];
        }
        else
        {
            values[k++] = aux[j++];
            count += mid - i + 1;
        }
    }
    while (i <= mid)
    {
        values[k++] = aux[i++];
    }
    while (j <= high)
    {
        values[k++] = aux[j++];
    }
    return count;
}`,
`// Rotates a square matrix 90 degrees clockwise in place.
public static void RotateMatrix90(int[,] matrix)
{
    int n = matrix.GetLength(0);
    for (int layer = 0; layer < n / 2; layer++)
    {
        for (int i = layer; i < n - 1 - layer; i++)
        {
            int tmp = matrix[layer, i];
            matrix[layer, i] = matrix[n - 1 - i, layer];
            matrix[n - 1 - i, layer] = matrix[n - 1 - layer, n - 1 - i];
            matrix[n - 1 - layer, n - 1 - i] = matrix[i, n - 1 - layer];
            matrix[i, n - 1 - layer] = tmp;
        }
    }
}`,
`// Finds the duplicated value when integers 1..n share one slot.
public static int FindDuplicate(int[] values)
{
    int slow = values[0];
    int fast = values[0];
    do
    {
        slow = values[slow];
        fast = values[values[fast]];
    } while (slow != fast);
    slow = values[0];
    while (slow != fast)
    {
        slow = values[slow];
        fast = values[fast];
    }
    return slow;
}`,
`// The nth prime number, found by trial division.
public static long NthPrime(int n)
{
    if (n < 1)
    {
        throw new ArgumentOutOfRangeException(nameof(n), "must be positive");
    }
    int count = 0;
    long candidate = 2;
    while (count < n)
    {
        if (IsPrime(candidate))
        {
            count++;
        }
        candidate++;
    }
    return candidate - 1;
}`,
`// Number of set bits (population count) in an integer.
public static int HammingWeight(int value)
{
    int count = 0;
    while (value != 0)
    {
        value &= value - 1;
        count++;
    }
    return count;
}`,
`// Rearranges an array into its next lexicographic permutation.
public static bool NextPermutation(int[] values)
{
    int i = values.Length - 2;
    while (i >= 0 && values[i] >= values[i + 1])
    {
        i--;
    }
    if (i < 0)
    {
        return false;
    }
    int j = values.Length - 1;
    while (values[j] <= values[i])
    {
        j--;
    }
    (values[i], values[j]) = (values[j], values[i]);
    Array.Reverse(values, i + 1, values.Length - i - 1);
    return true;
}`,
`// Longest run of zeros between two ones in the binary form of n.
public static int BinaryGap(int n)
{
    int best = 0;
    int current = 0;
    bool seenOne = false;
    while (n > 0)
    {
        if ((n & 1) == 1)
        {
            if (seenOne)
            {
                best = Math.Max(best, current);
            }
            seenOne = true;
            current = 0;
        }
        else if (seenOne)
        {
            current++;
        }
        n >>= 1;
    }
    return best;
}`,
`// Maximum number of intervals overlapping at any moment.
public static int MaxConcurrentIntervals(int[] starts, int[] ends)
{
    Array.Sort(starts);
    Array.Sort(ends);
    int i = 0;
    int j = 0;
    int active = 0;
    int max = 0;
    while (i < starts.Length)
    {
        if (starts[i] < ends[j])
        {
            active++;
            max = Math.Max(max, active);
            i++;
        }
        else
        {
            active--;
            j++;
        }
    }
    return max;
}`,
];
