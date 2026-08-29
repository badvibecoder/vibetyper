// Basic email shape check: local@domain.tld.
public static bool IsValidEmail(string? email)
{
    if (string.IsNullOrEmpty(email) || email.Length > 254)
    {
        return false;
    }
    int at = email.IndexOf('@');
    if (at <= 0 || at != email.LastIndexOf('@'))
    {
        return false;
    }
    string domain = email[(at + 1)..];
    return domain.Contains('.') && !domain.StartsWith('.') && !domain.EndsWith('.');
}

// A password is strong when it mixes case, digits, and symbols
// and is at least twelve characters long.
public static bool IsStrongPassword(string password)
{
    if (string.IsNullOrEmpty(password) || password.Length < 12)
    {
        return false;
    }
    bool hasLower = password.Any(char.IsLower);
    bool hasUpper = password.Any(char.IsUpper);
    bool hasDigit = password.Any(char.IsDigit);
    bool hasSymbol = password.Any(c => !char.IsLetterOrDigit(c));
    return hasLower && hasUpper && hasDigit && hasSymbol;
}

// Accepts a US-style phone number in several common formats.
public static bool IsValidPhoneNumber(string? phone)
{
    if (string.IsNullOrEmpty(phone))
    {
        return false;
    }
    string digits = new string(phone.Where(char.IsDigit).ToArray());
    if (digits.Length == 11 && digits.StartsWith('1'))
    {
        digits = digits[1..];
    }
    return digits.Length == 10 && !digits.StartsWith('0') && !digits.StartsWith('1');
}

// Validates an IPv4 address, rejecting leading zeros.
public static bool IsValidIpv4(string? ip)
{
    if (string.IsNullOrEmpty(ip))
    {
        return false;
    }
    string[] octets = ip.Split('.');
    if (octets.Length != 4)
    {
        return false;
    }
    foreach (string octet in octets)
    {
        if (octet.Length == 0 || octet.Length > 3 || !octet.All(char.IsDigit))
        {
            return false;
        }
        if (octet.Length > 1 && octet[0] == '0')
        {
            return false;
        }
        if (int.Parse(octet) > 255)
        {
            return false;
        }
    }
    return true;
}

// Checks that a URL has a scheme and a resolvable-looking host.
public static bool IsValidUrl(string? url)
{
    return Uri.TryCreate(url, UriKind.Absolute, out Uri? uri)
        && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
        && !string.IsNullOrEmpty(uri.Host);
}

// Accepts dates in yyyy-MM-dd, MM/dd/yyyy, or dd-MM-yyyy form.
public static bool IsValidDateString(string? date)
{
    string[] patterns = { "yyyy-MM-dd", "MM/dd/yyyy", "dd-MM-yyyy" };
    return DateTime.TryParseExact(date, patterns, System.Globalization.CultureInfo.InvariantCulture,
        System.Globalization.DateTimeStyles.None, out _);
}

// True when the birth date makes the person at least minAge today.
public static bool IsOldEnough(DateOnly birthDate, int minAge)
{
    DateOnly cutoff = DateOnly.FromDateTime(DateTime.Today).AddYears(-minAge);
    return birthDate <= cutoff;
}

// Usernames must be 3-20 chars and contain only letters, digits,
// underscores, or a single dot between parts.
public static bool IsValidUsername(string? username)
{
    if (string.IsNullOrEmpty(username) || username.Length < 3 || username.Length > 20)
    {
        return false;
    }
    if (username.StartsWith('.') || username.EndsWith('.') || username.Contains(".."))
    {
        return false;
    }
    return username.All(c => char.IsLetterOrDigit(c) || c == '_' || c == '.');
}

// Validates a #RGB or #RRGGBB hex color code.
public static bool IsValidHexColor(string? color)
{
    if (string.IsNullOrEmpty(color))
    {
        return false;
    }
    if (color.StartsWith('#'))
    {
        color = color[1..];
    }
    return (color.Length == 3 || color.Length == 6)
        && color.All(c => Uri.IsHexDigit(c));
}

