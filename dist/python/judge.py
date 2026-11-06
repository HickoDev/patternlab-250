import json
from collections import deque
from types import SimpleNamespace


class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right


class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = [] if neighbors is None else neighbors
        self.next = self.random = None


def linked(values):
    head = None
    for value in reversed(values):
        head = ListNode(value, head)
    return head


def list_nodes(head):
    nodes, seen = [], set()
    while head is not None:
        if id(head) in seen:
            raise ValueError("Expected an acyclic result list.")
        seen.add(id(head))
        nodes.append(head)
        head = head.next
    return nodes


def tree(values):
    if not values:
        return None
    root = TreeNode(values[0])
    queue = deque([root])
    values = iter(values[1:])
    while queue:
        parent = queue.popleft()
        for side in ("left", "right"):
            value = next(values, None)
            if value is not None:
                child = TreeNode(value)
                setattr(parent, side, child)
                queue.append(child)
    return root


def tree_values(root):
    result, seen, queue = [], set(), deque([root])
    while queue:
        item = queue.popleft()
        if item is None:
            result.append(None)
            continue
        if id(item) in seen:
            raise ValueError("Expected distinct tree nodes.")
        seen.add(id(item))
        result.append(item.val)
        queue.extend((item.left, item.right))
    while result and result[-1] is None:
        result.pop()
    return result


def graph_copy(solve, adjacency):
    nodes = [Node(i + 1) for i in range(len(adjacency))]
    for node, row in zip(nodes, adjacency):
        node.neighbors = [nodes[v - 1] for v in row]
    start = solve(nodes[0] if nodes else None)
    if start is None:
        return []
    if start.val != 1:
        raise ValueError("Return the copy of the starting vertex.")
    queue, found = deque([start]), {}
    original_ids = {id(n) for n in nodes}
    while queue:
        node = queue.popleft()
        if id(node) in original_ids or not 1 <= node.val <= len(nodes):
            raise ValueError("Return an independent graph copy.")
        if node.val in found:
            if found[node.val] is not node:
                raise ValueError("Duplicate graph vertex.")
            continue
        found[node.val] = node
        queue.extend(node.neighbors)
    return [sorted(x.val for x in found[i].neighbors) for i in range(1, len(found) + 1)]


def random_copy(solve, values):
    nodes = [Node(val) for val, _ in values]
    for i, (_, target) in enumerate(values):
        nodes[i].next = nodes[i + 1] if i + 1 < len(nodes) else None
        nodes[i].random = nodes[target] if target is not None else None
    copies = list_nodes(solve(nodes[0] if nodes else None))
    indices = {id(node): i for i, node in enumerate(copies)}
    if any(id(node) in indices for node in nodes):
        raise ValueError("Return an independent list copy.")
    return [[node.val, indices[id(node.random)] if node.random is not None else None] for node in copies]


def evaluate(code, metadata, inputs):
    p, args = json.loads(metadata), json.loads(inputs)
    slug = p["slug"]
    namespace = {"__name__": "__solution__", "ListNode": ListNode, "TreeNode": TreeNode, "Node": Node}
    exec(compile(code, "<solution>", "exec"), namespace)
    if p.get("methods"):
        solution = namespace["Solution"]
        if slug in ("string-encode-and-decode", "serialize-and-deserialize-binary-tree"):
            binary = slug == "serialize-and-deserialize-binary-tree"
            encoded = solution().serialize(tree(args[0])) if binary else solution().encode(args[0])
            if not isinstance(encoded, str):
                raise ValueError("The encoded value must be a string.")
            return tree_values(solution().deserialize(encoded)) if binary else solution().decode(encoded)
        init, *ops = args[0]
        instance = solution(*init[1:])
        return [None] + [getattr(instance, name)(*values) for name, *values in ops]
    solve = namespace["solve"]
    if slug == "clone-graph":
        return graph_copy(solve, args[0])
    if slug == "copy-linked-list-with-random-pointer":
        return random_copy(solve, args[0])
    if slug == "linked-list-cycle-detection":
        head = linked(args[0])
        nodes = list_nodes(head)
        if nodes and args[1] >= 0:
            nodes[-1].next = nodes[args[1]]
        return solve(head)
    if slug == "guess-number-higher-or-lower":
        return solve(args[0], lambda n: (args[1] > n) - (args[1] < n))
    if slug == "find-in-mountain-array":
        arr = args[1]
        return solve(args[0], SimpleNamespace(get=arr.__getitem__, length=lambda: len(arr)))
    for i, name in enumerate(p["params"]):
        if name in ("root", "other", "subRoot"):
            args[i] = tree(args[i])
        elif name in ("head", "headA", "headB"):
            args[i] = linked(args[i])
        elif name == "lists":
            args[i] = [linked(values) for values in args[i]]
    result = solve(*args)
    if slug in ("remove-element", "remove-duplicates-from-sorted-array"):
        if type(result) is not int or not 0 <= result <= len(args[0]):
            raise ValueError("Return the retained prefix length.")
        return args[0][:result]
    if p["inPlace"] and result is None:
        result = args[0]
    if p["treeOutput"]:
        return tree_values(result)
    if p["listOutput"]:
        return [n.val for n in list_nodes(result)]
    return result


def sample_json(code, metadata, inputs):
    return json.dumps(evaluate(code, metadata, inputs), allow_nan=False)
