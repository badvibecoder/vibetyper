// Java string-utility blocks — one complete method per block.
export const strings = [
`// Reverses a string using a StringBuilder.
public static String reverse(String input) {
    if (input == null || input.length() < 2) {
        return input;
    }
    return new StringBuilder(input).reverse().toString();
}`,
`// Checks whether text reads the same forwards and backwards,
// ignoring case and every character that is not a letter or digit.
public static boolean isPalindrome(String text) {
    String cleaned = text.toLowerCase().replaceAll("[^a-z0-9]", "");
    int left = 0;
    int right = cleaned.length() - 1;
    while (left < right) {
        if (cleaned.charAt(left) != cleaned.charAt(right)) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
`// Counts how many times a substring appears, without overlapping.
public static int countOccurrences(String text, String needle) {
    if (text == null || needle == null || needle.isEmpty()) {
        return 0;
    }
    int count = 0;
    int index = 0;
    while ((index = text.indexOf(needle, index)) != -1) {
        count++;
        index += needle.length();
    }
    return count;
}`,
`// Returns the first character that appears only once, or '\\0' if none.
public static char firstNonRepeatingChar(String text) {
    Map<Character, Integer> counts = new LinkedHashMap<>();
    for (char c : text.toCharArray()) {
        counts.merge(c, 1, Integer::sum);
    }
    for (Map.Entry<Character, Integer> entry : counts.entrySet()) {
        if (entry.getValue() == 1) {
            return entry.getKey();
        }
    }
    return '\\0';
}`,
`// Shortens a string to maxLen characters, appending "..." when it was cut.
public static String truncate(String text, int maxLen) {
    if (text == null || text.length() <= maxLen) {
        return text;
    }
    if (maxLen <= 3) {
        return text.substring(0, maxLen);
    }
    return text.substring(0, maxLen - 3) + "...";
}`,
`// Converts any phrase into a URL-safe kebab-case slug.
public static String slugify(String phrase) {
    if (phrase == null) {
        return "";
    }
    String lower = phrase.toLowerCase().trim();
    String cleaned = lower.replaceAll("[^a-z0-9]+", "-");
    return cleaned.replaceAll("(^-+|-+$)", "");
}`,
`// Converts snake_case identifiers into camelCase.
public static String snakeToCamel(String snake) {
    StringBuilder out = new StringBuilder();
    boolean upperNext = false;
    for (char c : snake.toCharArray()) {
        if (c == '_') {
            upperNext = true;
        } else if (upperNext) {
            out.append(Character.toUpperCase(c));
            upperNext = false;
        } else {
            out.append(c);
        }
    }
    return out.toString();
}`,
`// Computes the edit distance between two strings using a rolling row
// of the classic dynamic-programming table.
public static int levenshtein(String a, String b) {
    int[] prev = new int[b.length() + 1];
    for (int j = 0; j <= b.length(); j++) {
        prev[j] = j;
    }
    for (int i = 1; i <= a.length(); i++) {
        int[] curr = new int[b.length() + 1];
        curr[0] = i;
        for (int j = 1; j <= b.length(); j++) {
            int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
            curr[j] = Math.min(Math.min(curr[j - 1] + 1, prev[j] + 1), prev[j - 1] + cost);
        }
        prev = curr;
    }
    return prev[b.length()];
}`,
`// Finds the most frequently occurring word, breaking ties by first appearance.
public static String mostCommonWord(String text) {
    String[] words = text.toLowerCase().split("[^a-z']+");
    Map<String, Integer> counts = new LinkedHashMap<>();
    for (String word : words) {
        if (!word.isEmpty()) {
            counts.merge(word, 1, Integer::sum);
        }
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
`// Removes duplicate characters while keeping the order of first occurrence.
public static String removeDuplicates(String input) {
    StringBuilder kept = new StringBuilder();
    Set<Character> seen = new HashSet<>();
    for (char c : input.toCharArray()) {
        if (seen.add(c)) {
            kept.append(c);
        }
    }
    return kept.toString();
}`,
`// Returns true when two words share the same letter histogram.
public static boolean isAnagram(String first, String second) {
    int[] counts = new int[26];
    for (char c : first.toLowerCase().toCharArray()) {
        if (Character.isLetter(c)) {
            counts[c - 'a']++;
        }
    }
    for (char c : second.toLowerCase().toCharArray()) {
        if (Character.isLetter(c)) {
            counts[c - 'a']--;
        }
    }
    for (int count : counts) {
        if (count != 0) {
            return false;
        }
    }
    return true;
}`,
`// Returns the longest prefix shared by every word in the list.
public static String longestCommonPrefix(List<String> words) {
    if (words == null || words.isEmpty()) {
        return "";
    }
    String prefix = words.get(0);
    for (int i = 1; i < words.size() && !prefix.isEmpty(); i++) {
        String word = words.get(i);
        int j = 0;
        while (j < prefix.length() && j < word.length() && prefix.charAt(j) == word.charAt(j)) {
            j++;
        }
        prefix = prefix.substring(0, j);
    }
    return prefix;
}`,
`// Applies a simple ROT13 cipher, leaving digits and punctuation untouched.
public static String rotate13(String input) {
    StringBuilder out = new StringBuilder(input.length());
    for (char c : input.toCharArray()) {
        if (c >= 'a' && c <= 'z') {
            out.append((char) ('a' + (c - 'a' + 13) % 26));
        } else if (c >= 'A' && c <= 'Z') {
            out.append((char) ('A' + (c - 'A' + 13) % 26));
        } else {
            out.append(c);
        }
    }
    return out.toString();
}`,
`// Masks a card number, keeping only the last four digits visible.
public static String maskCardNumber(String cardNumber) {
    String digits = cardNumber.replaceAll("\\D", "");
    if (digits.length() < 8) {
        return cardNumber;
    }
    StringBuilder masked = new StringBuilder("**** ");
    for (int i = 0; i < digits.length() - 8; i++) {
        masked.append('*');
    }
    return masked.append(" ").append(digits.substring(digits.length() - 4)).toString();
}`,
`// Capitalizes the first letter of every word, preserving the rest as-is.
public static String toTitleCase(String sentence) {
    StringBuilder out = new StringBuilder(sentence.length());
    boolean atWordStart = true;
    for (char c : sentence.toCharArray()) {
        if (Character.isWhitespace(c) || c == '-' || c == '_') {
            atWordStart = true;
            out.append(c);
        } else if (atWordStart) {
            out.append(Character.toUpperCase(c));
            atWordStart = false;
        } else {
            out.append(c);
        }
    }
    return out.toString();
}`,
`// Pulls every email address out of a blob of text.
public static List<String> extractEmails(String text) {
    Pattern pattern = Pattern.compile("[a-z0-9._%+-]+@[a-z0-9.-]+\\\\.[a-z]{2,}");
    Matcher matcher = pattern.matcher(text.toLowerCase());
    List<String> emails = new ArrayList<>();
    while (matcher.find()) {
        emails.add(matcher.group());
    }
    return emails;
}`,
`// Run-length encodes a string, e.g. "aaabbc" becomes "a3b2c1".
public static String runLengthEncode(String input) {
    if (input == null || input.isEmpty()) {
        return input;
    }
    StringBuilder encoded = new StringBuilder();
    int run = 1;
    for (int i = 1; i < input.length(); i++) {
        if (input.charAt(i) == input.charAt(i - 1)) {
            run++;
        } else {
            encoded.append(input.charAt(i - 1)).append(run);
            run = 1;
        }
    }
    return encoded.append(input.charAt(input.length() - 1)).append(run).toString();
}`,
`// Wraps text so no line exceeds width characters, breaking at spaces.
public static List<String> wrapText(String text, int width) {
    List<String> lines = new ArrayList<>();
    for (String word : text.split("\\\\s+")) {
        if (lines.isEmpty() || lines.get(lines.size() - 1).length() + word.length() + 1 > width) {
            lines.add(word);
        } else {
            int last = lines.size() - 1;
            lines.set(last, lines.get(last) + " " + word);
        }
    }
    return lines;
}`,
`// Removes HTML tags from a fragment, collapsing runs of whitespace.
public static String stripHtml(String html) {
    if (html == null) {
        return null;
    }
    String noTags = html.replaceAll("<[^>]*>", " ");
    return noTags.replaceAll("\\\\s+", " ").trim();
}`,
`// Returns the longest word in a sentence, ignoring punctuation.
public static String findLongestWord(String sentence) {
    String longest = "";
    for (String word : sentence.split("[^a-zA-Z]+")) {
        if (word.length() > longest.length()) {
            longest = word;
        }
    }
    return longest;
}`,
];
