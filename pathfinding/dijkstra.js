// Dijkstra: always expands the node with the lowest total cost so far. Cheapest route.
function dijkstra(graph, start, target) {
    const adj = buildAdj(graph);
    const n = graph.nodes.length;
    const dist = Array(n).fill(Infinity);
    const parent = Array(n).fill(-1);
    const done = new Set();
    const steps = [{ type: "dist", node: start, value: 0 }];
    const open = [start];
    dist[start] = 0;

    while (open.length) {
        // Pick the cheapest open node (a priority queue would be faster; a scan is clearer)
        let best = 0;
        for (let i = 1; i < open.length; i++) if (dist[open[i]] < dist[open[best]]) best = i;
        const u = open.splice(best, 1)[0];
        if (done.has(u)) continue;
        done.add(u);
        steps.push({ type: "visit", node: u });

        if (u === target) {
            steps.push({ type: "found", path: tracePath(parent, start, target), cost: dist[target] });
            return steps;
        }
        for (const { to, w } of adj[u]) {
            steps.push({ type: "edge", a: u, b: to });
            if (done.has(to)) continue;
            if (dist[u] + w < dist[to]) {
                dist[to] = dist[u] + w;
                parent[to] = u;
                steps.push({ type: "dist", node: to, value: dist[to] });
                open.push(to);
            }
        }
    }
    steps.push({ type: "fail" });
    return steps;
}