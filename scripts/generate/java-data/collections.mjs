// Java collection-operation blocks — one complete method per block.
export const collections = [
`// Merges two already-sorted lists into one sorted list.
public static List<Integer> mergeSortedLists(List<Integer> a, List<Integer> b) {
    List<Integer> merged = new ArrayList<>(a.size() + b.size());
    int i = 0;
    int j = 0;
    while (i < a.size() && j < b.size()) {
        if (a.get(i) <= b.get(j)) {
            merged.add(a.get(i++));
        } else {
            merged.add(b.get(j++));
        }
    }
    while (i < a.size()) {
        merged.add(a.get(i++));
    }
    while (j < b.size()) {
        merged.add(b.get(j++));
    }
    return merged;
}`,
`// Reverses a list in place and returns it for chaining.
public static <T> List<T> reverseList(List<T> list) {
    int left = 0;
    int right = list.size() - 1;
    while (left < right) {
        T tmp = list.get(left);
        list.set(left, list.get(right));
        list.set(right, tmp);
        left++;
        right--;
    }
    return list;
}`,
`// Rotates a list to the left by k positions, wrapping around.
public static <T> void rotateList(List<T> list, int k) {
    int size = list.size();
    if (size < 2) {
        return;
    }
    int shift = Math.floorMod(k, size);
    List<T> rotated = new ArrayList<>(size);
    for (int i = 0; i < size; i++) {
        rotated.add(list.get((i + shift) % size));
    }
    list.clear();
    list.addAll(rotated);
}`,
`// Removes duplicate elements while keeping first-occurrence order.
public static <T> List<T> dedupePreservingOrder(List<T> items) {
    Set<T> seen = new LinkedHashSet<>(items);
    return new ArrayList<>(seen);
}`,
`// Builds a map from each element to how often it appears.
public static <T> Map<T, Integer> frequencyMap(List<T> items) {
    Map<T, Integer> frequencies = new HashMap<>();
    for (T item : items) {
        frequencies.merge(item, 1, Integer::sum);
    }
    return frequencies;
}`,
`// Splits a list into evens and odds, preserving relative order.
public static void partitionEvenOdd(List<Integer> numbers, List<Integer> evens, List<Integer> odds) {
    for (int n : numbers) {
        if (n % 2 == 0) {
            evens.add(n);
        } else {
            odds.add(n);
        }
    }
}`,
`// Intersection of two lists, keeping elements that appear in both.
public static <T> List<T> intersectLists(List<T> first, List<T> second) {
    Set<T> secondSet = new HashSet<>(second);
    List<T> result = new ArrayList<>();
    for (T item : first) {
        if (secondSet.contains(item)) {
            result.add(item);
        }
    }
    return result;
}`,
`// Union of two lists without duplicates, preserving first-list order.
public static <T> List<T> unionLists(List<T> first, List<T> second) {
    Set<T> seen = new LinkedHashSet<>(first);
    seen.addAll(second);
    return new ArrayList<>(seen);
}`,
`// Chops a list into fixed-size sublists; the last chunk may be smaller.
public static <T> List<List<T>> chunkList(List<T> items, int chunkSize) {
    if (chunkSize <= 0) {
        throw new IllegalArgumentException("chunkSize must be positive");
    }
    List<List<T>> chunks = new ArrayList<>();
    for (int i = 0; i < items.size(); i += chunkSize) {
        chunks.add(new ArrayList<>(items.subList(i, Math.min(i + chunkSize, items.size()))));
    }
    return chunks;
}`,
`// Flattens a nested list structure one level at a time, recursively.
public static List<Object> flattenNested(List<?> nested) {
    List<Object> flat = new ArrayList<>();
    for (Object item : nested) {
        if (item instanceof List<?> sublist) {
            flat.addAll(flattenNested(sublist));
        } else {
            flat.add(item);
        }
    }
    return flat;
}`,
`// Returns the k most frequent elements in order of descending count.
public static List<String> topKFrequent(List<String> words, int k) {
    Map<String, Integer> counts = new HashMap<>();
    for (String word : words) {
        counts.merge(word, 1, Integer::sum);
    }
    return counts.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(k)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
}`,
`// Checks whether a list is sorted in non-decreasing order.
public static boolean isSorted(List<Integer> values) {
    for (int i = 1; i < values.size(); i++) {
        if (values.get(i) < values.get(i - 1)) {
            return false;
        }
    }
    return true;
}`,
`// Median of a list, computed without modifying the caller's list.
public static double medianOf(List<Double> values) {
    if (values.isEmpty()) {
        throw new IllegalArgumentException("values must not be empty");
    }
    List<Double> sorted = new ArrayList<>(values);
    Collections.sort(sorted);
    int mid = sorted.size() / 2;
    if (sorted.size() % 2 == 1) {
        return sorted.get(mid);
    }
    return (sorted.get(mid - 1) + sorted.get(mid)) / 2.0;
}`,
`// Pairs up two lists into a list of two-element lists.
public static <A, B> List<List<Object>> zipLists(List<A> left, List<B> right) {
    int size = Math.min(left.size(), right.size());
    List<List<Object>> pairs = new ArrayList<>(size);
    for (int i = 0; i < size; i++) {
        pairs.add(Arrays.asList(left.get(i), right.get(i)));
    }
    return pairs;
}`,
`// Removes runs of consecutive equal elements, keeping one of each.
public static <T> List<T> removeAdjacentDuplicates(List<T> items) {
    List<T> result = new ArrayList<>();
    for (T item : items) {
        if (result.isEmpty() || !result.get(result.size() - 1).equals(item)) {
            result.add(item);
        }
    }
    return result;
}`,
`// Length of the longest strictly increasing subsequence (DP).
public static int longestIncreasingSubsequence(List<Integer> values) {
    if (values.isEmpty()) {
        return 0;
    }
    int[] dp = new int[values.size()];
    int best = 1;
    for (int i = 0; i < values.size(); i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++) {
            if (values.get(j) < values.get(i)) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        best = Math.max(best, dp[i]);
    }
    return best;
}`,
`// Swaps adjacent pairs: [1,2,3,4] becomes [2,1,4,3].
public static <T> List<T> swapAdjacentPairs(List<T> items) {
    List<T> swapped = new ArrayList<>(items);
    for (int i = 0; i + 1 < swapped.size(); i += 2) {
        T tmp = swapped.get(i);
        swapped.set(i, swapped.get(i + 1));
        swapped.set(i + 1, tmp);
    }
    return swapped;
}`,
`// Groups words by their first letter.
public static Map<Character, List<String>> groupByFirstLetter(List<String> words) {
    Map<Character, List<String>> grouped = new TreeMap<>();
    for (String word : words) {
        char key = Character.toLowerCase(word.charAt(0));
        grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(word);
    }
    return grouped;
}`,
`// Finds the one number missing from a sequence 0..n.
public static int findMissingNumber(int[] values) {
    int n = values.length;
    long expected = (long) n * (n + 1) / 2;
    long actual = 0;
    for (int value : values) {
        actual += value;
    }
    return (int) (expected - actual);
}`,
`// Counts negative, zero, and positive entries in one pass.
public static int[] signCounts(List<Integer> values) {
    int negatives = 0;
    int zeros = 0;
    int positives = 0;
    for (int value : values) {
        if (value < 0) {
            negatives++;
        } else if (value == 0) {
            zeros++;
        } else {
            positives++;
        }
    }
    return new int[] { negatives, zeros, positives };
}`,
];
