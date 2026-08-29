// C# data-structure blocks — one complete method per block.
export const dataStructures = [
`// Classic binary search over a sorted array of integers.
public static int BinarySearch(int[] sorted, int target)
{
    int low = 0;
    int high = sorted.Length - 1;
    while (low <= high)
    {
        int mid = low + (high - low) / 2;
        if (sorted[mid] == target)
        {
            return mid;
        }
        if (sorted[mid] < target)
        {
            low = mid + 1;
        }
        else
        {
            high = mid - 1;
        }
    }
    return -1;
}`,
`// Insertion sort, stable and in place.
public static void InsertionSort(int[] values)
{
    for (int i = 1; i < values.Length; i++)
    {
        int key = values[i];
        int j = i - 1;
        while (j >= 0 && values[j] > key)
        {
            values[j + 1] = values[j];
            j--;
        }
        values[j + 1] = key;
    }
}`,
`// Selection sort, swapping the minimum into place each pass.
public static void SelectionSort(int[] values)
{
    for (int i = 0; i < values.Length - 1; i++)
    {
        int minIndex = i;
        for (int j = i + 1; j < values.Length; j++)
        {
            if (values[j] < values[minIndex])
            {
                minIndex = j;
            }
        }
        (values[i], values[minIndex]) = (values[minIndex], values[i]);
    }
}`,
`// Bottom-up merge sort using an auxiliary array.
public static void MergeSort(int[] values)
{
    if (values.Length < 2)
    {
        return;
    }
    int[] aux = new int[values.Length];
    MergeSortRange(values, aux, 0, values.Length - 1);
}

private static void MergeSortRange(int[] values, int[] aux, int low, int high)
{
    if (low >= high)
    {
        return;
    }
    int mid = low + (high - low) / 2;
    MergeSortRange(values, aux, low, mid);
    MergeSortRange(values, aux, mid + 1, high);
    Array.Copy(values, low, aux, low, high - low + 1);
    int i = low;
    int j = mid + 1;
    for (int k = low; k <= high; k++)
    {
        if (i > mid)
        {
            values[k] = aux[j++];
        }
        else if (j > high)
        {
            values[k] = aux[i++];
        }
        else if (aux[j] < aux[i])
        {
            values[k] = aux[j++];
        }
        else
        {
            values[k] = aux[i++];
        }
    }
}`,
`// Quick sort with a median-of-three pivot.
public static void QuickSort(int[] values)
{
    QuickSortRange(values, 0, values.Length - 1);
}

private static void QuickSortRange(int[] values, int low, int high)
{
    if (low >= high)
    {
        return;
    }
    int mid = low + (high - low) / 2;
    int pivot = Math.Max(Math.Min(values[low], values[mid]),
        Math.Min(Math.Max(values[low], values[mid]), values[high]));
    int i = low;
    int j = high;
    while (i <= j)
    {
        while (values[i] < pivot)
        {
            i++;
        }
        while (values[j] > pivot)
        {
            j--;
        }
        if (i <= j)
        {
            (values[i], values[j]) = (values[j], values[i]);
            i++;
            j--;
        }
    }
    QuickSortRange(values, low, j);
    QuickSortRange(values, i, high);
}`,
`// Heap push: inserts a value into a binary max-heap.
public static void HeapPush(List<int> heap, int value)
{
    heap.Add(value);
    int index = heap.Count - 1;
    while (index > 0)
    {
        int parent = (index - 1) / 2;
        if (heap[parent] >= heap[index])
        {
            break;
        }
        (heap[parent], heap[index]) = (heap[index], heap[parent]);
        index = parent;
    }
}`,
`// Heap pop: removes and returns the maximum from a binary max-heap.
public static int HeapPop(List<int> heap)
{
    if (heap.Count == 0)
    {
        throw new InvalidOperationException("heap is empty");
    }
    int max = heap[0];
    int last = heap[^1];
    heap.RemoveAt(heap.Count - 1);
    if (heap.Count > 0)
    {
        heap[0] = last;
        int index = 0;
        while (true)
        {
            int left = index * 2 + 1;
            int right = left + 1;
            int largest = index;
            if (left < heap.Count && heap[left] > heap[largest])
            {
                largest = left;
            }
            if (right < heap.Count && heap[right] > heap[largest])
            {
                largest = right;
            }
            if (largest == index)
            {
                break;
            }
            (heap[index], heap[largest]) = (heap[largest], heap[index]);
            index = largest;
        }
    }
    return max;
}`,
`// Two-sum: finds indices of two values adding up to the target.
public static int[] TwoSum(int[] values, int target)
{
    var seen = new Dictionary<int, int>();
    for (int i = 0; i < values.Length; i++)
    {
        int complement = target - values[i];
        if (seen.TryGetValue(complement, out int index))
        {
            return new[] { index, i };
        }
        seen[values[i]] = i;
    }
    return new[] { -1, -1 };
}`,
`// Maximum subarray sum using Kadane's algorithm.
public static int MaxSubarraySum(int[] values)
{
    int best = int.MinValue;
    int current = 0;
    foreach (int value in values)
    {
        current = Math.Max(value, current + value);
        best = Math.Max(best, current);
    }
    return best;
}`,
`// Longest palindromic substring via expansion around each center.
public static string LongestPalindrome(string text)
{
    if (string.IsNullOrEmpty(text) || text.Length < 2)
    {
        return text;
    }
    string best = text[..1];
    for (int center = 0; center < text.Length; center++)
    {
        best = ExpandPalindrome(text, center, center, best);
        best = ExpandPalindrome(text, center, center + 1, best);
    }
    return best;
}

private static string ExpandPalindrome(string text, int left, int right, string best)
{
    while (left >= 0 && right < text.Length && text[left] == text[right])
    {
        if (right - left + 1 > best.Length)
        {
            best = text[left..(right + 1)];
        }
        left--;
        right++;
    }
    return best;
}`,
`// Validates that a binary tree satisfies the BST ordering property.
public static bool IsBinarySearchTree(TreeNode? node, long min, long max)
{
    if (node is null)
    {
        return true;
    }
    if (node.Value <= min || node.Value >= max)
    {
        return false;
    }
    return IsBinarySearchTree(node.Left, min, node.Value)
        && IsBinarySearchTree(node.Right, node.Value, max);
}

public sealed class TreeNode
{
    public long Value { get; }
    public TreeNode? Left { get; }
    public TreeNode? Right { get; }

    public TreeNode(long value, TreeNode? left = null, TreeNode? right = null)
    {
        Value = value;
        Left = left;
        Right = right;
    }
}`,
`// Maximum depth of a binary tree.
public static int MaxDepth(TreeNode? node)
{
    return node is null ? 0 : 1 + Math.Max(MaxDepth(node.Left), MaxDepth(node.Right));
}`,
`// In-order traversal of a binary tree, returning node values.
public static List<long> InorderTraversal(TreeNode? node)
{
    var values = new List<long>();
    if (node is null)
    {
        return values;
    }
    values.AddRange(InorderTraversal(node.Left));
    values.Add(node.Value);
    values.AddRange(InorderTraversal(node.Right));
    return values;
}`,
`// Finds the minimum element in a rotated, sorted array.
public static int FindMinInRotated(int[] values)
{
    int low = 0;
    int high = values.Length - 1;
    while (low < high)
    {
        int mid = low + (high - low) / 2;
        if (values[mid] > values[high])
        {
            low = mid + 1;
        }
        else
        {
            high = mid;
        }
    }
    return values[low];
}`,
`// 0/1 knapsack: max value fitting a weight capacity (DP).
public static int Knapsack(int capacity, int[] weights, int[] values)
{
    int[,] dp = new int[weights.Length + 1, capacity + 1];
    for (int i = 1; i <= weights.Length; i++)
    {
        for (int w = 0; w <= capacity; w++)
        {
            if (weights[i - 1] <= w)
            {
                dp[i, w] = Math.Max(dp[i - 1, w], dp[i - 1, w - weights[i - 1]] + values[i - 1]);
            }
            else
            {
                dp[i, w] = dp[i - 1, w];
            }
        }
    }
    return dp[weights.Length, capacity];
}`,
`// Fibonacci with memoization (top-down dynamic programming).
public static long FibonacciMemo(int n, Dictionary<int, long> cache)
{
    if (n < 2)
    {
        return n;
    }
    if (cache.TryGetValue(n, out long cached))
    {
        return cached;
    }
    long result = FibonacciMemo(n - 1, cache) + FibonacciMemo(n - 2, cache);
    cache[n] = result;
    return result;
}`,
`// Counts the islands in a binary grid using depth-first flood fill.
public static int CountIslands(int[,] grid)
{
    int islands = 0;
    int rows = grid.GetLength(0);
    int cols = grid.GetLength(1);
    for (int row = 0; row < rows; row++)
    {
        for (int col = 0; col < cols; col++)
        {
            if (grid[row, col] == 1)
            {
                islands++;
                SinkIsland(grid, row, col, rows, cols);
            }
        }
    }
    return islands;
}

private static void SinkIsland(int[,] grid, int row, int col, int rows, int cols)
{
    if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row, col] == 0)
    {
        return;
    }
    grid[row, col] = 0;
    SinkIsland(grid, row - 1, col, rows, cols);
    SinkIsland(grid, row + 1, col, rows, cols);
    SinkIsland(grid, row, col - 1, rows, cols);
    SinkIsland(grid, row, col + 1, rows, cols);
}`,
`// Stack-based check for balanced parentheses only (no brackets).
public static bool BalancedParentheses(string text)
{
    int depth = 0;
    foreach (char c in text)
    {
        if (c == '(')
        {
            depth++;
        }
        else if (c == ')')
        {
            depth--;
            if (depth < 0)
            {
                return false;
            }
        }
    }
    return depth == 0;
}`,
`// Least recently used cache backed by a dictionary and order list.
public sealed class LruCache<K, V> where K : notnull
{
    private readonly int capacity;
    private readonly Dictionary<K, V> items = new();
    private readonly LinkedList<K> order = new();

    public LruCache(int capacity)
    {
        this.capacity = capacity;
    }

    public bool TryGet(K key, out V? value)
    {
        if (items.TryGetValue(key, out value))
        {
            order.Remove(key);
            order.AddFirst(key);
            return true;
        }
        return false;
    }

    public void Put(K key, V value)
    {
        items[key] = value;
        order.Remove(key);
        order.AddFirst(key);
        while (order.Count > capacity)
        {
            K evicted = order.Last!;
            order.RemoveLast();
            items.Remove(evicted);
        }
    }
}`,
`// Detect a cycle in a singly linked list with Floyd's tortoise and hare.
public static bool HasCycle(ListNode? head)
{
    ListNode? slow = head;
    ListNode? fast = head;
    while (fast is not null && fast.Next is not null)
    {
        slow = slow!.Next;
        fast = fast.Next.Next;
        if (ReferenceEquals(slow, fast))
        {
            return true;
        }
    }
    return false;
}

public sealed class ListNode
{
    public int Value { get; }
    public ListNode? Next { get; set; }

    public ListNode(int value)
    {
        Value = value;
    }
}`,
];
