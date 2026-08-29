// Reverses a string by swapping characters from both ends.
public static string Reverse(string input)
{
    if (string.IsNullOrEmpty(input) || input.Length < 2)
    {
        return input;
    }
    char[] chars = input.ToCharArray();
    Array.Reverse(chars);
    return new string(chars);
}

// Checks whether text reads the same backwards, ignoring case and
// every character that is not a letter or digit.
public static bool IsPalindrome(string text)
{
    string cleaned = new string(text.Where(char.IsLetterOrDigit).ToArray()).ToLower();
    int left = 0;
    int right = cleaned.Length - 1;
    while (left < right)
    {
        if (cleaned[left] != cleaned[right])
        {
            return false;
        }
        left++;
        right--;
    }
    return true;
}

// Counts non-overlapping occurrences of a substring.
public static int CountOccurrences(string text, string needle)
{
    if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(needle))
    {
        return 0;
    }
    int count = 0;
    int index = 0;
    while ((index = text.IndexOf(needle, index, StringComparison.Ordinal)) != -1)
    {
        count++;
        index += needle.Length;
    }
    return count;
}

// Returns the first character that appears exactly once, or '\0'.
public static char FirstNonRepeatingChar(string text)
{
    var counts = new Dictionary<char, int>();
    foreach (char c in text)
    {
        counts[c] = counts.GetValueOrDefault(c) + 1;
    }
    foreach (char c in text)
    {
        if (counts[c] == 1)
        {
            return c;
        }
    }
    return '\0';
}

// Shortens text to maxLen characters, appending an ellipsis when cut.
public static string Truncate(string text, int maxLen)
{
    if (string.IsNullOrEmpty(text) || text.Length <= maxLen)
    {
        return text;
    }
    if (maxLen <= 3)
    {
        return text[..maxLen];
    }
    return text[..(maxLen - 3)] + "...";
}

// Converts any phrase into a URL-safe kebab-case slug.
public static string Slugify(string phrase)
{
    if (string.IsNullOrWhiteSpace(phrase))
    {
        return "";
    }
    string lower = phrase.ToLowerInvariant().Trim();
    string cleaned = System.Text.RegularExpressions.Regex.Replace(lower, "[^a-z0-9]+", "-");
    return cleaned.Trim('-');
}

// Converts snake_case identifiers into camelCase.
public static string SnakeToCamel(string snake)
{
    var builder = new System.Text.StringBuilder();
    bool upperNext = false;
    foreach (char c in snake)
    {
        if (c == '_')
        {
            upperNext = true;
        }
        else if (upperNext)
        {
            builder.Append(char.ToUpperInvariant(c));
            upperNext = false;
        }
        else
        {
            builder.Append(c);
        }
    }
    return builder.ToString();
}

// Edit distance between two strings using a rolling DP row.
public static int Levenshtein(string a, string b)
{
    int[] previous = Enumerable.Range(0, b.Length + 1).ToArray();
    for (int i = 1; i <= a.Length; i++)
    {
        int[] current = new int[b.Length + 1];
        current[0] = i;
        for (int j = 1; j <= b.Length; j++)
        {
            int cost = a[i - 1] == b[j - 1] ? 0 : 1;
            current[j] = Math.Min(Math.Min(current[j - 1] + 1, previous[j] + 1), previous[j - 1] + cost);
        }
        previous = current;
    }
    return previous[b.Length];
}

// Finds the most frequent word, breaking ties by first appearance.
public static string MostCommonWord(string text)
{
    return text.ToLowerInvariant()
        .Split(' ', StringSplitOptions.RemoveEmptyEntries)
        .Select(w => new string(w.Where(char.IsLetter).ToArray()))
        .Where(w => w.Length > 0)
        .GroupBy(w => w)
        .OrderByDescending(g => g.Count())
        .ThenBy(g => Array.IndexOf(text.Split(' '), g.Key))
        .First()
        .Key;
}

// Removes duplicate characters, keeping first-occurrence order.
public static string RemoveDuplicates(string input)
{
    var seen = new HashSet<char>();
    var kept = new System.Text.StringBuilder();
    foreach (char c in input)
    {
        if (seen.Add(c))
        {
            kept.Append(c);
        }
    }
    return kept.ToString();
}

