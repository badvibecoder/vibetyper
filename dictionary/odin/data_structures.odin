package data_structures

Queue :: struct {
	items: [dynamic]int,
	head:  int,
}

Node :: struct {
	value: int,
	next:  ^Node,
}

TreeNode :: struct {
	value: int,
	left:  ^TreeNode,
	right: ^TreeNode,
}

// stack_push places a value on top of a slice-backed stack.
stack_push :: proc(stack: ^[dynamic]int, value: int) {
	append(stack, value)
}

// stack_pop removes and returns the top value, if any.
stack_pop :: proc(stack: ^[dynamic]int) -> (int, bool) {
	if len(stack^) == 0 {
		return 0, false
	}
	top := stack[len(stack^) - 1]
	pop(stack)
	return top, true
}

// stack_peek returns the top value without removing it.
stack_peek :: proc(stack: ^[dynamic]int) -> (int, bool) {
	if len(stack^) == 0 {
		return 0, false
	}
	return stack[len(stack^) - 1], true
}

// stack_is_empty reports whether a stack has no elements.
stack_is_empty :: proc(stack: ^[dynamic]int) -> bool {
	return len(stack^) == 0
}

// queue_enqueue appends an item to a queue's backing slice.
queue_enqueue :: proc(queue: ^Queue, value: int) {
	append(&queue.items, value)
}

// queue_dequeue removes the oldest item from the queue.
queue_dequeue :: proc(queue: ^Queue) -> (int, bool) {
	if queue.head >= len(queue.items) {
		return 0, false
	}
	value := queue.items[queue.head]
	queue.head += 1
	if queue.head > 1024 && queue.head * 2 > len(queue.items) {
		queue.items = queue.items[queue.head:]
		queue.head = 0
	}
	return value, true
}

// queue_peek inspects the oldest item without removing it.
queue_peek :: proc(queue: ^Queue) -> (int, bool) {
	if queue.head >= len(queue.items) {
		return 0, false
	}
	return queue.items[queue.head], true
}

// list_append adds a node to the end of a singly linked list.
list_append :: proc(head: ^Node, value: int) -> ^Node {
	node := new(Node)
	node.value = value
	if head == nil {
		return node
	}
	current := head
	for current.next != nil {
		current = current.next
	}
	current.next = node
	return head
}

// list_find locates the first node holding a value.
list_find :: proc(head: ^Node, value: int) -> ^Node {
	current := head
	for current != nil {
		if current.value == value {
			return current
		}
		current = current.next
	}
	return nil
}

// list_remove deletes the first node holding a value.
list_remove :: proc(head: ^Node, value: int) -> ^Node {
	dummy := new(Node)
	dummy.next = head
	prev := dummy
	current := head
	for current != nil {
		if current.value == value {
			prev.next = current.next
			free(current)
			break
		}
		prev = current
		current = current.next
	}
	return dummy.next
}

// list_length counts the nodes in a linked list.
list_length :: proc(head: ^Node) -> int {
	count := 0
	for current := head; current != nil; current = current.next {
		count += 1
	}
	return count
}

// list_reverse reverses a linked list in place.
list_reverse :: proc(head: ^Node) -> ^Node {
	var prev: ^Node
	current := head
	for current != nil {
		next := current.next
		current.next = prev
		prev = current
		current = next
	}
	return prev
}

// tree_insert adds a value to a binary search tree.
tree_insert :: proc(root: ^TreeNode, value: int) -> ^TreeNode {
	if root == nil {
		node := new(TreeNode)
		node.value = value
		return node
	}
	if value < root.value {
		root.left = tree_insert(root.left, value)
	} else if value > root.value {
		root.right = tree_insert(root.right, value)
	}
	return root
}

// tree_search looks up a value in a binary search tree.
tree_search :: proc(root: ^TreeNode, value: int) -> ^TreeNode {
	current := root
	for current != nil {
		if value == current.value {
			return current
		}
		if value < current.value {
			current = current.left
		} else {
			current = current.right
		}
	}
	return nil
}

// tree_min returns the smallest value in the tree.
tree_min :: proc(root: ^TreeNode) -> (int, bool) {
	if root == nil {
		return 0, false
	}
	current := root
	for current.left != nil {
		current = current.left
	}
	return current.value, true
}

// tree_max returns the largest value in the tree.
tree_max :: proc(root: ^TreeNode) -> (int, bool) {
	if root == nil {
		return 0, false
	}
	current := root
	for current.right != nil {
		current = current.right
	}
	return current.value, true
}

// tree_height measures the longest root-to-leaf path.
tree_height :: proc(root: ^TreeNode) -> int {
	if root == nil {
		return 0
	}
	return 1 + max(tree_height(root.left), tree_height(root.right))
}

// tree_inorder collects values in sorted order.
tree_inorder :: proc(root: ^TreeNode) -> []int {
	result := make([dynamic]int)
	defer delete(result)
	collect_inorder(root, &result)
	return result[:]
}

// collect_inorder walks a tree in order, appending node values.
collect_inorder :: proc(root: ^TreeNode, result: ^[dynamic]int) {
	if root == nil {
		return
	}
	collect_inorder(root.left, result)
	append(result, root.value)
	collect_inorder(root.right, result)
}

// heap_push inserts a value into a binary min-heap.
heap_push :: proc(heap: ^[dynamic]int, value: int) {
	append(heap, value)
	i := len(heap^) - 1
	for i > 0 {
		parent := (i - 1) / 2
		if heap[parent] <= heap[i] {
			break
		}
		heap[parent], heap[i] = heap[i], heap[parent]
		i = parent
	}
}

// heap_pop removes the minimum value from a binary min-heap.
heap_pop :: proc(heap: ^[dynamic]int) -> (int, bool) {
	if len(heap^) == 0 {
		return 0, false
	}
	top := heap[0]
	last := pop(heap)
	if len(heap^) > 0 {
		heap[0] = last
		sift_down(heap, 0)
	}
	return top, true
}

// heap_peek returns the minimum without removing it.
heap_peek :: proc(heap: ^[dynamic]int) -> (int, bool) {
	if len(heap^) == 0 {
		return 0, false
	}
	return heap[0], true
}
