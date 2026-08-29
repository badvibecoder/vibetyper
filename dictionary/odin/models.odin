package models

// User models a registered account holder.
User :: struct {
	id:        int,
	name:      string,
	email:     string,
	role:      string,
	is_active: bool,
}

// new_user builds a User with sane defaults.
new_user :: proc(name, email, role: string) -> User {
	return User {
		id        = 0,
		name      = name,
		email     = email,
		role      = role,
		is_active = true,
	}
}

// validate_user checks the invariants of a User record.
validate_user :: proc(user: User) -> (bool, string) {
	if len(user.name) < 2 {
		return false, "name too short"
	}
	if !is_email(user.email) {
		return false, "invalid email"
	}
	if user.role != "admin" && user.role != "editor" && user.role != "viewer" {
		return false, "unknown role"
	}
	return true, ""
}

// Order records a customer purchase with line item count.
Order :: struct {
	id:         int,
	customer:   string,
	item_count: int,
	total_cents: int,
	status:     string,
}

// new_order creates an Order in the pending state.
new_order :: proc(customer: string) -> Order {
	return Order {
		id          = 0,
		customer    = customer,
		item_count  = 0,
		total_cents = 0,
		status      = "pending",
	}
}

// validate_order ensures an Order is shippable.
validate_order :: proc(order: Order) -> (bool, string) {
	if order.item_count < 1 {
		return false, "empty order"
	}
	if order.total_cents <= 0 {
		return false, "zero total"
	}
	if order.status != "pending" && order.status != "paid" && order.status != "shipped" {
		return false, "bad status"
	}
	return true, ""
}

// Product describes an item in the catalog.
Product :: struct {
	sku:         string,
	name:        string,
	price_cents: int,
	stock:       int,
	weight_g:    int,
}

// new_product creates a Product with zero stock.
new_product :: proc(sku, name: string, price_cents: int) -> Product {
	return Product {
		sku         = sku,
		name        = name,
		price_cents = price_cents,
		stock       = 0,
		weight_g    = 0,
	}
}

// validate_product checks catalog invariants for a Product.
validate_product :: proc(product: Product) -> (bool, string) {
	if len(product.sku) < 3 {
		return false, "sku too short"
	}
	if product.price_cents <= 0 {
		return false, "price must be positive"
	}
	if product.stock < 0 || product.weight_g < 0 {
		return false, "negative quantity"
	}
	return true, ""
}

// Invoice aggregates billed line amounts for an order.
Invoice :: struct {
	number:       string,
	order_id:     int,
	subtotal:     int,
	tax:          int,
	total:        int,
	is_paid:      bool,
}

// new_invoice computes tax and total for a subtotal.
new_invoice :: proc(number: string, order_id, subtotal: int, tax_rate: f64) -> Invoice {
	tax := int(f64(subtotal) * tax_rate)
	return Invoice {
		number   = number,
		order_id = order_id,
		subtotal = subtotal,
		tax      = tax,
		total    = subtotal + tax,
		is_paid  = false,
	}
}

// validate_invoice checks that an invoice balances.
validate_invoice :: proc(invoice: Invoice) -> (bool, string) {
	if invoice.total != invoice.subtotal + invoice.tax {
		return false, "total does not balance"
	}
	if invoice.subtotal < 0 || invoice.tax < 0 {
		return false, "negative amount"
	}
	return true, ""
}

// Account holds a balance and a daily transaction limit.
Account :: struct {
	id:        int,
	owner:     string,
	balance:   int,
	limit:     int,
	currency:  string,
}

// new_account opens an account with an opening deposit.
new_account :: proc(owner: string, opening_balance: int) -> Account {
	return Account {
		id       = 0,
		owner    = owner,
		balance  = opening_balance,
		limit    = 1_000_00,
		currency = "USD",
	}
}

// validate_account ensures account fields are coherent.
validate_account :: proc(account: Account) -> (bool, string) {
	if len(account.owner) == 0 {
		return false, "owner required"
	}
	if account.balance < 0 {
		return false, "negative balance"
	}
	if account.limit < 0 {
		return false, "negative limit"
	}
	return true, ""
}

// Booking reserves a resource for a time window.
Booking :: struct {
	id:          int,
	resource:    string,
	date:        string,
	start_hour:  int,
	end_hour:    int,
	status:      string,
}

// new_booking creates a pending reservation.
new_booking :: proc(resource, date: string, start_hour, end_hour: int) -> Booking {
	return Booking {
		id         = 0,
		resource   = resource,
		date       = date,
		start_hour = start_hour,
		end_hour   = end_hour,
		status     = "pending",
	}
}

// validate_booking checks that a booking window is sane.
validate_booking :: proc(booking: Booking) -> (bool, string) {
	if booking.end_hour <= booking.start_hour {
		return false, "window must end after it starts"
	}
	if booking.start_hour < 0 || booking.end_hour > 24 {
		return false, "hour out of range"
	}
	if len(booking.date) != 10 {
		return false, "invalid date"
	}
	return true, ""
}

// Task represents a unit of work with priority and effort.
Task :: struct {
	id:          int,
	title:       string,
	priority:    int,
	estimate:    int,
	status:      string,
	assignee:    string,
}

// new_task creates a backlog task with default priority.
new_task :: proc(title, assignee: string) -> Task {
	return Task {
		id       = 0,
		title    = title,
		priority = 3,
		estimate = 1,
		status   = "backlog",
		assignee = assignee,
	}
}

// validate_task checks that a task can be scheduled.
validate_task :: proc(task: Task) -> (bool, string) {
	if len(task.title) == 0 {
		return false, "title required"
	}
	if task.priority < 1 || task.priority > 5 {
		return false, "priority must be 1..5"
	}
	if task.estimate < 1 {
		return false, "estimate must be positive"
	}
	return true, ""
}