// True when two phrases share the same letter histogram.
public static bool IsAnagram(string first, string second)
{
    string a = new string(first.Where(char.IsLetter).ToArray()).ToLowerInvariant();
    string b = new string(second.Where(char.IsLetter).ToArray()).ToLowerInvariant();
    return a.OrderBy(c => c).SequenceEqual(b.OrderBy(c => c));
}

// Longest prefix shared by every word in the list.
public static string LongestCommonPrefix(IReadOnlyList<string> words)
{
    if (words.Count == 0)
    {
        return "";
    }
    string prefix = words[0];
    for (int i = 1; i < words.Count && prefix.Length > 0; i++)
    {
        int j = 0;
        while (j < prefix.Length && j < words[i].Length && prefix[j] == words[i][j])
        {
            j++;
        }
        prefix = prefix[..j];
    }
    return prefix;
}

// Applies a ROT13 cipher, leaving digits and punctuation untouched.
public static string Rot13(string input)
{
    var out_ = new System.Text.StringBuilder(input.Length);
    foreach (char c in input)
    {
        if (c >= 'a' && c <= 'z')
        {
            out_.Append((char)('a' + (c - 'a' + 13) % 26));
        }
        else if (c >= 'A' && c <= 'Z')
        {
            out_.Append((char)('A' + (c - 'A' + 13) % 26));
        }
        else
        {
            out_.Append(c);
        }
    }
    return out_.ToString();
}

// Masks a card number, keeping only the last four digits visible.
public static string MaskCardNumber(string cardNumber)
{
    string digits = new string(cardNumber.Where(char.IsDigit).ToArray());
    if (digits.Length < 8)
    {
        return cardNumber;
    }
    return new string('*', digits.Length - 4) + digits[^4..];
}

// Capitalizes the first letter of every word.
public static string ToTitleCase(string sentence)
{
    var builder = new System.Text.StringBuilder(sentence.Length);
    bool atWordStart = true;
    foreach (char c in sentence)
    {
        if (char.IsWhiteSpace(c))
        {
            atWordStart = true;
            builder.Append(c);
        }
        else if (atWordStart)
        {
            builder.Append(char.ToUpperInvariant(c));
            atWordStart = false;
        }
        else
        {
            builder.Append(c);
        }
    }
    return builder.ToString();
}

// Pulls every email address out of a blob of text.
public static List<string> ExtractEmails(string text)
{
    var pattern = new System.Text.RegularExpressions.Regex(
        @"[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}",
        System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    return pattern.Matches(text).Select(m => m.Value).ToList();
}

// Run-length encodes a string: "aaabbc" becomes "a3b2c1".
public static string RunLengthEncode(string input)
{
    if (string.IsNullOrEmpty(input))
    {
        return input;
    }
    var encoded = new System.Text.StringBuilder();
    int run = 1;
    for (int i = 1; i < input.Length; i++)
    {
        if (input[i] == input[i - 1])
        {
            run++;
        }
        else
        {
            encoded.Append(input[i - 1]).Append(run);
            run = 1;
        }
    }
    return encoded.Append(input[^1]).Append(run).ToString();
}

// Wraps text so no line exceeds width characters, breaking at spaces.
public static List<string> WrapText(string text, int width)
{
    var lines = new List<string>();
    foreach (string word in text.Split(' ', StringSplitOptions.RemoveEmptyEntries))
    {
        if (lines.Count == 0 || lines[^1].Length + word.Length + 1 > width)
        {
            lines.Add(word);
        }
        else
        {
            lines[^1] += " " + word;
        }
    }
    return lines;
}

// Removes HTML tags from a fragment, collapsing runs of whitespace.
public static string StripHtml(string html)
{
    if (string.IsNullOrEmpty(html))
    {
        return html;
    }
    string noTags = System.Text.RegularExpressions.Regex.Replace(html, "<[^>]*>", " ");
    return System.Text.RegularExpressions.Regex.Replace(noTags, "\s+", " ").Trim();
}

// Returns the longest word in a sentence, ignoring punctuation.
public static string FindLongestWord(string sentence)
{
    return sentence
        .Split(' ', StringSplitOptions.RemoveEmptyEntries)
        .Select(w => new string(w.Where(char.IsLetter).ToArray()))
        .OrderByDescending(w => w.Length)
        .FirstOrDefault() ?? "";
}
