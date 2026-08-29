# is_integer tests whether a string is a valid signed integer.
is_integer() {
    [[ "${1:-}" =~ ^[+-]?[0-9]+$ ]]
}

# is_number tests whether a string parses as a decimal number.
is_number() {
    [[ "${1:-}" =~ ^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$ ]]
}

# abs prints the absolute value of an integer.
abs() {
    local n="${1:?missing value}"
    if (( n < 0 )); then
        printf '%s' "$((-n))"
    else
        printf '%s' "$n"
    fi
}

# gcd computes the greatest common divisor with Euclid's algorithm.
gcd() {
    local a="${1:?missing first}" b="${2:?missing second}" t
    a=${a#-}
    b=${b#-}
    while (( b != 0 )); do
        t=$(( a % b ))
        a=$b
        b=$t
    done
    printf '%s' "$a"
}

# lcm computes the least common multiple of two positive integers.
lcm() {
    local a="${1:?missing first}" b="${2:?missing second}"
    if (( a == 0 || b == 0 )); then
        printf '%s' 0
        return
    fi
    printf '%s' "$(( a * b / $(gcd "$a" "$b") ))"
}

# is_prime tests primality by trial division up to the square root.
is_prime() {
    local n="${1:?missing value}" d
    (( n < 2 )) && return 1
    (( n == 2 )) && return 0
    (( n % 2 == 0 )) && return 1
    for (( d = 3; d * d <= n; d += 2 )); do
        (( n % d == 0 )) && return 1
    done
    return 0
}

# next_prime prints the smallest prime greater than or equal to n.
next_prime() {
    local n="${1:?missing value}"
    (( n < 2 )) && n=2
    while ! is_prime "$n"; do
        n=$(( n + 1 ))
    done
    printf '%s' "$n"
}

# factorial multiplies the integers from 1 to n.
factorial() {
    local n="${1:?missing value}" result=1 i
    (( n < 0 )) && return 1
    for (( i = 2; i <= n; i++ )); do
        result=$(( result * i ))
    done
    printf '%s' "$result"
}

# nth_fib prints the n-th Fibonacci number, starting with 0 and 1.
nth_fib() {
    local n="${1:?missing value}" a=0 b=1 i
    for (( i = 0; i < n; i++ )); do
        local t=$(( a + b ))
        a=$b
        b=$t
    done
    printf '%s' "$a"
}

# sum_all adds up every argument passed to the function.
sum_all() {
    local total=0 n
    for n in "$@"; do
        total=$(( total + n ))
    done
    printf '%s' "$total"
}

# product_all multiplies every argument together.
product_all() {
    local total=1 n
    for n in "$@"; do
        total=$(( total * n ))
    done
    printf '%s' "$total"
}

# min_of prints the smallest of the given numbers.
min_of() {
    local best="$1" n
    shift
    for n in "$@"; do
        (( n < best )) && best=$n
    done
    printf '%s' "$best"
}

# max_of prints the largest of the given numbers.
max_of() {
    local best="$1" n
    shift
    for n in "$@"; do
        (( n > best )) && best=$n
    done
    printf '%s' "$best"
}

# clamp confines a value to the inclusive range [lo, hi].
clamp() {
    local value="${1:?missing value}" lo="${2:?missing low}" hi="${3:?missing high}"
    if (( value < lo )); then
        printf '%s' "$lo"
    elif (( value > hi )); then
        printf '%s' "$hi"
    else
        printf '%s' "$value"
    fi
}

# average prints the arithmetic mean of the given numbers.
average() {
    local total=0 count="$#" n
    (( count == 0 )) && return 1
    for n in "$@"; do
        total=$(( total + n ))
    done
    awk -v t="$total" -v c="$count" 'BEGIN { printf "%.2f\n", t / c }'
}

# median prints the middle value of the sorted arguments.
median() {
    local vals mid
    mapfile -t vals < <(printf '%s\n' "$@" | sort -n)
    mid=$(( ${#vals[@]} / 2 ))
    if (( ${#vals[@]} % 2 == 1 )); then
        printf '%s' "${vals[$mid]}"
    else
        awk -v a="${vals[$((mid - 1))]}" -v b="${vals[$mid]}" 'BEGIN { printf "%.1f\n", (a + b) / 2 }'
    fi
}

# digit_sum adds the decimal digits of an integer.
digit_sum() {
    local n="${1#-}" total=0 d i
    for (( i = 0; i < ${#n}; i++ )); do
        d=${n:i:1}
        total=$(( total + d ))
    done
    printf '%s' "$total"
}

# is_power_of_two tests whether a positive integer is a power of two.
is_power_of_two() {
    local n="${1:?missing value}"
    (( n > 0 && (n & (n - 1)) == 0 ))
}

# next_power_of_two rounds a number up to the next power of two.
next_power_of_two() {
    local n="${1:?missing value}" p=1
    while (( p < n )); do
        p=$(( p * 2 ))
    done
    printf '%s' "$p"
}

# dec_to_hex converts a decimal number to lowercase hexadecimal.
dec_to_hex() {
    printf '%x' "${1:?missing value}"
}

# hex_to_dec converts a hexadecimal number to decimal.
hex_to_dec() {
    printf '%d' "$(( 0x${1#0x} ))"
}

# rand_between prints a random integer in the inclusive range [lo, hi].
rand_between() {
    local lo="${1:-1}" hi="${2:-100}"
    printf '%s' "$(( lo + RANDOM % (hi - lo + 1) ))"
}

# percent prints how much of the whole the part represents.
percent() {
    local part="${1:?missing part}" whole="${2:?missing whole}"
    (( whole == 0 )) && { printf '%s' 0; return; }
    awk -v p="$part" -v w="$whole" 'BEGIN { printf "%.1f%%\n", p * 100 / w }'
}

# comma_format inserts thousands separators into an integer.
comma_format() {
    printf "%'d\n" "${1:?missing value}"
}

# collatz_steps counts the steps to reach 1 in the Collatz sequence.
collatz_steps() {
    local n="${1:?missing value}" steps=0
    while (( n != 1 )); do
        if (( n % 2 == 0 )); then
            n=$(( n / 2 ))
        else
            n=$(( 3 * n + 1 ))
        fi
        steps=$(( steps + 1 ))
    done
    printf '%s' "$steps"
}

# round_2dp rounds a decimal number to two places with awk.
round_2dp() {
    awk -v v="${1:?missing value}" 'BEGIN { printf "%.2f\n", v }'
}
