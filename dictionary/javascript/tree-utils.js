/*
 * Tree utilities: traversal, transformation, and queries over nested
 * node structures keyed by a configurable children property.
 */

export function treeDepth(node, childrenKey = 'children') {
  const children = node[childrenKey] || [];
  if (children.length === 0) return 1;
  return 1 + Math.max(...children.map((child) => treeDepth(child, childrenKey)));
}

export function countLeaves(node, childrenKey = 'children') {
  const children = node[childrenKey] || [];
  if (children.length === 0) return 1;
  return children.reduce((total, child) => total + countLeaves(child, childrenKey), 0);
}

export function nodeCount(node, childrenKey = 'children') {
  const children = node[childrenKey] || [];
  return 1 + children.reduce((total, child) => total + nodeCount(child, childrenKey), 0);
}

export function findNode(root, predicate) {
  if (predicate(root)) return root;
  for (const child of root.children || []) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}

export function flattenTree(root, childrenKey = 'children') {
  const result = [root];
  for (const child of root[childrenKey] || []) {
    result.push(...flattenTree(child, childrenKey));
  }
  return result;
}

export function filterTree(root, predicate, childrenKey = 'children') {
  if (!predicate(root)) return null;
  const children = (root[childrenKey] || [])
    .map((child) => filterTree(child, predicate, childrenKey))
    .filter(Boolean);
  return { ...root, [childrenKey]: children };
}

export function mapTree(root, mapper, childrenKey = 'children') {
  const mapped = mapper(root);
  const children = (root[childrenKey] || []).map((child) => mapTree(child, mapper, childrenKey));
  return { ...mapped, [childrenKey]: children };
}

export function treeToPaths(root, childrenKey = 'children') {
  const paths = [];
  const walk = (node, prefix) => {
    const current = prefix.concat(node);
    const children = node[childrenKey] || [];
    if (children.length === 0) {
      paths.push(current);
      return;
    }
    for (const child of children) walk(child, current);
  };
  walk(root, []);
  return paths;
}

export function buildTree(nodes, parentKey = 'parentId') {
  const byId = new Map(nodes.map((node) => [node.id, { ...node, children: [] }]));
  const roots = [];
  for (const node of byId.values()) {
    const parent = byId.get(node[parentKey]);
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export function walkPreorder(root, visit, childrenKey = 'children') {
  visit(root);
  for (const child of root[childrenKey] || []) {
    walkPreorder(child, visit, childrenKey);
  }
}

export function walkPostorder(root, visit, childrenKey = 'children') {
  for (const child of root[childrenKey] || []) {
    walkPostorder(child, visit, childrenKey);
  }
  visit(root);
}

export function isBalanced(root, childrenKey = 'children') {
  const check = (node) => {
    const children = node[childrenKey] || [];
    if (children.length === 0) return { depth: 1, balanced: true };
    const depths = children.map((child) => check(child));
    if (depths.some((result) => !result.balanced)) return { depth: 0, balanced: false };
    const levels = depths.map((result) => result.depth);
    const difference = Math.max(...levels) - Math.min(...levels);
    return { depth: 1 + Math.max(...levels), balanced: difference <= 1 };
  };
  return check(root).balanced;
}

export function minDepth(root, childrenKey = 'children') {
  const children = root[childrenKey] || [];
  if (children.length === 0) return 1;
  return 1 + Math.min(...children.map((child) => minDepth(child, childrenKey)));
}

export function treeWidth(root, childrenKey = 'children') {
  let widest = 0;
  let level = [root];
  while (level.length > 0) {
    widest = Math.max(widest, level.length);
    level = level.flatMap((node) => node[childrenKey] || []);
  }
  return widest;
}

export function subtreeSum(node, valueKey = 'value', childrenKey = 'children') {
  const own = node[valueKey] || 0;
  const childrenTotal = (node[childrenKey] || []).reduce(
    (total, child) => total + subtreeSum(child, valueKey, childrenKey),
    0
  );
  return own + childrenTotal;
}

export function pruneTree(root, predicate, childrenKey = 'children') {
  const children = (root[childrenKey] || [])
    .map((child) => pruneTree(child, predicate, childrenKey))
    .filter(Boolean);
  if (children.length === 0 && !predicate(root)) return null;
  return { ...root, [childrenKey]: children };
}

export function sortTree(root, keyFn, childrenKey = 'children') {
  const children = (root[childrenKey] || [])
    .map((child) => sortTree(child, keyFn, childrenKey))
    .sort((a, b) => keyFn(a) - keyFn(b));
  return { ...root, [childrenKey]: children };
}

export function mirrorTree(root, childrenKey = 'children') {
  const children = (root[childrenKey] || [])
    .map((child) => mirrorTree(child, childrenKey))
    .reverse();
  return { ...root, [childrenKey]: children };
}

export function pathsToLeaves(root, childrenKey = 'children') {
  const result = [];
  const walk = (node, path) => {
    const current = path.concat(node);
    const children = node[childrenKey] || [];
    if (children.length === 0) {
      result.push(current);
      return;
    }
    for (const child of children) walk(child, current);
  };
  walk(root, []);
  return result;
}

export function deepestNode(root, childrenKey = 'children') {
  let best = root;
  let bestDepth = -1;
  const walk = (node, depth) => {
    if (depth > bestDepth) {
      best = node;
      bestDepth = depth;
    }
    for (const child of node[childrenKey] || []) walk(child, depth + 1);
  };
  walk(root, 0);
  return best;
}

export function hasPathSum(root, target, valueKey = 'value', childrenKey = 'children') {
  const remaining = target - (root[valueKey] || 0);
  const children = root[childrenKey] || [];
  if (children.length === 0) return remaining === 0;
  return children.some((child) => hasPathSum(child, remaining, valueKey, childrenKey));
}

export function collectByKey(root, key, childrenKey = 'children') {
  const result = [];
  const walk = (node) => {
    if (key in node) result.push(node[key]);
    for (const child of node[childrenKey] || []) walk(child);
  };
  walk(root);
  return result;
}
