// Java algorithm blocks — one complete method per block.
export const algorithms = [
`// Recursive binary search over a sorted range.
public static int binarySearchRecursive(int[] sorted, int target, int low, int high) {
    if (low > high) {
        return -1;
    }
    int mid = low + (high - low) / 2;
    if (sorted[mid] == target) {
        return mid;
    }
    if (sorted[mid] < target) {
        return binarySearchRecursive(sorted, target, mid + 1, high);
    }
    return binarySearchRecursive(sorted, target, low, mid - 1);
}`,
`// Linear search returning the first matching index or -1.
public static int linearSearch(int[] values, int target) {
    for (int i = 0; i < values.length; i++) {
        if (values[i] == target) {
            return i;
        }
    }
    return -1;
}`,
`// Counting sort for non-negative integers in a small range.
public static void countingSort(int[] values, int maxValue) {
    int[] counts = new int[maxValue + 1];
    for (int value : values) {
        counts[value]++;
    }
    int index = 0;
    for (int i = 0; i <= maxValue; i++) {
        while (counts[i] > 0) {
            values[index++] = i;
            counts[i]--;
        }
    }
}`,
`// Quickselect: the kth smallest value (0-indexed), average O(n).
public static int quickSelect(int[] values, int k) {
    int low = 0;
    int high = values.length - 1;
    while (low <= high) {
        int pivotIndex = partition(values, low, high);
        if (pivotIndex == k) {
            return values[pivotIndex];
        }
        if (pivotIndex < k) {
            low = pivotIndex + 1;
        } else {
            high = pivotIndex - 1;
        }
    }
    throw new IllegalArgumentException("k out of range");
}

private static int partition(int[] values, int low, int high) {
    int pivot = values[high];
    int store = low;
    for (int i = low; i < high; i++) {
        if (values[i] < pivot) {
            int tmp = values[i];
            values[i] = values[store];
            values[store] = tmp;
            store++;
        }
    }
    values[high] = values[store];
    values[store] = pivot;
    return store;
}`,
`// Fast exponentiation by squaring, with overflow checks left to caller.
public static long power(long base, int exponent) {
    if (exponent == 0) {
        return 1;
    }
    long half = power(base, exponent / 2);
    long result = half * half;
    if (exponent % 2 == 1) {
        result *= base;
    }
    return result;
}`,
`// Records the moves of the Tower of Hanoi puzzle.
public static List<String> towerOfHanoi(int disks, char from, char to, char via) {
    List<String> moves = new ArrayList<>();
    if (disks == 1) {
        moves.add(from + " -> " + to);
        return moves;
    }
    moves.addAll(towerOfHanoi(disks - 1, from, via, to));
    moves.add(from + " -> " + to);
    moves.addAll(towerOfHanoi(disks - 1, via, to, from));
    return moves;
}`,
`// All permutations of a string via backtracking.
public static List<String> generatePermutations(String input) {
    List<String> results = new ArrayList<>();
    permute(input.toCharArray(), 0, results);
    return results;
}

private static void permute(char[] chars, int start, List<String> results) {
    if (start == chars.length) {
        results.add(new String(chars));
        return;
    }
    for (int i = start; i < chars.length; i++) {
        swap(chars, start, i);
        permute(chars, start + 1, results);
        swap(chars, start, i);
    }
}

private static void swap(char[] chars, int a, int b) {
    char tmp = chars[a];
    chars[a] = chars[b];
    chars[b] = tmp;
}`,
`// Every subset of a set, enumerated with bit masks.
public static List<List<Integer>> generateSubsets(List<Integer> set) {
    List<List<Integer>> subsets = new ArrayList<>();
    int n = set.size();
    for (int mask = 0; mask < (1 << n); mask++) {
        List<Integer> subset = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if ((mask & (1 << i)) != 0) {
                subset.add(set.get(i));
            }
        }
        subsets.add(subset);
    }
    return subsets;
}`,
`// Greedy coin change using the largest denominations first.
public static List<Integer> coinChangeGreedy(int amount, int[] coins) {
    int[] sorted = coins.clone();
    Arrays.sort(sorted);
    List<Integer> change = new ArrayList<>();
    for (int i = sorted.length - 1; i >= 0; i--) {
        while (amount >= sorted[i]) {
            amount -= sorted[i];
            change.add(sorted[i]);
        }
    }
    return amount == 0 ? change : Collections.emptyList();
}`,
`// Minimum number of coins to make an amount (dynamic programming).
public static int minCoinsForAmount(int amount, int[] coins) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int coin : coins) {
            if (coin <= a && dp[a - coin] != Integer.MAX_VALUE) {
                dp[a] = Math.min(dp[a], dp[a - coin] + 1);
            }
        }
    }
    return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
}`,
`// Length of the longest common subsequence of two strings.
public static int longestCommonSubsequence(String a, String b) {
    int[][] dp = new int[a.length() + 1][b.length() + 1];
    for (int i = 1; i <= a.length(); i++) {
        for (int j = 1; j <= b.length(); j++) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[a.length()][b.length()];
}`,
`// True when every character of a appears in b, in order.
public static boolean isSubsequence(String a, String b) {
    int i = 0;
    for (int j = 0; j < b.length() && i < a.length(); j++) {
        if (a.charAt(i) == b.charAt(j)) {
            i++;
        }
    }
    return i == a.length();
}`,
`// Number of inversions in an array, counted during a merge sort.
public static long countInversions(int[] values) {
    return countInversionsRange(values, new int[values.length], 0, values.length - 1);
}

private static long countInversionsRange(int[] values, int[] aux, int low, int high) {
    if (low >= high) {
        return 0;
    }
    int mid = low + (high - low) / 2;
    long count = countInversionsRange(values, aux, low, mid)
            + countInversionsRange(values, aux, mid + 1, high);
    System.arraycopy(values, low, aux, low, high - low + 1);
    int i = low;
    int j = mid + 1;
    int k = low;
    while (i <= mid && j <= high) {
        if (aux[i] <= aux[j]) {
            values[k++] = aux[i++];
        } else {
            values[k++] = aux[j++];
            count += mid - i + 1;
        }
    }
    while (i <= mid) {
        values[k++] = aux[i++];
    }
    while (j <= high) {
        values[k++] = aux[j++];
    }
    return count;
}`,
`// Rotates a square matrix 90 degrees clockwise in place.
public static void rotateMatrix90(int[][] matrix) {
    int n = matrix.length;
    for (int layer = 0; layer < n / 2; layer++) {
        for (int i = layer; i < n - 1 - layer; i++) {
            int tmp = matrix[layer][i];
            matrix[layer][i] = matrix[n - 1 - i][layer];
            matrix[n - 1 - i][layer] = matrix[n - 1 - layer][n - 1 - i];
            matrix[n - 1 - layer][n - 1 - i] = matrix[i][n - 1 - layer];
            matrix[i][n - 1 - layer] = tmp;
        }
    }
}`,
`// Finds the duplicated value when integers 1..n share one slot.
public static int findDuplicate(int[] values) {
    int slow = values[0];
    int fast = values[0];
    do {
        slow = values[slow];
        fast = values[values[fast]];
    } while (slow != fast);
    slow = values[0];
    while (slow != fast) {
        slow = values[slow];
        fast = values[fast];
    }
    return slow;
}`,
`// The nth prime number, found by trial division.
public static long nthPrime(int n) {
    if (n < 1) {
        throw new IllegalArgumentException("n must be positive");
    }
    int count = 0;
    long candidate = 2;
    while (count < n) {
        if (isPrime(candidate)) {
            count++;
        }
        candidate++;
    }
    return candidate - 1;
}`,
`// Number of set bits (population count) in an integer.
public static int hammingWeight(int value) {
    int count = 0;
    while (value != 0) {
        value &= value - 1;
        count++;
    }
    return count;
}`,
`// Rearranges an array into its next lexicographic permutation.
public static boolean nextPermutation(int[] values) {
    int i = values.length - 2;
    while (i >= 0 && values[i] >= values[i + 1]) {
        i--;
    }
    if (i < 0) {
        return false;
    }
    int j = values.length - 1;
    while (values[j] <= values[i]) {
        j--;
    }
    int tmp = values[i];
    values[i] = values[j];
    values[j] = tmp;
    int left = i + 1;
    int right = values.length - 1;
    while (left < right) {
        int t = values[left];
        values[left] = values[right];
        values[right] = t;
        left++;
        right--;
    }
    return true;
}`,
`// Longest run of zeros between two ones in the binary form of n.
public static int binaryGap(int n) {
    int best = 0;
    int current = 0;
    boolean seenOne = false;
    while (n > 0) {
        if ((n & 1) == 1) {
            if (seenOne) {
                best = Math.max(best, current);
            }
            seenOne = true;
            current = 0;
        } else if (seenOne) {
            current++;
        }
        n >>= 1;
    }
    return best;
}`,
`// Maximum number of intervals overlapping at any moment.
public static int maxConcurrentIntervals(int[] starts, int[] ends) {
    Arrays.sort(starts);
    Arrays.sort(ends);
    int i = 0;
    int j = 0;
    int active = 0;
    int max = 0;
    while (i < starts.length) {
        if (starts[i] < ends[j]) {
            active++;
            max = Math.max(max, active);
            i++;
        } else {
            active--;
            j++;
        }
    }
    return max;
}`,
];
