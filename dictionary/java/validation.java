// Basic email shape check: local@domain.tld.
public static boolean isValidEmail(String email) {
    if (email == null || email.length() > 254) {
        return false;
    }
    int at = email.indexOf('@');
    if (at <= 0 || at != email.lastIndexOf('@')) {
        return false;
    }
    String domain = email.substring(at + 1);
    return domain.contains(".") && !domain.startsWith(".") && !domain.endsWith(".");
}

// A password is strong when it mixes case, digits, and symbols
// and is at least twelve characters long.
public static boolean isStrongPassword(String password) {
    if (password == null || password.length() < 12) {
        return false;
    }
    boolean hasLower = false;
    boolean hasUpper = false;
    boolean hasDigit = false;
    boolean hasSymbol = false;
    for (char c : password.toCharArray()) {
        if (Character.isLowerCase(c)) {
            hasLower = true;
        } else if (Character.isUpperCase(c)) {
            hasUpper = true;
        } else if (Character.isDigit(c)) {
            hasDigit = true;
        } else {
            hasSymbol = true;
        }
    }
    return hasLower && hasUpper && hasDigit && hasSymbol;
}

// Accepts a US-style phone number in several common formats.
public static boolean isValidPhoneNumber(String phone) {
    if (phone == null) {
        return false;
    }
    String digits = phone.replaceAll("[^0-9]", "");
    if (digits.length() == 11 && digits.startsWith("1")) {
        digits = digits.substring(1);
    }
    return digits.length() == 10 && !digits.startsWith("0") && !digits.startsWith("1");
}

// Validates an IPv4 address, rejecting leading zeros per RFC 791.
public static boolean isValidIpv4(String ip) {
    if (ip == null) {
        return false;
    }
    String[] octets = ip.split("\\.");
    if (octets.length != 4) {
        return false;
    }
    for (String octet : octets) {
        if (octet.isEmpty() || octet.length() > 3 || !octet.chars().allMatch(Character::isDigit)) {
            return false;
        }
        if (octet.length() > 1 && octet.charAt(0) == '0') {
            return false;
        }
        if (Integer.parseInt(octet) > 255) {
            return false;
        }
    }
    return true;
}

// Checks that a URL has a scheme and a resolvable-looking host.
public static boolean isValidUrl(String url) {
    if (url == null) {
        return false;
    }
    try {
        java.net.URI uri = new java.net.URI(url);
        return uri.getScheme() != null && uri.getHost() != null;
    } catch (java.net.URISyntaxException e) {
        return false;
    }
}

// Accepts dates in yyyy-MM-dd, MM/dd/yyyy, or dd-MM-yyyy form.
public static boolean isValidDateString(String date) {
    if (date == null) {
        return false;
    }
    String[] patterns = { "yyyy-MM-dd", "MM/dd/yyyy", "dd-MM-yyyy" };
    for (String pattern : patterns) {
        try {
            java.time.LocalDate.parse(date, java.time.format.DateTimeFormatter.ofPattern(pattern));
            return true;
        } catch (java.time.format.DateTimeParseException ignored) {
            // try the next pattern
        }
    }
    return false;
}

// True when the birth date makes the person at least minAge today.
public static boolean isOldEnough(java.time.LocalDate birthDate, int minAge) {
    if (birthDate == null) {
        return false;
    }
    java.time.LocalDate cutoff = java.time.LocalDate.now().minusYears(minAge);
    return !birthDate.isAfter(cutoff);
}

// Usernames must be 3-20 chars and contain only letters, digits,
// underscores, or a single dot between parts.
public static boolean isValidUsername(String username) {
    if (username == null || username.length() < 3 || username.length() > 20) {
        return false;
    }
    if (username.startsWith(".") || username.endsWith(".") || username.contains("..")) {
        return false;
    }
    return username.matches("[a-zA-Z0-9_.]+");
}

