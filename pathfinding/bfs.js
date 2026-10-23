// Breadth-first search: fewest edges, but it ignores edge costs.
function bfs(graph, start, target) {
    const adj = buildAdj(graph);
    const n = graph.nodes.length;
    const parent = Array(n).fill(-1);
    const cost = Array(n).fill(Infinity);
    const seen = new Set([start]);
    const steps = [{ type: "dist", node: start, value: 0 }];
    const queue = [start];
    cost[start] = 0;

    for (let head = 0; head < queue.length; head++) {
        const u = queue[head];
        steps.push({ type: "visit", node: u });
        if (u === target) {
            steps.push({ type: "found", path: tracePath(parent, start, target), cost: cost[target] });
            return steps;
        }
        for (const { to, w } of adj[u]) {
            steps.push({ type: "edge", a: u, b: to });
            if (seen.has(to)) continue;
            seen.add(to);
            parent[to] = u;
            cost[to] = cost[u] + w;
            steps.push({ type: "dist", node: to, value: cost[to] });
            queue.push(to);
        }
    }
    steps.push({ type: "fail" });
    return steps;
}