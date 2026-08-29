// Java text-processing blocks — one complete method per block.
export const textProcessing = [
`// Splits text into words, discarding punctuation and empty tokens.
public static List<String> tokenize(String text) {
    List<String> tokens = new ArrayList<>();
    for (String token : text.split("[^a-zA-Z0-9']+")) {
        if (!token.isEmpty()) {
            tokens.add(token);
        }
    }
    return tokens;
}`,
`// Sentence case: first letter of the string capitalized.
public static String sentenceCase(String text) {
    if (text == null || text.isEmpty()) {
        return text;
    }
    return Character.toUpperCase(text.charAt(0)) + text.substring(1);
}`,
`// Counts words in a string, treating any run of spaces as a break.
public static int wordCount(String text) {
    if (text == null || text.isBlank()) {
        return 0;
    }
    return text.trim().split("\\\\s+").length;
}`,
`// Extracts all numbers (including decimals) from a string.
public static List<Double> extractNumbers(String text) {
    List<Double> numbers = new ArrayList<>();
    Matcher matcher = Pattern.compile("-?\\\\d+(\\\\.\\\\d+)?").matcher(text);
    while (matcher.find()) {
        numbers.add(Double.parseDouble(matcher.group()));
    }
    return numbers;
}`,
`// Splits a camelCase string into words: "parseUrl" -> "parse Url".
public static List<String> splitCamelCase(String camel) {
    List<String> words = new ArrayList<>();
    StringBuilder current = new StringBuilder();
    for (char c : camel.toCharArray()) {
        if (Character.isUpperCase(c) && current.length() > 0) {
            words.add(current.toString());
            current.setLength(0);
        }
        current.append(c);
    }
    if (current.length() > 0) {
        words.add(current.toString());
    }
    return words;
}`,
`// Replaces every occurrence of a word boundary-insensitively.
public static String replaceWord(String text, String from, String to) {
    return text.replaceAll("\\\\b" + Pattern.quote(from) + "\\\\b", to);
}`,
`// Indents every line of a block by a fixed number of spaces.
public static String indent(String text, int spaces) {
    String prefix = " ".repeat(spaces);
    StringBuilder out = new StringBuilder();
    for (String line : text.split("\\\\n", -1)) {
        out.append(prefix).append(line).append('\\n');
    }
    return out.substring(0, out.length() - 1);
}`,
`// Trims whitespace and normalizes inner whitespace to single spaces.
public static String normalizeWhitespace(String text) {
    return text == null ? "" : text.trim().replaceAll("\\\\s+", " ");
}`,
`// Reads a paragraph into sentences, splitting on terminal punctuation.
public static List<String> splitSentences(String paragraph) {
    List<String> sentences = new ArrayList<>();
    for (String part : paragraph.split("(?<=[.!?])\\\\s+")) {
        if (!part.trim().isEmpty()) {
            sentences.add(part.trim());
        }
    }
    return sentences;
}`,
`// Removes every non-alphanumeric character from a string.
public static String keepAlphanumeric(String text) {
    return text.replaceAll("[^a-zA-Z0-9]", "");
}`,
`// Counts vowels in a string, case-insensitively.
public static int countVowels(String text) {
    int count = 0;
    for (char c : text.toLowerCase().toCharArray()) {
        if ("aeiou".indexOf(c) >= 0) {
            count++;
        }
    }
    return count;
}`,
`// Transforms text into alternating case: "hello" -> "hElLo".
public static String alternatingCase(String text) {
    StringBuilder out = new StringBuilder(text.length());
    boolean upper = false;
    for (char c : text.toCharArray()) {
        if (Character.isLetter(c)) {
            out.append(upper ? Character.toUpperCase(c) : Character.toLowerCase(c));
            upper = !upper;
        } else {
            out.append(c);
        }
    }
    return out.toString();
}`,
`// Removes leading and trailing punctuation from a phrase.
public static String stripOuterPunctuation(String phrase) {
    return phrase.replaceAll("^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$", "");
}`,
`// Splits a string on commas, trimming each field.
public static List<String> splitTrimmed(String text, char delimiter) {
    List<String> parts = new ArrayList<>();
    for (String part : text.split(String.valueOf(delimiter))) {
        parts.add(part.trim());
    }
    return parts;
}`,
`// True when every line of text is indented with at least minSpaces.
public static boolean uniformlyIndented(String text, int minSpaces) {
    String prefix = " ".repeat(minSpaces);
    for (String line : text.split("\\\\n")) {
        if (!line.isEmpty() && !line.startsWith(prefix)) {
            return false;
        }
    }
    return true;
}`,
`// Pads a multi-line block so every line is at least width long.
public static String padLinesToWidth(String text, int width) {
    StringBuilder out = new StringBuilder();
    for (String line : text.split("\\\\n")) {
        if (line.length() < width) {
            line = line + " ".repeat(width - line.length());
        }
        out.append(line).append('\\n');
    }
    return out.substring(0, out.length() - 1);
}`,
`// Extracts the first sentence of a text, capped at maxChars.
public static String firstSentence(String text, int maxChars) {
    String first = text.split("(?<=[.!?])\\\\s+")[0];
    if (first.length() > maxChars) {
        return first.substring(0, maxChars - 1) + "…";
    }
    return first;
}`,
`// Converts spaces to underscores and lowercases: "My File" -> "my_file".
public static String toSnakeCase(String text) {
    String withUnderscores = text.trim().replaceAll("\\\\s+", "_");
    return withUnderscores.toLowerCase();
}`,
`// Returns the substring between two markers, or empty when missing.
public static String between(String text, String start, String end) {
    int begin = text.indexOf(start);
    if (begin < 0) {
        return "";
    }
    begin += start.length();
    int finish = text.indexOf(end, begin);
    if (finish < 0) {
        return text.substring(begin);
    }
    return text.substring(begin, finish);
}`,
`// Converts plain text into a one-line summary of the first words.
public static String excerpt(String text, int wordLimit) {
    String[] words = text.trim().split("\\\\s+");
    StringBuilder out = new StringBuilder();
    for (int i = 0; i < Math.min(wordLimit, words.length); i++) {
        if (i > 0) {
            out.append(' ');
        }
        out.append(words[i]);
    }
    return out.toString() + (words.length > wordLimit ? "…" : "");
}`,
];
