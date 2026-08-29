// Java data-processing blocks — one complete method per block.
export const dataProcessing = [
`// Arithmetic mean of a list of doubles.
public static double averageOf(List<Double> values) {
    if (values.isEmpty()) {
        return 0.0;
    }
    double sum = 0;
    for (double value : values) {
        sum += value;
    }
    return sum / values.size();
}`,
`// Min-max normalization mapping values into [0, 1].
public static List<Double> normalizeValues(List<Double> values) {
    double min = Double.MAX_VALUE;
    double max = -Double.MAX_VALUE;
    for (double value : values) {
        min = Math.min(min, value);
        max = Math.max(max, value);
    }
    List<Double> normalized = new ArrayList<>();
    if (max == min) {
        for (int i = 0; i < values.size(); i++) {
            normalized.add(0.5);
        }
        return normalized;
    }
    for (double value : values) {
        normalized.add((value - min) / (max - min));
    }
    return normalized;
}`,
`// Standard score (z-score) of a value within a sample.
public static double zScore(double value, List<Double> sample) {
    double mean = averageOf(sample);
    double variance = 0;
    for (double v : sample) {
        variance += (v - mean) * (v - mean);
    }
    double stdDev = Math.sqrt(variance / sample.size());
    if (stdDev == 0) {
        return 0;
    }
    return (value - mean) / stdDev;
}`,
`// Simple moving average with a fixed window size.
public static List<Double> movingAverage(List<Double> values, int window) {
    List<Double> averages = new ArrayList<>();
    double running = 0;
    for (int i = 0; i < values.size(); i++) {
        running += values.get(i);
        if (i >= window) {
            running -= values.get(i - window);
        }
        if (i >= window - 1) {
            averages.add(running / window);
        }
    }
    return averages;
}`,
`// Splits one CSV line into fields, honoring double-quoted cells.
public static List<String> parseCsvLine(String line) {
    List<String> fields = new ArrayList<>();
    StringBuilder current = new StringBuilder();
    boolean inQuotes = false;
    for (int i = 0; i < line.length(); i++) {
        char c = line.charAt(i);
        if (inQuotes) {
            if (c == '"' && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                current.append('"');
                i++;
            } else if (c == '"') {
                inQuotes = false;
            } else {
                current.append(c);
            }
        } else if (c == '"') {
            inQuotes = true;
        } else if (c == ',') {
            fields.add(current.toString());
            current.setLength(0);
        } else {
            current.append(c);
        }
    }
    fields.add(current.toString());
    return fields;
}`,
`// Parses "key=value" pairs separated by newlines into a map.
public static Map<String, String> parseKeyValuePairs(String raw) {
    Map<String, String> pairs = new HashMap<>();
    for (String line : raw.split("\\\\n")) {
        int eq = line.indexOf('=');
        if (eq <= 0) {
            continue;
        }
        String key = line.substring(0, eq).trim();
        String value = line.substring(eq + 1).trim();
        pairs.put(key, value);
    }
    return pairs;
}`,
`// Tallies log-level keywords found in a list of log lines.
public static Map<String, Integer> summarizeLogLevels(List<String> lines) {
    Map<String, Integer> levels = new HashMap<>();
    for (String line : lines) {
        String upper = line.toUpperCase();
        for (String level : new String[] { "DEBUG", "INFO", "WARN", "ERROR" }) {
            if (upper.contains(level)) {
                levels.merge(level, 1, Integer::sum);
                break;
            }
        }
    }
    return levels;
}`,
`// Removes records that share the same id, keeping the first one.
public static List<Map<String, String>> dedupeByKey(List<Map<String, String>> rows, String key) {
    Set<String> seen = new HashSet<>();
    List<Map<String, String>> unique = new ArrayList<>();
    for (Map<String, String> row : rows) {
        if (seen.add(row.get(key))) {
            unique.add(row);
        }
    }
    return unique;
}`,
`// Sorts rows first by category, then by amount descending.
public static List<Map<String, Object>> sortByMultipleCriteria(List<Map<String, Object>> rows) {
    List<Map<String, Object>> sorted = new ArrayList<>(rows);
    sorted.sort((a, b) -> {
        int byCategory = ((String) a.get("category")).compareTo((String) b.get("category"));
        if (byCategory != 0) {
            return byCategory;
        }
        return Double.compare((Double) b.get("amount"), (Double) a.get("amount"));
    });
    return sorted;
}`,
`// Buckets a list of numbers into ranges of ten, e.g. 10s, 20s.
public static Map<Integer, List<Integer>> bucketByTens(List<Integer> values) {
    Map<Integer, List<Integer>> buckets = new TreeMap<>();
    for (int value : values) {
        int bucket = (value / 10) * 10;
        buckets.computeIfAbsent(bucket, k -> new ArrayList<>()).add(value);
    }
    return buckets;
}`,
`// Running totals: result[i] = sum of values[0..i].
public static List<Integer> cumulativeSum(List<Integer> values) {
    List<Integer> totals = new ArrayList<>(values.size());
    int running = 0;
    for (int value : values) {
        running += value;
        totals.add(running);
    }
    return totals;
}`,
`// Drops statistical outliers using the interquartile range rule.
public static List<Double> removeOutliers(List<Double> values) {
    List<Double> sorted = new ArrayList<>(values);
    Collections.sort(sorted);
    double q1 = sorted.get(sorted.size() / 4);
    double q3 = sorted.get(sorted.size() * 3 / 4);
    double iqr = q3 - q1;
    double lower = q1 - 1.5 * iqr;
    double upper = q3 + 1.5 * iqr;
    List<Double> clean = new ArrayList<>();
    for (double value : values) {
        if (value >= lower && value <= upper) {
            clean.add(value);
        }
    }
    return clean;
}`,
`// Transposes a rectangular matrix of doubles.
public static double[][] transposeMatrix(double[][] matrix) {
    int rows = matrix.length;
    int cols = matrix[0].length;
    double[][] transposed = new double[cols][rows];
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            transposed[j][i] = matrix[i][j];
        }
    }
    return transposed;
}`,
`// Dot product of two equal-length vectors.
public static double dotProduct(double[] a, double[] b) {
    if (a.length != b.length) {
        throw new IllegalArgumentException("vectors must have equal length");
    }
    double sum = 0;
    for (int i = 0; i < a.length; i++) {
        sum += a[i] * b[i];
    }
    return sum;
}`,
`// Counts how many records fall into each named category.
public static Map<String, Integer> countByCategory(List<String> categories) {
    Map<String, Integer> counts = new HashMap<>();
    for (String category : categories) {
        counts.merge(category, 1, Integer::sum);
    }
    return counts;
}`,
`// Builds display rows, formatting each field for a fixed-width table.
public static List<String> buildReportRows(List<Map<String, Object>> records, List<String> columns) {
    List<String> rows = new ArrayList<>();
    for (Map<String, Object> record : records) {
        StringBuilder row = new StringBuilder();
        for (String column : columns) {
            Object value = record.get(column);
            if (value == null) {
                row.append("N/A");
            } else if (value instanceof Double d) {
                row.append(String.format("%.2f", d));
            } else {
                row.append(value);
            }
            row.append(" | ");
        }
        rows.add(row.substring(0, row.length() - 3));
    }
    return rows;
}`,
`// Joins rows from two lists on a shared id column.
public static List<Map<String, Object>> joinOnId(
        List<Map<String, Object>> left, List<Map<String, Object>> right) {
    List<Map<String, Object>> joined = new ArrayList<>();
    for (Map<String, Object> l : left) {
        for (Map<String, Object> r : right) {
            if (l.get("id").equals(r.get("id"))) {
                Map<String, Object> merged = new HashMap<>(l);
                merged.putAll(r);
                joined.add(merged);
            }
        }
    }
    return joined;
}`,
`// Downsamples a series by keeping every nth element.
public static List<Double> downsample(List<Double> values, int step) {
    List<Double> sampled = new ArrayList<>();
    for (int i = 0; i < values.size(); i += step) {
        sampled.add(values.get(i));
    }
    return sampled;
}`,
`// Pivots a flat list of (category, status) pairs into counts per status.
public static Map<String, Map<String, Integer>> pivotStatusCounts(
        List<String> categories, List<String> statuses) {
    Map<String, Map<String, Integer>> pivot = new HashMap<>();
    for (int i = 0; i < categories.size(); i++) {
        pivot.computeIfAbsent(categories.get(i), k -> new HashMap<>())
                .merge(statuses.get(i), 1, Integer::sum);
    }
    return pivot;
}`,
`// Trims and collapses whitespace on every string field of a record.
public static Map<String, String> sanitizeRecord(Map<String, String> record) {
    Map<String, String> clean = new HashMap<>();
    for (Map.Entry<String, String> entry : record.entrySet()) {
        String value = entry.getValue();
        if (value != null) {
            value = value.trim().replaceAll("\\\\s+", " ");
        }
        clean.put(entry.getKey(), value);
    }
    return clean;
}`,
];
