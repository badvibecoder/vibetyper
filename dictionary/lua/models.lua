-- new_user builds a User record with sane defaults.
local function new_user(name, email, role)
	return {
		name = name,
		email = email,
		role = role or "viewer",
		active = true,
	}
end

-- validate_user checks the invariants of a User record.
local function validate_user(user)
	if #user.name < 2 then
		return false, "name too short"
	end
	if not user.email:find("@") then
		return false, "invalid email"
	end
	if user.role ~= "admin" and user.role ~= "editor" and user.role ~= "viewer" then
		return false, "unknown role"
	end
	return true
end

-- describe_user renders a User as a one-line summary.
local function describe_user(user)
	local state = user.active and "active" or "inactive"
	return string.format("%s <%s> [%s, %s]", user.name, user.email, user.role, state)
end

-- new_order creates an Order in the pending state.
local function new_order(customer)
	return {
		customer = customer,
		items = {},
		total_cents = 0,
		status = "pending",
	}
end

-- validate_order ensures an Order is shippable.
local function validate_order(order)
	if #order.items == 0 then
		return false, "empty order"
	end
	if order.total_cents <= 0 then
		return false, "zero total"
	end
	if order.status ~= "pending" and order.status ~= "paid" and order.status ~= "shipped" then
		return false, "bad status"
	end
	return true
end

-- describe_order summarises an order for a receipt line.
local function describe_order(order)
	local money = string.format("$%d.%02d", math.floor(order.total_cents / 100), order.total_cents % 100)
	return string.format(
		"Order for %s: %d items, %s, %s",
		order.customer,
		#order.items,
		money,
		order.status
	)
end

-- new_product creates a Product with zero stock.
local function new_product(sku, name, price_cents)
	return {
		sku = sku,
		name = name,
		price_cents = price_cents,
		stock = 0,
	}
end

-- validate_product checks catalog invariants for a Product.
local function validate_product(product)
	if #product.sku < 3 then
		return false, "sku too short"
	end
	if product.price_cents <= 0 then
		return false, "price must be positive"
	end
	if product.stock < 0 then
		return false, "negative stock"
	end
	return true
end

-- describe_product formats a catalog line for a product.
local function describe_product(product)
	return string.format("%s  %-30s %s", product.sku, product.name, format_money(product.price_cents))
end

-- new_booking creates a pending reservation.
local function new_booking(resource, date, start_hour, end_hour)
	return {
		resource = resource,
		date = date,
		start_hour = start_hour,
		end_hour = end_hour,
		status = "pending",
	}
end

-- validate_booking checks that a booking window is sane.
local function validate_booking(booking)
	if booking.end_hour <= booking.start_hour then
		return false, "window must end after it starts"
	end
	if booking.start_hour < 0 or booking.end_hour > 24 then
		return false, "hour out of range"
	end
	if not booking.date:match("^%d%d%d%d%-%d%d%-%d%d$") then
		return false, "invalid date"
	end
	return true
end

-- describe_booking renders a booking as a calendar line.
local function describe_booking(booking)
	return string.format(
		"%s  %02d:00-%02d:00  %s",
		booking.date,
		booking.start_hour,
		booking.end_hour,
		booking.resource
	)
end

-- new_task creates a backlog task with default priority.
local function new_task(title, assignee)
	return {
		title = title,
		assignee = assignee,
		priority = 3,
		estimate = 1,
		status = "backlog",
	}
end

-- validate_task checks that a task can be scheduled.
local function validate_task(task)
	if #task.title == 0 then
		return false, "title required"
	end
	if task.priority < 1 or task.priority > 5 then
		return false, "priority must be 1..5"
	end
	if task.estimate < 1 then
		return false, "estimate must be positive"
	end
	return true
end

-- describe_task summarises a task for a sprint board.
local function describe_task(task)
	return string.format("[P%d] %s (est %dd, %s)", task.priority, task.title, task.estimate, task.status)
end

-- new_account opens an account with an opening deposit.
local function new_account(owner, opening_balance)
	return {
		owner = owner,
		balance = opening_balance,
		limit = 100000,
		currency = "USD",
	}
end

-- validate_account ensures account fields are coherent.
local function validate_account(account)
	if #account.owner == 0 then
		return false, "owner required"
	end
	if account.balance < 0 then
		return false, "negative balance"
	end
	if account.limit < 0 then
		return false, "negative limit"
	end
	return true
end

-- describe_account renders an account for a statement header.
local function describe_account(account)
	return string.format("%s: %s %s", account.owner, format_money(account.balance), account.currency)
end

-- new_invoice computes tax and total for a subtotal.
local function new_invoice(number, order_id, subtotal, tax_rate)
	local tax = math.floor(subtotal * tax_rate)
	return {
		number = number,
		order_id = order_id,
		subtotal = subtotal,
		tax = tax,
		total = subtotal + tax,
		paid = false,
	}
end

-- validate_invoice checks that an invoice balances.
local function validate_invoice(invoice)
	if invoice.total ~= invoice.subtotal + invoice.tax then
		return false, "total does not balance"
	end
	if invoice.subtotal < 0 or invoice.tax < 0 then
		return false, "negative amount"
	end
	return true
end

-- describe_invoice summarises an invoice for a payment list.
local function describe_invoice(invoice)
	local money = string.format("$%d.%02d", math.floor(invoice.total / 100), invoice.total % 100)
	local state = invoice.paid and "paid" or "open"
	return string.format("%s #%d: %s (%s)", invoice.number, invoice.order_id, money, state)
end
