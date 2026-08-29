-- stack_new creates an empty stack backed by a list.
local function stack_new()
	return {}
end

-- stack_push places a value on top of the stack.
local function stack_push(stack, value)
	stack[#stack + 1] = value
end

-- stack_pop removes and returns the top value, if any.
local function stack_pop(stack)
	if #stack == 0 then
		return nil
	end
	return table.remove(stack)
end

-- stack_peek returns the top value without removing it.
local function stack_peek(stack)
	return stack[#stack]
end

-- queue_new creates an empty queue.
local function queue_new()
	return { items = {}, head = 1 }
end

-- queue_push appends an item to the back of the queue.
local function queue_push(queue, value)
	queue.items[#queue.items + 1] = value
end

-- queue_pop removes the oldest item from the front of the queue.
local function queue_pop(queue)
	if queue.head > #queue.items then
		return nil
	end
	local value = queue.items[queue.head]
	queue.items[queue.head] = nil
	queue.head = queue.head + 1
	if queue.head > 256 then
		local compact = {}
		for i = queue.head, #queue.items do
			compact[#compact + 1] = queue.items[i]
		end
		queue.items = compact
		queue.head = 1
	end
	return value
end

-- deque_push_front inserts a value at the head of a deque.
local function deque_push_front(deque, value)
	table.insert(deque, 1, value)
end

-- deque_pop_back removes the value at the tail of a deque.
local function deque_pop_back(deque)
	return table.remove(deque)
end

-- list_push prepends a node to a linked list.
local function list_push(head, value)
	return { value = value, next = head }
end

-- list_find locates the first node holding a value.
local function list_find(head, value)
	local current = head
	while current do
		if current.value == value then
			return current
		end
		current = current.next
	end
	return nil
end

-- list_length counts the nodes in a linked list.
local function list_length(head)
	local count = 0
	local current = head
	while current do
		count = count + 1
		current = current.next
	end
	return count
end

-- list_reverse reverses a linked list in place.
local function list_reverse(head)
	local prev = nil
	local current = head
	while current do
		local next = current.next
		current.next = prev
		prev = current
		current = next
	end
	return prev
end

-- bst_insert adds a value to a binary search tree.
local function bst_insert(root, value)
	if not root then
		return { value = value }
	end
	if value < root.value then
		root.left = bst_insert(root.left, value)
	elseif value > root.value then
		root.right = bst_insert(root.right, value)
	end
	return root
end

-- bst_search looks up a value in a binary search tree.
local function bst_search(root, value)
	local current = root
	while current do
		if value == current.value then
			return current
		end
		if value < current.value then
			current = current.left
		else
			current = current.right
		end
	end
	return nil
end

-- bst_min returns the smallest value in the tree.
local function bst_min(root)
	local current = root
	while current and current.left do
		current = current.left
	end
	return current and current.value
end

-- bst_height measures the longest root-to-leaf path.
local function bst_height(root)
	if not root then
		return 0
	end
	return 1 + math.max(bst_height(root.left), bst_height(root.right))
end

-- bst_inorder collects values in sorted order.
local function bst_inorder(root)
	local result = {}
	local function walk(node)
		if not node then
			return
		end
		walk(node.left)
		result[#result + 1] = node.value
		walk(node.right)
	end
	walk(root)
	return result
end

-- heap_push inserts a value into a binary min-heap.
local function heap_push(heap, value)
	heap[#heap + 1] = value
	local i = #heap
	while i > 1 do
		local parent = math.floor(i / 2)
		if heap[parent] <= heap[i] then
			break
		end
		heap[parent], heap[i] = heap[i], heap[parent]
		i = parent
	end
end

-- heap_pop removes the minimum value from a binary min-heap.
local function heap_pop(heap)
	if #heap == 0 then
		return nil
	end
	local top = heap[1]
	local last = table.remove(heap)
	if #heap > 0 then
		heap[1] = last
		local i = 1
		while true do
			local left, right = i * 2, i * 2 + 1
			local smallest = i
			if left <= #heap and heap[left] < heap[smallest] then
				smallest = left
			end
			if right <= #heap and heap[right] < heap[smallest] then
				smallest = right
			end
			if smallest == i then
				break
			end
			heap[i], heap[smallest] = heap[smallest], heap[i]
			i = smallest
		end
	end
	return top
end

-- heap_peek returns the minimum value without removing it.
local function heap_peek(heap)
	return heap[1]
end
