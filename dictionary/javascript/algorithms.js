/*
 * Classic algorithms: searching, sorting, graph traversal, and dynamic
 * programming solutions implemented cleanly and without dependencies.
 */

export function binarySearch(sorted, target) {
  let low = 0;
  let high = sorted.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (sorted[middle] === target) return middle;
    if (sorted[middle] < target) low = middle + 1;
    else high = middle - 1;
  }
  return -1;
}

export function linearSearch(items, target) {
  for (let index = 0; index < items.length; index += 1) {
    if (items[index] === target) return index;
  }
  return -1;
}

export function mergeSorted(first, second) {
  const merged = [];
  let i = 0;
  let j = 0;
  while (i < first.length && j < second.length) {
    if (first[i] <= second[j]) merged.push(first[i++]);
    else merged.push(second[j++]);
  }
  return merged.concat(first.slice(i), second.slice(j));
}

export function quickSort(array) {
  if (array.length <= 1) return array;
  const pivot = array[Math.floor(array.length / 2)];
  const less = [];
  const equal = [];
  const greater = [];
  for (const value of array) {
    if (value < pivot) less.push(value);
    else if (value > pivot) greater.push(value);
    else equal.push(value);
  }
  return [...quickSort(less), ...equal, ...quickSort(greater)];
}

export function insertionSort(array) {
  const result = [...array];
  for (let index = 1; index < result.length; index += 1) {
    const value = result[index];
    let position = index - 1;
    while (position >= 0 && result[position] > value) {
      result[position + 1] = result[position];
      position -= 1;
    }
    result[position + 1] = value;
  }
  return result;
}

export function selectionSort(array) {
  const result = [...array];
  for (let index = 0; index < result.length - 1; index += 1) {
    let smallest = index;
    for (let cursor = index + 1; cursor < result.length; cursor += 1) {
      if (result[cursor] < result[smallest]) smallest = cursor;
    }
    if (smallest !== index) {
      [result[index], result[smallest]] = [result[smallest], result[index]];
    }
  }
  return result;
}

export function twoSum(nums, target) {
  const seen = new Map();
  for (let index = 0; index < nums.length; index += 1) {
    const complement = target - nums[index];
    if (seen.has(complement)) return [seen.get(complement), index];
    seen.set(nums[index], index);
  }
  return [];
}

export function longestCommonPrefix(strings) {
  if (strings.length === 0) return '';
  let prefix = strings[0];
  for (const value of strings.slice(1)) {
    while (!value.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix === '') return '';
    }
  }
  return prefix;
}

export function levenshteinDistance(first, second) {
  const rows = first.length + 1;
  const cols = second.length + 1;
  const table = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let row = 0; row < rows; row += 1) table[row][0] = row;
  for (let col = 0; col < cols; col += 1) table[0][col] = col;
  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = first[row - 1] === second[col - 1] ? 0 : 1;
      table[row][col] = Math.min(
        table[row - 1][col] + 1,
        table[row][col - 1] + 1,
        table[row - 1][col - 1] + cost
      );
    }
  }
  return table[first.length][second.length];
}

export function isAnagram(first, second) {
  const normalize = (text) => text.toLowerCase().split('').sort().join('');
  return normalize(first) === normalize(second);
}

export function missingNumber(nums) {
  const length = nums.length;
  const expected = (length * (length + 1)) / 2;
  const actual = nums.reduce((total, value) => total + value, 0);
  return expected - actual;
}

export function majorityElement(nums) {
  let candidate = null;
  let count = 0;
  for (const value of nums) {
    if (count === 0) {
      candidate = value;
      count = 1;
    } else if (value === candidate) {
      count += 1;
    } else {
      count -= 1;
    }
  }
  return candidate;
}

export function maxSubarraySum(nums) {
  let best = nums[0];
  let current = nums[0];
  for (let index = 1; index < nums.length; index += 1) {
    current = Math.max(nums[index], current + nums[index]);
    best = Math.max(best, current);
  }
  return best;
}

export function mergeIntervals(intervals) {
  const ordered = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const interval of ordered) {
    const last = merged[merged.length - 1];
    if (last && interval[0] <= last[1]) {
      last[1] = Math.max(last[1], interval[1]);
    } else {
      merged.push([interval[0], interval[1]]);
    }
  }
  return merged;
}

export function findDuplicates(nums) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of nums) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function longestIncreasingSubsequence(nums) {
  const tails = [];
  for (const value of nums) {
    let low = 0;
    let high = tails.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (tails[middle] < value) low = middle + 1;
      else high = middle;
    }
    tails[low] = value;
  }
  return tails.length;
}

export function coinChange(coins, amount) {
  const table = new Array(amount + 1).fill(Infinity);
  table[0] = 0;
  for (let total = 1; total <= amount; total += 1) {
    for (const coin of coins) {
      if (coin <= total) {
        table[total] = Math.min(table[total], table[total - coin] + 1);
      }
    }
  }
  return table[amount] === Infinity ? -1 : table[amount];
}

export function knapsack(weights, values, capacity) {
  const count = weights.length;
  const table = Array.from({ length: count + 1 }, () => new Array(capacity + 1).fill(0));
  for (let item = 1; item <= count; item += 1) {
    for (let weight = 1; weight <= capacity; weight += 1) {
      if (weights[item - 1] <= weight) {
        table[item][weight] = Math.max(
          table[item - 1][weight],
          table[item - 1][weight - weights[item - 1]] + values[item - 1]
        );
      } else {
        table[item][weight] = table[item - 1][weight];
      }
    }
  }
  return table[count][capacity];
}

export function breadthFirstSearch(graph, start) {
  const visited = new Set();
  const queue = [start];
  const order = [];
  while (queue.length > 0) {
    const node = queue.shift();
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }
  return order;
}

export function depthFirstSearch(graph, start) {
  const visited = new Set();
  const order = [];
  const visit = (node) => {
    if (visited.has(node)) return;
    visited.add(node);
    order.push(node);
    for (const neighbor of graph[node] || []) visit(neighbor);
  };
  visit(start);
  return order;
}

export function hasCycle(graph) {
  const visiting = new Set();
  const done = new Set();
  const visit = (node) => {
    if (done.has(node)) return false;
    if (visiting.has(node)) return true;
    visiting.add(node);
    for (const neighbor of graph[node] || []) {
      if (visit(neighbor)) return true;
    }
    visiting.delete(node);
    done.add(node);
    return false;
  };
  return Object.keys(graph).some((node) => visit(node));
}

export function topologicalSort(graph) {
  const visited = new Set();
  const order = [];
  const visit = (node) => {
    if (visited.has(node)) return;
    visited.add(node);
    for (const neighbor of graph[node] || []) visit(neighbor);
    order.push(node);
  };
  for (const node of Object.keys(graph)) visit(node);
  return order.reverse();
}

export function rotateMatrix(matrix) {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]).reverse());
}
