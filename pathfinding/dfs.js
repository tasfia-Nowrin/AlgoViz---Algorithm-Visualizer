// Depth-first search: follows one branch as deep as it can. Finds a route, not the cheapest one.
function dfs(graph, start, target) {
    const adj = buildAdj(graph);
    const n = graph.nodes.length;
    const parent = Array(n).fill(-1);
    const cost = Array(n).fill(Infinity);
    const seen = new Set();
    const steps = [];
    const stack = [{ node: start, from: -1, c: 0 }];

    while (stack.length) {
        const { node: u, from, c } = stack.pop();
        if (seen.has(u)) continue;
        seen.add(u);
        parent[u] = from;
        cost[u] = c;
        steps.push({ type: "visit", node: u });
        steps.push({ type: "dist", node: u, value: c });

        if (u === target) {
            steps.push({ type: "found", path: tracePath(parent, start, target), cost: cost[target] });
            return steps;
        }
        for (const { to, w } of adj[u]) {
            steps.push({ type: "edge", a: u, b: to });
            if (!seen.has(to)) stack.push({ node: to, from: u, c: c + w });
        }
    }
    steps.push({ type: "fail" });
    return steps;
}