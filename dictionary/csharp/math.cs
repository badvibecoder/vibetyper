// Greatest common divisor via Euclid's algorithm.
public static int Gcd(int a, int b)
{
    while (b != 0)
    {
        (a, b) = (b, a % b);
    }
    return Math.Abs(a);
}

// Least common multiple of two positive integers.
public static int Lcm(int a, int b)
{
    if (a == 0 || b == 0)
    {
        return 0;
    }
    return Math.Abs(a / Gcd(a, b) * b);
}

// Primality test that only checks divisors up to the square root.
public static bool IsPrime(long n)
{
    if (n < 2)
    {
        return false;
    }
    if (n % 2 == 0)
    {
        return n == 2;
    }
    for (long d = 3; d * d <= n; d += 2)
    {
        if (n % d == 0)
        {
            return false;
        }
    }
    return true;
}

// Factorizes a number into its prime factors, smallest first.
public static List<int> PrimeFactors(int n)
{
    var factors = new List<int>();
    for (int d = 2; d * d <= n; d++)
    {
        while (n % d == 0)
        {
            factors.Add(d);
            n /= d;
        }
    }
    if (n > 1)
    {
        factors.Add(n);
    }
    return factors;
}

// The nth Fibonacci number, computed iteratively in O(n).
public static long Fibonacci(int n)
{
    if (n < 0)
    {
        throw new ArgumentOutOfRangeException(nameof(n), "must be non-negative");
    }
    if (n < 2)
    {
        return n;
    }
    long a = 0;
    long b = 1;
    for (int i = 2; i <= n; i++)
    {
        (a, b) = (b, a + b);
    }
    return b;
}

// Factorial of n using a plain loop instead of recursion.
public static long Factorial(int n)
{
    if (n < 0)
    {
        throw new ArgumentOutOfRangeException(nameof(n), "must be non-negative");
    }
    long result = 1;
    for (int i = 2; i <= n; i++)
    {
        result *= i;
    }
    return result;
}

// A number is perfect when it equals the sum of its proper divisors.
public static bool IsPerfectNumber(int n)
{
    if (n < 2)
    {
        return false;
    }
    int sum = 1;
    for (int d = 2; d * d <= n; d++)
    {
        if (n % d == 0)
        {
            sum += d;
            if (d != n / d)
            {
                sum += n / d;
            }
        }
    }
    return sum == n;
}

// Counts the primes up to and including n using a sieve.
public static int CountPrimesUpTo(int n)
{
    if (n < 2)
    {
        return 0;
    }
    var composite = new bool[n + 1];
    int count = 0;
    for (int i = 2; i <= n; i++)
    {
        if (!composite[i])
        {
            count++;
            if ((long)i * i <= n)
            {
                for (int j = i * i; j <= n; j += i)
                {
                    composite[j] = true;
                }
            }
        }
    }
    return count;
}

// Parses a binary string like "10110" into its decimal value.
public static int BinaryToDecimal(string binary)
{
    int value = 0;
    foreach (char bit in binary)
    {
        value = value * 2 + (bit - '0');
    }
    return value;
}

// Formats a non-negative integer as a binary string.
public static string DecimalToBinary(int n)
{
    if (n == 0)
    {
        return "0";
    }
    var bits = new System.Text.StringBuilder();
    while (n > 0)
    {
        bits.Insert(0, n % 2);
        n /= 2;
    }
    return bits.ToString();
}

// Clamps a value into the inclusive range [min, max].
public static int Clamp(int value, int min, int max)
{
    return Math.Max(min, Math.Min(max, value));
}

// Rounds a double to a fixed number of decimal places.
public static double RoundTo(double value, int places)
{
    double factor = Math.Pow(10, places);
    return Math.Round(value * factor) / factor;
}

// Sums the digits of a non-negative integer.
public static int DigitSum(int n)
{
    int sum = 0;
    while (n > 0)
    {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}

// An Armstrong number equals the sum of its digits raised to the
// power of the digit count, e.g. 153 = 1^3 + 5^3 + 3^3.
public static bool IsArmstrong(int n)
{
    string digits = n.ToString();
    int power = digits.Length;
    int sum = digits.Sum(c => (int)Math.Pow(c - '0', power));
    return sum == n;
}

// Integer square root using Newton's method.
public static int IntegerSqrt(int n)
{
    if (n < 0)
    {
        throw new ArgumentOutOfRangeException(nameof(n), "must be non-negative");
    }
    long x = n;
    while (x * x > n)
    {
        x = (x + n / x) / 2;
    }
    return (int)x;
}

// Modular exponentiation, base^exp mod mod, without overflow.
public static long ModularPow(long base_, long exp, long mod)
{
    long result = 1;
    base_ %= mod;
    while (exp > 0)
    {
        if ((exp & 1) == 1)
        {
            result = result * base_ % mod;
        }
        base_ = base_ * base_ % mod;
        exp >>= 1;
    }
    return result;
}

// Number of steps until the Collatz sequence reaches 1.
public static int CollatzSteps(int n)
{
    int steps = 0;
    while (n != 1)
    {
        n = n % 2 == 0 ? n / 2 : 3 * n + 1;
        steps++;
    }
    return steps;
}

// Computes mean and median of a list of doubles.
public static (double Mean, double Median) MeanAndMedian(List<double> values)
{
    if (values.Count == 0)
    {
        return (0.0, 0.0);
    }
    double mean = values.Average();
    var sorted = values.OrderBy(v => v).ToList();
    int mid = sorted.Count / 2;
    double median = sorted.Count % 2 == 1
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2.0;
    return (mean, median);
}

// GCD across an entire array of integers.
public static int GcdOfArray(int[] values)
{
    int result = 0;
    foreach (int value in values)
    {
        result = Gcd(result, value);
    }
    return result;
}

// Compound interest: amount after years with annual compounding.
public static double CompoundInterest(double principal, double annualRate, int years)
{
    return principal * Math.Pow(1 + annualRate, years);
}
