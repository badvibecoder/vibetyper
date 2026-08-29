// Splits text into words, discarding punctuation and empty tokens.
public static List<string> Tokenize(string text)
{
    return System.Text.RegularExpressions.Regex.Split(text, "[^a-zA-Z0-9']+")
        .Where(token => token.Length > 0)
        .ToList();
}

// Sentence case: first letter of the string capitalized.
public static string SentenceCase(string? text)
{
    if (string.IsNullOrEmpty(text))
    {
        return text ?? "";
    }
    return char.ToUpperInvariant(text[0]) + text[1..];
}

// Counts words in a string, treating any run of spaces as a break.
public static int WordCount(string? text)
{
    if (string.IsNullOrWhiteSpace(text))
    {
        return 0;
    }
    return text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
}

// Extracts all numbers (including decimals) from a string.
public static List<double> ExtractNumbers(string text)
{
    var pattern = new System.Text.RegularExpressions.Regex(@"-?\d+(\.\d+)?");
    return pattern.Matches(text).Select(m => double.Parse(m.Value)).ToList();
}

// Splits a camelCase string into words: "parseUrl" -> "parse Url".
public static List<string> SplitCamelCase(string camel)
{
    var words = new List<string>();
    var current = new System.Text.StringBuilder();
    foreach (char c in camel)
    {
        if (char.IsUpper(c) && current.Length > 0)
        {
            words.Add(current.ToString());
            current.Clear();
        }
        current.Append(c);
    }
    if (current.Length > 0)
    {
        words.Add(current.ToString());
    }
    return words;
}

// Replaces every whole-word occurrence, case-insensitively.
public static string ReplaceWord(string text, string from, string to)
{
    return System.Text.RegularExpressions.Regex.Replace(
        text, $@"\b{System.Text.RegularExpressions.Regex.Escape(from)}\b", to,
        System.Text.RegularExpressions.RegexOptions.IgnoreCase);
}

// Indents every line of a block by a fixed number of spaces.
public static string Indent(string text, int spaces)
{
    string prefix = new string(' ', spaces);
    return string.Join("\n", text.Split('\n').Select(line => prefix + line));
}

// Trims whitespace and normalizes inner whitespace to single spaces.
public static string NormalizeWhitespace(string? text)
{
    return string.IsNullOrWhiteSpace(text)
        ? ""
        : System.Text.RegularExpressions.Regex.Replace(text.Trim(), "\s+", " ");
}

// Reads a paragraph into sentences, splitting on terminal punctuation.
public static List<string> SplitSentences(string paragraph)
{
    return System.Text.RegularExpressions.Regex.Split(paragraph, "(?<=[.!?])\s+")
        .Where(part => !string.IsNullOrWhiteSpace(part))
        .Select(part => part.Trim())
        .ToList();
}

// Removes every non-alphanumeric character from a string.
public static string KeepAlphanumeric(string text)
{
    return new string(text.Where(char.IsLetterOrDigit).ToArray());
}

// Counts vowels in a string, case-insensitively.
public static int CountVowels(string text)
{
    return text.Count(c => "aeiou".Contains(char.ToLowerInvariant(c)));
}

// Transforms text into alternating case: "hello" -> "hElLo".
public static string AlternatingCase(string text)
{
    var builder = new System.Text.StringBuilder(text.Length);
    bool upper = false;
    foreach (char c in text)
    {
        if (char.IsLetter(c))
        {
            builder.Append(upper ? char.ToUpperInvariant(c) : char.ToLowerInvariant(c));
            upper = !upper;
        }
        else
        {
            builder.Append(c);
        }
    }
    return builder.ToString();
}

// Removes leading and trailing punctuation from a phrase.
public static string StripOuterPunctuation(string phrase)
{
    return System.Text.RegularExpressions.Regex.Replace(phrase, "^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$", "");
}

// Splits a string on a delimiter, trimming each field.
public static List<string> SplitTrimmed(string text, char delimiter)
{
    return text.Split(delimiter).Select(part => part.Trim()).ToList();
}

// True when every non-empty line of text is indented with at least
// minSpaces spaces.
public static bool UniformlyIndented(string text, int minSpaces)
{
    string prefix = new string(' ', minSpaces);
    return text.Split('\n')
        .Where(line => line.Length > 0)
        .All(line => line.StartsWith(prefix, StringComparison.Ordinal));
}

// Pads a multi-line block so every line is at least width long.
public static string PadLinesToWidth(string text, int width)
{
    return string.Join("\n", text.Split('\n').Select(line => line.PadRight(width)));
}

// Extracts the first sentence of a text, capped at maxChars.
public static string FirstSentence(string text, int maxChars)
{
    string first = System.Text.RegularExpressions.Regex.Split(text, "(?<=[.!?])\s+")[0];
    return first.Length > maxChars ? first[..(maxChars - 1)] + "…" : first;
}

// Converts spaces to underscores and lowercases: "My File" -> "my_file".
public static string ToSnakeCase(string text)
{
    return System.Text.RegularExpressions.Regex.Replace(text.Trim(), "\s+", "_")
        .ToLowerInvariant();
}

// Returns the substring between two markers, or empty when missing.
public static string Between(string text, string start, string end)
{
    int begin = text.IndexOf(start, StringComparison.Ordinal);
    if (begin < 0)
    {
        return "";
    }
    begin += start.Length;
    int finish = text.IndexOf(end, begin, StringComparison.Ordinal);
    return finish < 0 ? text[begin..] : text[begin..finish];
}

// Converts plain text into a one-line summary of the first words.
public static string Excerpt(string text, int wordLimit)
{
    string[] words = text.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
    string head = string.Join(" ", words.Take(wordLimit));
    return words.Length > wordLimit ? head + "…" : head;
}
