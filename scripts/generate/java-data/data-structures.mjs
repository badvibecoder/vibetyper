// Java data-structure blocks — one complete method per block.
export const dataStructures = [
`// Classic binary search over a sorted array of integers.
public static int binarySearch(int[] sorted, int target) {
    int low = 0;
    int high = sorted.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (sorted[mid] == target) {
            return mid;
        }
        if (sorted[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}`,
`// Insertion sort, stable and in place.
public static void insertionSort(int[] values) {
    for (int i = 1; i < values.length; i++) {
        int key = values[i];
        int j = i - 1;
        while (j >= 0 && values[j] > key) {
            values[j + 1] = values[j];
            j--;
        }
        values[j + 1] = key;
    }
}`,
`// Selection sort, swapping the minimum into place each pass.
public static void selectionSort(int[] values) {
    for (int i = 0; i < values.length - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < values.length; j++) {
            if (values[j] < values[minIndex]) {
                minIndex = j;
            }
        }
        int tmp = values[i];
        values[i] = values[minIndex];
        values[minIndex] = tmp;
    }
}`,
`// Bottom-up merge sort using an auxiliary array.
public static void mergeSort(int[] values) {
    if (values.length < 2) {
        return;
    }
    int[] aux = new int[values.length];
    mergeSortRange(values, aux, 0, values.length - 1);
}

private static void mergeSortRange(int[] values, int[] aux, int low, int high) {
    if (low >= high) {
        return;
    }
    int mid = low + (high - low) / 2;
    mergeSortRange(values, aux, low, mid);
    mergeSortRange(values, aux, mid + 1, high);
    System.arraycopy(values, low, aux, low, high - low + 1);
    int i = low;
    int j = mid + 1;
    for (int k = low; k <= high; k++) {
        if (i > mid) {
            values[k] = aux[j++];
        } else if (j > high) {
            values[k] = aux[i++];
        } else if (aux[j] < aux[i]) {
            values[k] = aux[j++];
        } else {
            values[k] = aux[i++];
        }
    }
}`,
`// Quick sort with a median-of-three pivot.
public static void quickSort(int[] values) {
    quickSortRange(values, 0, values.length - 1);
}

private static void quickSortRange(int[] values, int low, int high) {
    if (low >= high) {
        return;
    }
    int mid = low + (high - low) / 2;
    int pivot = Math.max(Math.min(values[low], values[mid]), Math.min(Math.max(values[low], values[mid]), values[high]));
    int i = low;
    int j = high;
    while (i <= j) {
        while (values[i] < pivot) {
            i++;
        }
        while (values[j] > pivot) {
            j--;
        }
        if (i <= j) {
            int tmp = values[i];
            values[i] = values[j];
            values[j] = tmp;
            i++;
            j--;
        }
    }
    quickSortRange(values, low, j);
    quickSortRange(values, i, high);
}`,
`// Heap push: inserts a value into a binary max-heap.
public static void heapPush(List<Integer> heap, int value) {
    heap.add(value);
    int index = heap.size() - 1;
    while (index > 0) {
        int parent = (index - 1) / 2;
        if (heap.get(parent) >= heap.get(index)) {
            break;
        }
        Collections.swap(heap, parent, index);
        index = parent;
    }
}`,
`// Heap pop: removes and returns the maximum from a binary max-heap.
public static int heapPop(List<Integer> heap) {
    if (heap.isEmpty()) {
        throw new IllegalStateException("heap is empty");
    }
    int max = heap.get(0);
    int last = heap.remove(heap.size() - 1);
    if (!heap.isEmpty()) {
        heap.set(0, last);
        int index = 0;
        while (true) {
            int left = index * 2 + 1;
            int right = left + 1;
            int largest = index;
            if (left < heap.size() && heap.get(left) > heap.get(largest)) {
                largest = left;
            }
            if (right < heap.size() && heap.get(right) > heap.get(largest)) {
                largest = right;
            }
            if (largest == index) {
                break;
            }
            Collections.swap(heap, index, largest);
            index = largest;
        }
    }
    return max;
}`,
`// Two-sum: finds indices of two values adding up to the target.
public static int[] twoSum(int[] values, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < values.length; i++) {
        int complement = target - values[i];
        if (seen.containsKey(complement)) {
            return new int[] { seen.get(complement), i };
        }
        seen.put(values[i], i);
    }
    return new int[] { -1, -1 };
}`,
`// Maximum subarray sum using Kadane's algorithm.
public static int maxSubarraySum(int[] values) {
    int best = Integer.MIN_VALUE;
    int current = 0;
    for (int value : values) {
        current = Math.max(value, current + value);
        best = Math.max(best, current);
    }
    return best;
}`,
`// Longest palindromic substring via expansion around each center.
public static String longestPalindrome(String text) {
    if (text == null || text.length() < 2) {
        return text;
    }
    String best = text.substring(0, 1);
    for (int center = 0; center < text.length(); center++) {
        best = expandPalindrome(text, center, center, best);
        best = expandPalindrome(text, center, center + 1, best);
    }
    return best;
}

private static String expandPalindrome(String text, int left, int right, String best) {
    while (left >= 0 && right < text.length() && text.charAt(left) == text.charAt(right)) {
        if (right - left + 1 > best.length()) {
            best = text.substring(left, right + 1);
        }
        left--;
        right++;
    }
    return best;
}`,
`// Validates that a binary tree satisfies the BST ordering property.
public static boolean isBinarySearchTree(TreeNode node, long min, long max) {
    if (node == null) {
        return true;
    }
    if (node.value <= min || node.value >= max) {
        return false;
    }
    return isBinarySearchTree(node.left, min, node.value)
            && isBinarySearchTree(node.right, node.value, max);
}

public static class TreeNode {
    public final long value;
    public final TreeNode left;
    public final TreeNode right;

    public TreeNode(long value, TreeNode left, TreeNode right) {
        this.value = value;
        this.left = left;
        this.right = right;
    }
}`,
`// Maximum depth of a binary tree.
public static int maxDepth(TreeNode node) {
    if (node == null) {
        return 0;
    }
    return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}`,
`// In-order traversal of a binary tree, returning node values.
public static List<Long> inorderTraversal(TreeNode node) {
    List<Long> values = new ArrayList<>();
    if (node == null) {
        return values;
    }
    values.addAll(inorderTraversal(node.left));
    values.add(node.value);
    values.addAll(inorderTraversal(node.right));
    return values;
}`,
`// Finds the minimum element in a rotated, sorted array.
public static int findMinInRotated(int[] values) {
    int low = 0;
    int high = values.length - 1;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (values[mid] > values[high]) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return values[low];
}`,
`// 0/1 knapsack: max value fitting a weight capacity (DP).
public static int knapsack(int capacity, int[] weights, int[] values) {
    int[][] dp = new int[weights.length + 1][capacity + 1];
    for (int i = 1; i <= weights.length; i++) {
        for (int w = 0; w <= capacity; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[weights.length][capacity];
}`,
`// Fibonacci with memoization (top-down dynamic programming).
public static long fibonacciMemo(int n, Map<Integer, Long> cache) {
    if (n < 2) {
        return n;
    }
    Long cached = cache.get(n);
    if (cached != null) {
        return cached;
    }
    long result = fibonacciMemo(n - 1, cache) + fibonacciMemo(n - 2, cache);
    cache.put(n, result);
    return result;
}`,
`// Counts the islands in a binary grid using depth-first flood fill.
public static int countIslands(int[][] grid) {
    int islands = 0;
    for (int row = 0; row < grid.length; row++) {
        for (int col = 0; col < grid[row].length; col++) {
            if (grid[row][col] == 1) {
                islands++;
                sinkIsland(grid, row, col);
            }
        }
    }
    return islands;
}

private static void sinkIsland(int[][] grid, int row, int col) {
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[row].length || grid[row][col] == 0) {
        return;
    }
    grid[row][col] = 0;
    sinkIsland(grid, row - 1, col);
    sinkIsland(grid, row + 1, col);
    sinkIsland(grid, row, col - 1);
    sinkIsland(grid, row, col + 1);
}`,
`// Stack-based check for balanced parentheses only (no brackets).
public static boolean balancedParentheses(String text) {
    int depth = 0;
    for (char c : text.toCharArray()) {
        if (c == '(') {
            depth++;
        } else if (c == ')') {
            depth--;
            if (depth < 0) {
                return false;
            }
        }
    }
    return depth == 0;
}`,
`// Least recently used eviction using a LinkedHashMap in access order.
public static <K, V> Map<K, V> lruCache(int capacity) {
    return new LinkedHashMap<K, V>(capacity, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > capacity;
        }
    };
}`,
`// Detect a cycle in a singly linked list with Floyd's tortoise and hare.
public static boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            return true;
        }
    }
    return false;
}

public static class ListNode {
    public final int value;
    public ListNode next;

    public ListNode(int value) {
        this.value = value;
    }
}`,
];
