// Data module for scripts/generate/generate-cpp.mjs.
// Threading utilities and domain models.

export default [
  {
    file: 'threading_utils.cpp',
    topic: 'threading and concurrency utilities',
    includes: ['<algorithm>', '<atomic>', '<chrono>', '<condition_variable>', '<functional>', '<mutex>', '<queue>', '<thread>', '<vector>'],
    units: [
      `// ThreadSafeCounter is an atomic integer counter.
class ThreadSafeCounter {
public:
    void increment() { value_.fetch_add(1, std::memory_order_relaxed); }
    long load() const { return value_.load(std::memory_order_relaxed); }

private:
    std::atomic<long> value_{0};
};`,

      `// ThreadSafeQueue is a blocking FIFO queue for worker threads.
class ThreadSafeQueue {
public:
    void push(int value);
    bool pop(int& value, std::chrono::milliseconds timeout);

private:
    std::mutex mutex_;
    std::condition_variable notEmpty_;
    std::queue<int> items_;
};

void ThreadSafeQueue::push(int value) {
    {
        std::lock_guard<std::mutex> lock(mutex_);
        items_.push(value);
    }
    notEmpty_.notify_one();
}

bool ThreadSafeQueue::pop(int& value, std::chrono::milliseconds timeout) {
    std::unique_lock<std::mutex> lock(mutex_);
    if (!notEmpty_.wait_for(lock, timeout, [this] { return !items_.empty(); })) {
        return false;
    }
    value = items_.front();
    items_.pop();
    return true;
}`,

      `// parallel_sum adds a vector across several threads.
long long parallel_sum(const std::vector<int>& values, size_t threads) {
    if (values.empty()) {
        return 0;
    }
    if (threads == 0) {
        threads = 1;
    }
    std::atomic<long long> total{0};
    std::vector<std::thread> workers;
    size_t chunkSize = (values.size() + threads - 1) / threads;
    for (size_t start = 0; start < values.size(); start += chunkSize) {
        workers.emplace_back([&values, &total, start, chunkSize] {
            long long local = 0;
            size_t end = std::min(start + chunkSize, values.size());
            for (size_t i = start; i < end; ++i) {
                local += values[i];
            }
            total.fetch_add(local, std::memory_order_relaxed);
        });
    }
    for (std::thread& worker : workers) {
        worker.join();
    }
    return total.load();
}`,

      `// worker_pool processes jobs with n workers, collecting results in order.
std::vector<int> worker_pool(const std::vector<int>& jobs, size_t workers,
                             const std::function<int(int)>& process) {
    std::vector<int> results(jobs.size());
    std::atomic<size_t> next{0};
    std::vector<std::thread> pool;
    for (size_t w = 0; w < workers; ++w) {
        pool.emplace_back([&] {
            while (true) {
                size_t i = next.fetch_add(1);
                if (i >= jobs.size()) {
                    break;
                }
                results[i] = process(jobs[i]);
            }
        });
    }
    for (std::thread& worker : pool) {
        worker.join();
    }
    return results;
}`,

      `// parallel_for runs fn(i) for every index across several threads.
void parallel_for(size_t count, size_t threads,
                  const std::function<void(size_t)>& fn) {
    if (count == 0) {
        return;
    }
    if (threads == 0) {
        threads = 1;
    }
    if (threads > count) {
        threads = count;
    }
    std::atomic<size_t> next{0};
    std::vector<std::thread> pool;
    for (size_t w = 0; w < threads; ++w) {
        pool.emplace_back([&] {
            while (true) {
                size_t i = next.fetch_add(1);
                if (i >= count) {
                    break;
                }
                fn(i);
            }
        });
    }
    for (std::thread& worker : pool) {
        worker.join();
    }
}`,

      `// initialize_once runs init exactly once even when called from many
// threads.
void initialize_once(const std::function<void()>& init) {
    static std::once_flag flag;
    std::call_once(flag, init);
}`,

      `// measure_time runs fn and returns the elapsed wall-clock milliseconds.
long long measure_time(const std::function<void()>& fn) {
    auto start = std::chrono::steady_clock::now();
    fn();
    auto end = std::chrono::steady_clock::now();
    return std::chrono::duration_cast<std::chrono::milliseconds>(end - start)
        .count();
}`,

      `// wait_until_ready polls a condition for up to timeout milliseconds.
bool wait_until_ready(const std::atomic<bool>& ready,
                      std::chrono::milliseconds timeout) {
    auto deadline = std::chrono::steady_clock::now() + timeout;
    while (!ready.load(std::memory_order_acquire)) {
        if (std::chrono::steady_clock::now() >= deadline) {
            return false;
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(2));
    }
    return true;
}`,

      `// RateLimiter spaces out work calls by a minimum interval.
class RateLimiter {
public:
    explicit RateLimiter(std::chrono::milliseconds interval);
    void tick();

private:
    std::chrono::steady_clock::time_point last_;
    std::chrono::milliseconds interval_;
};

RateLimiter::RateLimiter(std::chrono::milliseconds interval)
    : last_(std::chrono::steady_clock::now()), interval_(interval) {}

void RateLimiter::tick() {
    auto now = std::chrono::steady_clock::now();
    auto elapsed = now - last_;
    if (elapsed < interval_) {
        std::this_thread::sleep_for(interval_ - elapsed);
    }
    last_ = std::chrono::steady_clock::now();
}`,
    ],
  },

  {
    file: 'domain_models.cpp',
    topic: 'domain models and their methods',
    includes: ['<string>', '<utility>', '<vector>'],
    units: [
      `// User is a registered account in the system.
class User {
public:
    User(int id, std::string name, std::string email);

    std::string display_name() const;
    bool valid_email() const;

private:
    int id_;
    std::string name_;
    std::string email_;
};

User::User(int id, std::string name, std::string email)
    : id_(id), name_(std::move(name)), email_(std::move(email)) {}

std::string User::display_name() const {
    if (!name_.empty()) {
        return name_;
    }
    size_t at = email_.find('@');
    return at == std::string::npos ? "anonymous" : email_.substr(0, at);
}

bool User::valid_email() const {
    return email_.find('@') != std::string::npos &&
           email_.find('.', email_.find('@')) != std::string::npos;
}`,

      `// Product is an item available for sale, priced in cents.
class Product {
public:
    Product(std::string sku, std::string name, long long priceCents, int stock);

    long long total_value() const;
    void restock(int amount);

private:
    std::string sku_;
    std::string name_;
    long long priceCents_;
    int stock_;
};

Product::Product(std::string sku, std::string name, long long priceCents,
                 int stock)
    : sku_(std::move(sku)), name_(std::move(name)), priceCents_(priceCents),
      stock_(stock) {}

long long Product::total_value() const {
    return priceCents_ * stock_;
}

void Product::restock(int amount) {
    if (amount > 0) {
        stock_ += amount;
    }
}`,

      `// OrderItem is one line of an order.
struct OrderItem {
    std::string sku;
    int quantity = 0;
    long long price = 0;
};

// Order is a customer's purchase with a lifecycle status.
class Order {
public:
    void add_item(OrderItem item);
    long long subtotal() const;
    size_t item_count() const;

private:
    std::string id_;
    std::string status_ = "pending";
    std::vector<OrderItem> items_;
};

void Order::add_item(OrderItem item) {
    items_.push_back(std::move(item));
}

long long Order::subtotal() const {
    long long total = 0;
    for (const OrderItem& item : items_) {
        total += item.price * item.quantity;
    }
    return total;
}

size_t Order::item_count() const {
    return items_.size();
}`,

      `// BankAccount tracks a balance in cents for one owner.
class BankAccount {
public:
    explicit BankAccount(std::string owner);

    void deposit(long long amount);
    bool withdraw(long long amount);
    long long balance() const;

private:
    std::string owner_;
    long long balanceCents_ = 0;
};

BankAccount::BankAccount(std::string owner) : owner_(std::move(owner)) {}

void BankAccount::deposit(long long amount) {
    if (amount > 0) {
        balanceCents_ += amount;
    }
}

bool BankAccount::withdraw(long long amount) {
    if (amount <= 0 || amount > balanceCents_) {
        return false;
    }
    balanceCents_ -= amount;
    return true;
}

long long BankAccount::balance() const {
    return balanceCents_;
}`,

      `// Book is a published work in the library catalog.
class Book {
public:
    Book(std::string title, std::string author, int pages);

    std::string citation() const;
    int pages() const;

private:
    std::string title_;
    std::string author_;
    int pages_;
};

Book::Book(std::string title, std::string author, int pages)
    : title_(std::move(title)), author_(std::move(author)), pages_(pages) {}

std::string Book::citation() const {
    return author_ + ". " + title_ + ".";
}

int Book::pages() const {
    return pages_;
}`,

      `// Vehicle records the facts of a car in a fleet.
class Vehicle {
public:
    Vehicle(std::string make, std::string model, int year, int mileage);

    int age(int currentYear) const;
    void drive(int miles);

private:
    std::string make_;
    std::string model_;
    int year_;
    int mileage_;
};

Vehicle::Vehicle(std::string make, std::string model, int year, int mileage)
    : make_(std::move(make)), model_(std::move(model)), year_(year),
      mileage_(mileage) {}

int Vehicle::age(int currentYear) const {
    return currentYear < year_ ? 0 : currentYear - year_;
}

void Vehicle::drive(int miles) {
    if (miles > 0) {
        mileage_ += miles;
    }
}`,

      `// Employee is a member of staff with a yearly salary.
class Employee {
public:
    Employee(int id, std::string name, std::string department, int salary);

    int annual_bonus(double percent) const;
    std::string department() const;

private:
    int id_;
    std::string name_;
    std::string department_;
    int salary_;
};

Employee::Employee(int id, std::string name, std::string department, int salary)
    : id_(id), name_(std::move(name)), department_(std::move(department)),
      salary_(salary) {}

int Employee::annual_bonus(double percent) const {
    return static_cast<int>(salary_ * percent / 100.0);
}

std::string Employee::department() const {
    return department_;
}`,

      `// Student holds the course grades of one learner.
class Student {
public:
    explicit Student(std::string name);

    void add_grade(double grade);
    double average() const;
    size_t grade_count() const;

private:
    std::string name_;
    std::vector<double> grades_;
};

Student::Student(std::string name) : name_(std::move(name)) {}

void Student::add_grade(double grade) {
    if (grade >= 0.0 && grade <= 100.0) {
        grades_.push_back(grade);
    }
}

double Student::average() const {
    if (grades_.empty()) {
        return 0.0;
    }
    double sum = 0.0;
    for (double grade : grades_) {
        sum += grade;
    }
    return sum / static_cast<double>(grades_.size());
}

size_t Student::grade_count() const {
    return grades_.size();
}`,
    ],
  },
];
