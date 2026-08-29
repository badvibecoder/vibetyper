/*
 * Domain models: classes for users, orders, accounts, and reusable
 * infrastructure objects like rate limiters and caches.
 */

export class User {
  constructor(id, username, email) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.roles = [];
  }

  hasRole(role) {
    return this.roles.includes(role);
  }

  addRole(role) {
    if (!this.roles.includes(role)) this.roles.push(role);
  }
}

export class Address {
  constructor(street, city, zipCode, country = 'US') {
    this.street = street;
    this.city = city;
    this.zipCode = zipCode;
    this.country = country;
  }

  format() {
    return this.street + ', ' + this.city + ' ' + this.zipCode + ', ' + this.country;
  }
}

export class LineItem {
  constructor(sku, name, price, quantity = 1) {
    this.sku = sku;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }

  total() {
    return this.price * this.quantity;
  }
}

export class Order {
  constructor(orderId, customerId) {
    this.orderId = orderId;
    this.customerId = customerId;
    this.items = [];
    this.status = 'pending';
  }

  addItem(item) {
    this.items.push(item);
  }

  subtotal() {
    return this.items.reduce((total, item) => total + item.total(), 0);
  }

  markShipped() {
    if (this.status === 'pending' || this.status === 'paid') {
      this.status = 'shipped';
    }
  }
}

export class Session {
  constructor(userId, token, expiresAt) {
    this.userId = userId;
    this.token = token;
    this.expiresAt = expiresAt;
    this.createdAt = new Date();
  }

  isExpired(now = new Date()) {
    return now >= this.expiresAt;
  }
}

export class InventoryItem {
  constructor(sku, onHand, lowThreshold = 5) {
    this.sku = sku;
    this.onHand = onHand;
    this.lowThreshold = lowThreshold;
  }

  get available() {
    return Math.max(0, this.onHand);
  }

  get status() {
    if (this.onHand <= 0) return 'out-of-stock';
    if (this.onHand <= this.lowThreshold) return 'low';
    return 'in-stock';
  }

  restock(quantity) {
    this.onHand += quantity;
  }
}

export class Account {
  constructor(owner, initialBalance = 0) {
    this.owner = owner;
    this.balance = initialBalance;
    this.transactions = [];
  }

  deposit(amount) {
    if (amount <= 0) throw new Error('deposit must be positive');
    this.balance += amount;
    this.transactions.push({ type: 'deposit', amount, at: new Date() });
  }

  withdraw(amount) {
    if (amount <= 0) throw new Error('withdrawal must be positive');
    if (amount > this.balance) throw new Error('insufficient funds');
    this.balance -= amount;
    this.transactions.push({ type: 'withdraw', amount, at: new Date() });
  }
}

export class Project {
  constructor(name, dueDate) {
    this.name = name;
    this.dueDate = dueDate;
    this.tasks = [];
    this.archived = false;
  }

  addTask(task) {
    this.tasks.push(task);
  }

  progress() {
    if (this.tasks.length === 0) return 0;
    const done = this.tasks.filter((task) => task.completed).length;
    return Math.round((done / this.tasks.length) * 100);
  }

  archive() {
    this.archived = true;
  }
}

export class Task {
  constructor(title, assignee) {
    this.title = title;
    this.assignee = assignee;
    this.completed = false;
    this.priority = 'normal';
    this.tags = [];
  }

  complete() {
    this.completed = true;
  }

  tag(...names) {
    this.tags.push(...names);
  }
}

export class Stopwatch {
  constructor() {
    this.startedAt = null;
    this.laps = [];
  }

  start() {
    this.startedAt = Date.now();
    return this;
  }

  lap() {
    if (this.startedAt === null) throw new Error('stopwatch is not running');
    const now = Date.now();
    const previous = this.laps[this.laps.length - 1] || this.startedAt;
    this.laps.push(now - previous);
    return this.laps[this.laps.length - 1];
  }

  elapsed() {
    if (this.startedAt === null) return 0;
    return Date.now() - this.startedAt;
  }
}

export class Page {
  constructor(items, pageNumber, pageSize, total) {
    this.items = items;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.total = total;
  }

  get hasMore() {
    return this.pageNumber * this.pageSize < this.total;
  }

  get totalPages() {
    return Math.ceil(this.total / this.pageSize);
  }
}

export class Result {
  constructor(ok, value = null, error = null) {
    this.ok = ok;
    this.value = value;
    this.error = error;
  }

  static success(value) {
    return new Result(true, value);
  }

  static failure(error) {
    return new Result(false, null, error);
  }

  unwrap() {
    if (!this.ok) throw this.error;
    return this.value;
  }
}

export class GeoPoint {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  distanceTo(other) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadius = 6371;
    const deltaLat = toRadians(other.latitude - this.latitude);
    const deltaLon = toRadians(other.longitude - this.longitude);
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(toRadians(this.latitude)) * Math.cos(toRadians(other.latitude)) *
      Math.sin(deltaLon / 2) ** 2;
    return 2 * earthRadius * Math.asin(Math.sqrt(a));
  }
}

export class ConfigStore {
  constructor(defaults = {}) {
    this.values = { ...defaults };
  }

  get(key, fallback) {
    return this.values[key] !== undefined ? this.values[key] : fallback;
  }

  set(key, value) {
    this.values[key] = value;
  }

  snapshot() {
    return { ...this.values };
  }
}

export class Logger {
  constructor(level = 'info') {
    this.level = level;
    const order = ['debug', 'info', 'warn', 'error'];
    this.threshold = order.indexOf(level);
  }

  log(level, message, extra = {}) {
    const order = ['debug', 'info', 'warn', 'error'];
    if (order.indexOf(level) < this.threshold) return;
    const line = new Date().toISOString() + ' [' + level + '] ' + message;
    if (extra && Object.keys(extra).length > 0) {
      console.log(line, extra);
    } else {
      console.log(line);
    }
  }

  debug(message, extra) { this.log('debug', message, extra); }
  info(message, extra) { this.log('info', message, extra); }
  warn(message, extra) { this.log('warn', message, extra); }
  error(message, extra) { this.log('error', message, extra); }
}

export class RateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = [];
  }

  allow() {
    const now = Date.now();
    this.requests = this.requests.filter((stamp) => now - stamp < this.windowMs);
    if (this.requests.length >= this.limit) return false;
    this.requests.push(now);
    return true;
  }

  remaining() {
    const now = Date.now();
    this.requests = this.requests.filter((stamp) => now - stamp < this.windowMs);
    return Math.max(0, this.limit - this.requests.length);
  }
}

export class Cache {
  constructor(maxEntries = 100) {
    this.maxEntries = maxEntries;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.maxEntries) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
  }
}

export class Emitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index !== -1) handlers.splice(index, 1);
  }

  emit(event, payload) {
    for (const handler of this.listeners.get(event) || []) {
      handler(payload);
    }
  }
}

export class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  get size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

export class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  get size() {
    return this.items.length;
  }
}

export class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  push(item, priority) {
    this.heap.push({ item, priority });
    this.heap.sort((a, b) => a.priority - b.priority);
  }

  pop() {
    const entry = this.heap.shift();
    return entry ? entry.item : undefined;
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0].item : undefined;
  }

  get size() {
    return this.heap.length;
  }
}

export class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }

  toFahrenheit() {
    return (this.celsius * 9) / 5 + 32;
  }

  toKelvin() {
    return this.celsius + 273.15;
  }

  static fromFahrenheit(fahrenheit) {
    return new Temperature(((fahrenheit - 32) * 5) / 9);
  }
}
