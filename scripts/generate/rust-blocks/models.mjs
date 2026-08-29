// vibetyper rust dictionary data — domain models
export const blocks = [
  String.raw`#[derive(Debug, Clone)]
struct User {
    name: String,
    email: String,
    role: String,
}`,

  String.raw`impl User {
    fn full_name(&self) -> String {
        format!("{} <{}>", self.name, self.email)
    }

    fn is_admin(&self) -> bool {
        self.role.eq_ignore_ascii_case("admin")
    }
}`,

  String.raw`#[derive(Debug, Clone)]
struct Product {
    name: String,
    price_cents: u64,
    in_stock: bool,
}`,

  String.raw`impl Product {
    fn discounted_price(&self, discount_percent: u64) -> u64 {
        let discount = self.price_cents * discount_percent / 100;
        self.price_cents - discount
    }
}`,

  String.raw`#[derive(Debug, Clone)]
struct OrderItem {
    product_id: u64,
    quantity: u32,
    unit_price_cents: u64,
}`,

  String.raw`impl OrderItem {
    fn line_total(&self) -> u64 {
        u64::from(self.quantity) * self.unit_price_cents
    }
}`,

  String.raw`#[derive(Debug, Clone)]
struct Order {
    id: u64,
    items: Vec<OrderItem>,
    status: String,
}`,

  String.raw`impl Order {
    fn total(&self) -> u64 {
        self.items.iter().map(OrderItem::line_total).sum()
    }

    fn item_count(&self) -> usize {
        self.items.len()
    }
}`,

  String.raw`#[derive(Debug, Clone)]
struct Account {
    owner: String,
    balance_cents: i64,
}`,

  String.raw`impl Account {
    fn deposit(&mut self, amount_cents: u64) -> Result<(), String> {
        self.balance_cents = self.balance_cents.checked_add(amount_cents as i64).ok_or_else(|| "balance overflow".to_string())?;
        Ok(())
    }

    fn withdraw(&mut self, amount_cents: u64) -> Result<(), String> {
        let amount = amount_cents as i64;
        if amount > self.balance_cents {
            return Err("insufficient funds".to_string());
        }
        self.balance_cents -= amount;
        Ok(())
    }
}`,

  String.raw`#[derive(Debug, Clone)]
struct Task {
    id: u64,
    title: String,
    done: bool,
    due_ts: Option<u64>,
}`,

  String.raw`impl Task {
    fn toggle(&mut self) {
        self.done = !self.done;
    }

    fn is_overdue(&self, now_ts: u64) -> bool {
        match self.due_ts {
            Some(due) => !self.done && due < now_ts,
            None => false,
        }
    }
}`,

  String.raw`#[derive(Debug, Clone, Copy, PartialEq)]
struct Point3 {
    x: f64,
    y: f64,
    z: f64,
}`,

  String.raw`impl Point3 {
    fn distance_to(&self, other: &Point3) -> f64 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        let dz = self.z - other.z;
        (dx * dx + dy * dy + dz * dz).sqrt()
    }
}`,

  String.raw`#[derive(Debug, Clone, Copy, PartialEq)]
struct Rectangle {
    width: f64,
    height: f64,
}`,

  String.raw`impl Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn contains(&self, x: f64, y: f64) -> bool {
        x >= 0.0 && x <= self.width && y >= 0.0 && y <= self.height
    }
}`,

  String.raw`#[derive(Debug, Clone)]
enum Transaction {
    Deposit { amount_cents: u64, description: String },
    Withdrawal { amount_cents: u64, description: String },
    Transfer { amount_cents: u64, from_account: u64, to_account: u64 },
}`,

  String.raw`#[derive(Debug, Clone, Copy, PartialEq)]
enum PaymentMethod {
    Card,
    BankTransfer,
    Crypto,
}`,

  String.raw`#[derive(Debug, Clone, Copy, PartialEq)]
enum Direction {
    North,
    East,
    South,
    West,
}`,

  String.raw`// Session token with expiry in unix seconds, bound to one user.
#[derive(Debug, Clone)]
struct Session {
    token: String,
    user_id: u64,
    expires_at: u64,
}`,

  String.raw`#[derive(Debug, Clone)]
struct Metric {
    name: String,
    value: f64,
    labels: std::collections::HashMap<String, String>,
}`,

  String.raw`// Structured log line: severity level, free-form message, unix timestamp.
#[derive(Debug, Clone)]
struct LogEntry {
    level: String,
    message: String,
    ts: u64,
}`,
];
// total: 22
