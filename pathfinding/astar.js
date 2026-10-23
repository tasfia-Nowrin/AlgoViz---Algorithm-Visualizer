// A*: like Dijkstra, but it adds a straight-line estimate to the target.
// It usually visits fewer nodes and still finds the cheapest route.
function astar(graph, start, target) {
    const adj = buildAdj(graph);
    const n = graph.nodes.length;
    const g = Array(n).fill(Infinity);
    const parent = Array(n).fill(-1);
    const done = new Set();
    const h = (i) => straightLine(graph.nodes[i], graph.nodes[target]);
    const f = (i) => g[i] + h(i);
    const steps = [{ type: "dist", node: start, value: 0 }];
    const open = [start];
    g[start] = 0;

    while (open.length) {
        let best = 0;
        for (let i = 1; i < open.length; i++) {
            const a = open[i], b = open[best];
            if (f(a) < f(b) || (f(a) === f(b) && h(a) < h(b))) best = i;
        }
        const u = open.splice(best, 1)[0];
        if (done.has(u)) continue;
        done.add(u);
        steps.push({ type: "visit", node: u });

        if (u === target) {
            steps.push({ type: "found", path: tracePath(parent, start, target), cost: g[target] });
            return steps;
        }
        for (const { to, w } of adj[u]) {
            steps.push({ type: "edge", a: u, b: to });
            if (done.has(to)) continue;
            if (g[u] + w < g[to]) {
                g[to] = g[u] + w;
                parent[to] = u;
                steps.push({ type: "dist", node: to, value: g[to] });
                open.push(to);
            }
        }
    }
    steps.push({ type: "fail" });
    return steps;
}