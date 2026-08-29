// Java map-operation blocks — one complete method per block.
export const maps = [
`// Swaps keys and values; duplicate values collapse to the last key.
public static <K, V> Map<V, K> invertMap(Map<K, V> source) {
    Map<V, K> inverted = new HashMap<>();
    for (Map.Entry<K, V> entry : source.entrySet()) {
        inverted.put(entry.getValue(), entry.getKey());
    }
    return inverted;
}`,
`// Adds the counts from the second map into the first, mutating it.
public static Map<String, Integer> mergeCountMaps(Map<String, Integer> target, Map<String, Integer> extra) {
    for (Map.Entry<String, Integer> entry : extra.entrySet()) {
        target.merge(entry.getKey(), entry.getValue(), Integer::sum);
    }
    return target;
}`,
`// Returns the value that occurs most often across a map's values.
public static String mostFrequentValue(Map<String, String> source) {
    Map<String, Integer> counts = new HashMap<>();
    for (String value : source.values()) {
        counts.merge(value, 1, Integer::sum);
    }
    String best = null;
    int bestCount = 0;
    for (Map.Entry<String, Integer> entry : counts.entrySet()) {
        if (entry.getValue() > bestCount) {
            best = entry.getKey();
            bestCount = entry.getValue();
        }
    }
    return best;
}`,
`// Groups words by their length into a map of length -> words.
public static Map<Integer, List<String>> groupByLength(List<String> words) {
    Map<Integer, List<String>> byLength = new TreeMap<>();
    for (String word : words) {
        byLength.computeIfAbsent(word.length(), k -> new ArrayList<>()).add(word);
    }
    return byLength;
}`,
`// Returns a copy of a map sorted by value in ascending order.
public static Map<String, Integer> sortByValue(Map<String, Integer> source) {
    return source.entrySet().stream()
            .sorted(Map.Entry.comparingByValue())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                    (a, b) -> a, LinkedHashMap::new));
}`,
`// Renders a map as a list of "key=value" strings.
public static List<String> mapToPairs(Map<String, String> source) {
    List<String> pairs = new ArrayList<>();
    for (Map.Entry<String, String> entry : source.entrySet()) {
        pairs.add(entry.getKey() + "=" + entry.getValue());
    }
    return pairs;
}`,
`// Keys whose values differ between two maps, with their two values.
public static List<String> diffMapKeys(Map<String, String> before, Map<String, String> after) {
    List<String> changed = new ArrayList<>();
    Set<String> allKeys = new HashSet<>(before.keySet());
    allKeys.addAll(after.keySet());
    for (String key : allKeys) {
        if (!before.get(key).equals(after.get(key))) {
            changed.add(key);
        }
    }
    return changed;
}`,
`// Collects every key that maps to the given value.
public static <K, V> List<K> keysForValue(Map<K, V> source, V wanted) {
    List<K> keys = new ArrayList<>();
    for (Map.Entry<K, V> entry : source.entrySet()) {
        if (entry.getValue().equals(wanted)) {
            keys.add(entry.getKey());
        }
    }
    return keys;
}`,
`// Keeps only entries whose key appears in both maps.
public static Map<String, Integer> intersectMaps(Map<String, Integer> a, Map<String, Integer> b) {
    Map<String, Integer> result = new HashMap<>();
    for (Map.Entry<String, Integer> entry : a.entrySet()) {
        if (b.containsKey(entry.getKey())) {
            result.put(entry.getKey(), entry.getValue() + b.get(entry.getKey()));
        }
    }
    return result;
}`,
`// Histogram of character frequencies in a string.
public static Map<Character, Integer> charHistogram(String text) {
    Map<Character, Integer> histogram = new HashMap<>();
    for (char c : text.toCharArray()) {
        histogram.merge(c, 1, Integer::sum);
    }
    return histogram;
}`,
`// Indexes words under every prefix that starts them.
public static Map<String, List<String>> indexWordsByPrefix(List<String> words) {
    Map<String, List<String>> index = new HashMap<>();
    for (String word : words) {
        for (int len = 1; len <= Math.min(3, word.length()); len++) {
            index.computeIfAbsent(word.substring(0, len), k -> new ArrayList<>()).add(word);
        }
    }
    return index;
}`,
`// An LRU-style cache that evicts the eldest entry beyond capacity.
public static Map<String, byte[]> accessOrderCache(final int capacity) {
    return new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, byte[]> eldest) {
            return size() > capacity;
        }
    };
}`,
`// Sums integer values of a map, skipping keys with no entry.
public static int sumValuesByKey(Map<String, Integer> source, List<String> keys) {
    int total = 0;
    for (String key : keys) {
        Integer value = source.get(key);
        if (value != null) {
            total += value;
        }
    }
    return total;
}`,
`// Returns the smallest and largest (key, value) pairs by value.
public static Map.Entry<String, Integer>[] minAndMaxEntries(Map<String, Integer> source) {
    Map.Entry<String, Integer> min = null;
    Map.Entry<String, Integer> max = null;
    for (Map.Entry<String, Integer> entry : source.entrySet()) {
        if (min == null || entry.getValue() < min.getValue()) {
            min = entry;
        }
        if (max == null || entry.getValue() > max.getValue()) {
            max = entry;
        }
    }
    return new Map.Entry[] { min, max };
}`,
`// Renames a key, preserving its value and dropping the old key.
public static Map<String, Integer> renameKey(Map<String, Integer> source, String oldKey, String newKey) {
    Map<String, Integer> renamed = new HashMap<>(source);
    if (renamed.containsKey(oldKey)) {
        renamed.put(newKey, renamed.remove(oldKey));
    }
    return renamed;
}`,
`// Splits a map into two buckets based on a value threshold.
public static void splitByThreshold(Map<String, Integer> source, int threshold,
        Map<String, Integer> below, Map<String, Integer> atOrAbove) {
    for (Map.Entry<String, Integer> entry : source.entrySet()) {
        if (entry.getValue() < threshold) {
            below.put(entry.getKey(), entry.getValue());
        } else {
            atOrAbove.put(entry.getKey(), entry.getValue());
        }
    }
}`,
`// Word-frequency map for a body of text, case-insensitive.
public static Map<String, Integer> wordFrequencies(String text) {
    Map<String, Integer> counts = new HashMap<>();
    for (String word : text.toLowerCase().split("[^a-z']+")) {
        if (!word.isEmpty()) {
            counts.merge(word, 1, Integer::sum);
        }
    }
    return counts;
}`,
`// Builds an index of category -> list of names in that category.
public static Map<String, List<String>> buildCategoryIndex(List<String> names, List<String> categories) {
    Map<String, List<String>> index = new HashMap<>();
    for (int i = 0; i < names.size(); i++) {
        index.computeIfAbsent(categories.get(i), k -> new ArrayList<>()).add(names.get(i));
    }
    return index;
}`,
`// Top n entries by value, as a list of entries in descending order.
public static List<Map.Entry<String, Integer>> topNByValue(Map<String, Integer> source, int n) {
    return source.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(n)
            .collect(Collectors.toList());
}`,
`// Transforms every value with a function, returning a new map.
public static Map<String, Integer> transformValues(Map<String, Integer> source, java.util.function.UnaryOperator<Integer> fn) {
    Map<String, Integer> transformed = new HashMap<>();
    for (Map.Entry<String, Integer> entry : source.entrySet()) {
        transformed.put(entry.getKey(), fn.apply(entry.getValue()));
    }
    return transformed;
}`,
];