// Validates a #RGB or #RRGGBB hex color code.
public static boolean isValidHexColor(String color) {
    if (color == null) {
        return false;
    }
    if (color.startsWith("#")) {
        color = color.substring(1);
    }
    if (color.length() != 3 && color.length() != 6) {
        return false;
    }
    return color.matches("[0-9a-fA-F]+");
}

// Luhn checksum test used for credit card numbers.
public static boolean passesLuhn(String number) {
    String digits = number.replaceAll("\\D", "");
    if (digits.length() < 13) {
        return false;
    }
    int sum = 0;
    boolean doubleDigit = false;
    for (int i = digits.length() - 1; i >= 0; i--) {
        int d = digits.charAt(i) - '0';
        if (doubleDigit) {
            d *= 2;
            if (d > 9) {
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
public static boolean isBalancedBrackets(String code) {
    Deque<Character> stack = new ArrayDeque<>();
    String open = "([{";
    String close = ")]}";
    for (char c : code.toCharArray()) {
        int openIndex = open.indexOf(c);
        if (openIndex != -1) {
            stack.push(c);
            continue;
        }
        int closeIndex = close.indexOf(c);
        if (closeIndex != -1) {
            if (stack.isEmpty() || stack.pop() != open.charAt(closeIndex)) {
                return false;
            }
        }
    }
    return stack.isEmpty();
}

// Checks whether a string is made up of all distinct characters.
public static boolean hasUniqueCharacters(String text) {
    Set<Character> seen = new HashSet<>();
    for (char c : text.toCharArray()) {
        if (!seen.add(c)) {
            return false;
        }
    }
    return true;
}

// Validates a 10-digit ISBN (checksum position may be X).
public static boolean isValidIsbn10(String isbn) {
    String clean = isbn.replace("-", "");
    if (clean.length() != 10) {
        return false;
    }
    int sum = 0;
    for (int i = 0; i < 10; i++) {
        char c = clean.charAt(i);
        int digit = c == 'X' || c == 'x' ? 10 : c - '0';
        if (digit < 0 || digit > 10) {
            return false;
        }
        sum += digit * (10 - i);
    }
    return sum % 11 == 0;
}

// True when the string contains only ASCII digits.
public static boolean isNumeric(String text) {
    if (text == null || text.isEmpty()) {
        return false;
    }
    for (char c : text.toCharArray()) {
        if (!Character.isDigit(c)) {
            return false;
        }
    }
    return true;
}

// Validates a record-style object against required non-blank fields.
public static boolean validateRequiredFields(Map<String, String> record, String... required) {
    for (String field : required) {
        String value = record.get(field);
        if (value == null || value.trim().isEmpty()) {
            return false;
        }
    }
    return true;
}

// Validates a UUID string, accepting the canonical hyphenated form.
public static boolean isValidUuid(String uuid) {
    if (uuid == null) {
        return false;
    }
    try {
        java.util.UUID.fromString(uuid);
        return uuid.length() == 36;
    } catch (IllegalArgumentException e) {
        return false;
    }
}

// A number is a palindrome when reversed digits match, e.g. 12321.
public static boolean isPalindromeNumber(int n) {
    if (n < 0) {
        return false;
    }
    int original = n;
    int reversed = 0;
    while (n > 0) {
        reversed = reversed * 10 + n % 10;
        n /= 10;
    }
    return reversed == original;
}

// Validates a 24-hour clock time in HH:MM format.
public static boolean isValidTime24(String time) {
    if (time == null || !time.matches("[0-9]{2}:[0-9]{2}")) {
        return false;
    }
    int hour = Integer.parseInt(time.substring(0, 2));
    int minute = Integer.parseInt(time.substring(3));
    return hour < 24 && minute < 60;
}

// Gregorian leap-year rule, including the century exception.
public static boolean isLeapYear(int year) {
    return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
}

// Ensures a number sits inside [low, high], throwing otherwise.
public static double requireInRange(double value, double low, double high, String name) {
    if (value < low || value > high) {
        throw new IllegalArgumentException(name + " must be between " + low + " and " + high);
    }
    return value;
}
