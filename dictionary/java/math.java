// Greatest common divisor via Euclid's algorithm.
public static int gcd(int a, int b) {
    while (b != 0) {
        int temp = a % b;
        a = b;
        b = temp;
    }
    return Math.abs(a);
}

// Least common multiple of two positive integers.
public static int lcm(int a, int b) {
    if (a == 0 || b == 0) {
        return 0;
    }
    return Math.abs(a / gcd(a, b) * b);
}

// Primality test that only checks divisors up to the square root.
public static boolean isPrime(long n) {
    if (n < 2) {
        return false;
    }
    if (n % 2 == 0) {
        return n == 2;
    }
    for (long d = 3; d * d <= n; d += 2) {
        if (n % d == 0) {
            return false;
        }
    }
    return true;
}

// Factorizes a number into its prime factors, smallest first.
public static List<Integer> primeFactors(int n) {
    List<Integer> factors = new ArrayList<>();
    for (int d = 2; d * d <= n; d++) {
        while (n % d == 0) {
            factors.add(d);
            n /= d;
        }
    }
    if (n > 1) {
        factors.add(n);
    }
    return factors;
}

// The nth Fibonacci number, computed iteratively in O(n).
public static long fibonacci(int n) {
    if (n < 0) {
        throw new IllegalArgumentException("n must be non-negative");
    }
    if (n < 2) {
        return n;
    }
    long a = 0;
    long b = 1;
    for (int i = 2; i <= n; i++) {
        long next = a + b;
        a = b;
        b = next;
    }
    return b;
}

// Factorial of n using a plain loop instead of recursion.
public static long factorial(int n) {
    if (n < 0) {
        throw new IllegalArgumentException("n must be non-negative");
    }
    long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// A number is perfect when it equals the sum of its proper divisors.
public static boolean isPerfectNumber(int n) {
    if (n < 2) {
        return false;
    }
    int sum = 1;
    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) {
            sum += d;
            if (d != n / d) {
                sum += n / d;
            }
        }
    }
    return sum == n;
}

// Counts the primes up to and including n using a sieve of Eratosthenes.
public static int countPrimesUpTo(int n) {
    if (n < 2) {
        return 0;
    }
    boolean[] composite = new boolean[n + 1];
    int count = 0;
    for (int i = 2; i <= n; i++) {
        if (!composite[i]) {
            count++;
            if ((long) i * i <= n) {
                for (int j = i * i; j <= n; j += i) {
                    composite[j] = true;
                }
            }
        }
    }
    return count;
}

// Parses a binary string like "10110" into its decimal value.
public static int binaryToDecimal(String binary) {
    int value = 0;
    for (char bit : binary.toCharArray()) {
        value = value * 2 + (bit - '0');
    }
    return value;
}

// Formats a non-negative integer as a binary string.
public static String decimalToBinary(int n) {
    if (n == 0) {
        return "0";
    }
    StringBuilder bits = new StringBuilder();
    while (n > 0) {
        bits.append(n % 2);
        n /= 2;
    }
    return bits.reverse().toString();
}

// Clamps a value into the inclusive range [min, max].
public static int clamp(int value, int min, int max) {
    return Math.max(min, Math.min(max, value));
}

// Rounds a double to a fixed number of decimal places.
public static double roundTo(double value, int places) {
    double factor = Math.pow(10, places);
    return Math.round(value * factor) / factor;
}

// Sums the digits of a non-negative integer.
public static int digitSum(int n) {
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}

// An Armstrong number equals the sum of its digits raised to the
// power of the digit count, e.g. 153 = 1^3 + 5^3 + 3^3.
public static boolean isArmstrong(int n) {
    String digits = String.valueOf(n);
    int power = digits.length();
    int sum = 0;
    for (char c : digits.toCharArray()) {
        sum += (int) Math.pow(c - '0', power);
    }
    return sum == n;
}

// Integer square root using Newton's method, converging quickly.
public static int integerSqrt(int n) {
    if (n < 0) {
        throw new IllegalArgumentException("n must be non-negative");
    }
    long x = n;
    while (x * x > n) {
        x = (x + n / x) / 2;
    }
    return (int) x;
}

// Modular exponentiation, base^exp mod mod, without overflow.
public static long modularPow(long base, long exp, long mod) {
    long result = 1;
    base %= mod;
    while (exp > 0) {
        if ((exp & 1) == 1) {
            result = (result * base) % mod;
        }
        base = (base * base) % mod;
        exp >>= 1;
    }
    return result;
}

// Number of steps until the Collatz sequence reaches 1.
public static int collatzSteps(int n) {
    int steps = 0;
    while (n != 1) {
        if (n % 2 == 0) {
            n /= 2;
        } else {
            n = 3 * n + 1;
        }
        steps++;
    }
    return steps;
}

// Computes mean and median of a list of doubles in one pass over a copy.
public static double[] meanAndMedian(List<Double> values) {
    if (values.isEmpty()) {
        return new double[] { 0.0, 0.0 };
    }
    double sum = 0;
    for (double v : values) {
        sum += v;
    }
    List<Double> sorted = new ArrayList<>(values);
    Collections.sort(sorted);
    int mid = sorted.size() / 2;
    double median = sorted.size() % 2 == 1
            ? sorted.get(mid)
            : (sorted.get(mid - 1) + sorted.get(mid)) / 2.0;
    return new double[] { sum / values.size(), median };
}

// GCD across an entire array of integers.
public static int gcdOfArray(int[] values) {
    int result = 0;
    for (int value : values) {
        result = gcd(result, value);
    }
    return result;
}

// Compound interest: amount after years with annual compounding.
public static double compoundInterest(double principal, double annualRate, int years) {
    return principal * Math.pow(1 + annualRate, years);
}
