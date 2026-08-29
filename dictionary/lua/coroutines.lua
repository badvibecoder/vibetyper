-- make_counter yields the integers starting at start.
local function make_counter(start)
	local i = start or 0
	return coroutine.wrap(function()
		while true do
			coroutine.yield(i)
			i = i + 1
		end
	end)
end

-- make_range yields the integers from first to last inclusive.
local function make_range(first, last, step)
	step = step or 1
	return coroutine.wrap(function()
		for i = first, last, step do
			coroutine.yield(i)
		end
	end)
end

-- make_fib yields the Fibonacci sequence forever.
local function make_fib()
	return coroutine.wrap(function()
		local a, b = 0, 1
		while true do
			coroutine.yield(a)
			a, b = b, a + b
		end
	end)
end

-- take_n yields the first n values produced by a generator.
local function take_n(generator, n)
	return coroutine.wrap(function()
		for i = 1, n do
			local value = generator()
			if value == nil then
				return
			end
			coroutine.yield(value)
		end
	end)
end

-- enumerate wraps a generator, yielding index and value pairs.
local function enumerate(generator)
	return coroutine.wrap(function()
		local index = 1
		while true do
			local value = generator()
			if value == nil then
				return
			end
			coroutine.yield(index, value)
			index = index + 1
		end
	end)
end

-- filter_gen yields only the values that satisfy a predicate.
local function filter_gen(generator, predicate)
	return coroutine.wrap(function()
		while true do
			local value = generator()
			if value == nil then
				return
			end
			if predicate(value) then
				coroutine.yield(value)
			end
		end
	end)
end

-- map_gen transforms every value a generator produces.
local function map_gen(generator, fn)
	return coroutine.wrap(function()
		while true do
			local value = generator()
			if value == nil then
				return
			end
			coroutine.yield(fn(value))
		end
	end)
end

-- reduce_gen folds a generator's values into a single result.
local function reduce_gen(generator, fn, initial)
	local acc = initial
	while true do
		local value = generator()
		if value == nil then
			return acc
		end
		acc = fn(acc, value)
	end
end

-- chain_gens yields the values of each generator in sequence.
local function chain_gens(...)
	local gens = { ... }
	return coroutine.wrap(function()
		for _, gen in ipairs(gens) do
			while true do
				local value = gen()
				if value == nil then
					break
				end
				coroutine.yield(value)
			end
		end
	end)
end

-- interleave_gens alternates values from two generators.
local function interleave_gens(a, b)
	return coroutine.wrap(function()
		while true do
			local va = a()
			local vb = b()
			if va == nil and vb == nil then
				return
			end
			if va ~= nil then
				coroutine.yield(va)
			end
			if vb ~= nil then
				coroutine.yield(vb)
			end
		end
	end)
end

-- zip_gens yields pairs of values from two generators.
local function zip_gens(a, b)
	return coroutine.wrap(function()
		while true do
			local va = a()
			local vb = b()
			if va == nil or vb == nil then
				return
			end
			coroutine.yield(va, vb)
		end
	end)
end

-- generator_to_table drains a generator into a list.
local function generator_to_table(generator)
	local result = {}
	while true do
		local value = generator()
		if value == nil then
			return result
		end
		result[#result + 1] = value
	end
end

-- make_lines yields the lines of a string one by one.
local function make_lines(text)
	return coroutine.wrap(function()
		for line in text:gmatch("[^\n]*") do
			coroutine.yield(line)
		end
	end)
end

-- producer_consumer pumps values through a coroutine stage.
local function producer_consumer(source, transform)
	return coroutine.wrap(function()
		while true do
			local value = source()
			if value == nil then
				return
			end
			coroutine.yield(transform(value))
		end
	end)
end

-- batch_processor yields the input list in batches of size n.
local function batch_processor(values, n)
	return coroutine.wrap(function()
		for i = 1, #values, n do
			local batch = {}
			for j = i, math.min(i + n - 1, #values) do
				batch[#batch + 1] = values[j]
			end
			coroutine.yield(batch)
		end
	end)
end

-- make_timer yields elapsed seconds since the generator started.
local function make_timer()
	local start = os.clock()
	return coroutine.wrap(function()
		while true do
			coroutine.yield(os.clock() - start)
		end
	end)
end

-- make_powers yields n ^ exponent for increasing exponents.
local function make_powers(base)
	return coroutine.wrap(function()
		local value = 1
		while true do
			coroutine.yield(value)
			value = value * base
		end
	end)
end

-- make_permutations yields all permutations of a small list.
local function make_permutations(values)
	local n = #values
	return coroutine.wrap(function()
		local function permute(k)
			if k == n then
				local copy = {}
				for i, v in ipairs(values) do
					copy[i] = v
				end
				coroutine.yield(copy)
				return
			end
			for i = k, n do
				values[k], values[i] = values[i], values[k]
				permute(k + 1)
				values[k], values[i] = values[i], values[k]
			end
		end
		permute(1)
	end)
end

-- run_scheduler round-robins a set of coroutine tasks until they finish.
local function run_scheduler(tasks)
	local step = 0
	while #tasks > 0 do
		local task = table.remove(tasks, 1)
		local ok = coroutine.resume(task, step)
		step = step + 1
		if ok and coroutine.status(task) ~= "dead" then
			tasks[#tasks + 1] = task
		end
	end
	return step
end

-- run_with_budget resumes a generator until a time budget runs out.
local function run_with_budget(generator, max_seconds)
	local start = os.clock()
	local result = {}
	while os.clock() - start < max_seconds do
		local value = generator()
		if value == nil then
			break
		end
		result[#result + 1] = value
	end
	return result
end

-- make_collatz yields the Collatz sequence from n until it reaches 1.
local function make_collatz(n)
	return coroutine.wrap(function()
		local current = n
		while current ~= 1 do
			coroutine.yield(current)
			if current % 2 == 0 then
				current = current / 2
			else
				current = 3 * current + 1
			end
		end
		coroutine.yield(1)
	end)
end