// Luhn checksum test used for credit card numbers.
public static bool PassesLuhn(string number)
{
    string digits = new string(number.Where(char.IsDigit).ToArray());
    if (digits.Length < 13)
    {
        return false;
    }
    int sum = 0;
    bool doubleDigit = false;
    for (int i = digits.Length - 1; i >= 0; i--)
    {
        int d = digits[i] - '0';
        if (doubleDigit)
        {
            d *= 2;
            if (d > 9)
            {
                d -= 9;
            }
        }
        sum += d;
        doubleDigit = !doubleDigit;
    }
    return sum % 10 == 0;
}

// True when every opening bracket has a matching closer in the right
// nesting order.
public static bool IsBalancedBrackets(string code)
{
    var stack = new Stack<char>();
    string open = "([{";
    string close = ")]}";
    foreach (char c in code)
    {
        int openIndex = open.IndexOf(c);
        if (openIndex != -1)
        {
            stack.Push(c);
            continue;
        }
        int closeIndex = close.IndexOf(c);
        if (closeIndex != -1)
        {
            if (stack.Count == 0 || stack.Pop() != open[closeIndex])
            {
                return false;
            }
        }
    }
    return stack.Count == 0;
}

// Checks whether a string is made up of all distinct characters.
public static bool HasUniqueCharacters(string text)
{
    var seen = new HashSet<char>();
    foreach (char c in text)
    {
        if (!seen.Add(c))
        {
            return false;
        }
    }
    return true;
}

// Validates a 10-digit ISBN (checksum position may be X).
public static bool IsValidIsbn10(string isbn)
{
    string clean = isbn.Replace("-", "");
    if (clean.Length != 10)
    {
        return false;
    }
    int sum = 0;
    for (int i = 0; i < 10; i++)
    {
        char c = clean[i];
        int digit = c is 'X' or 'x' ? 10 : c - '0';
        if (digit < 0 || digit > 10)
        {
            return false;
        }
        sum += digit * (10 - i);
    }
    return sum % 11 == 0;
}

// True when the string contains only ASCII digits.
public static bool IsNumeric(string? text)
{
    return !string.IsNullOrEmpty(text) && text.All(char.IsDigit);
}

// Validates a record against required non-blank fields.
public static bool ValidateRequiredFields(
    Dictionary<string, string> record, params string[] required)
{
    foreach (string field in required)
    {
        if (string.IsNullOrWhiteSpace(record.GetValueOrDefault(field)))
        {
            return false;
        }
    }
    return true;
}

// Validates a UUID string, accepting the canonical hyphenated form.
public static bool IsValidUuid(string? uuid)
{
    return Guid.TryParseExact(uuid, "D", out _);
}

// A number is a palindrome when reversed digits match, e.g. 12321.
public static bool IsPalindromeNumber(int n)
{
    if (n < 0)
    {
        return false;
    }
    int original = n;
    int reversed = 0;
    while (n > 0)
    {
        reversed = reversed * 10 + n % 10;
        n /= 10;
    }
    return reversed == original;
}

// Validates a 24-hour clock time in HH:MM format.
public static bool IsValidTime24(string? time)
{
    return TimeOnly.TryParseExact(time, "HH:mm", System.Globalization.CultureInfo.InvariantCulture,
        System.Globalization.DateTimeStyles.None, out _);
}

// Gregorian leap-year rule, including the century exception.
public static bool IsLeapYear(int year)
{
    return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
}

// Ensures a number sits inside [low, high], throwing otherwise.
public static double RequireInRange(double value, double low, double high, string name)
{
    if (value < low || value > high)
    {
        throw new ArgumentOutOfRangeException(name, $"{name} must be between {low} and {high}");
    }
    return value;
}
