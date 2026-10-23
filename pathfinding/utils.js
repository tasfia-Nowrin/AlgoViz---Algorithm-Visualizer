// Shared helpers for the graph algorithms (no DOM access, so they are easy to test).
// graph = { nodes: [{ id, x, y }], edges: [{ a, b, w }] }  (undirected, weighted)
// Every algorithm has the signature: algo(graph, startId, targetId) -> steps[]
// Step types: visit {node}, edge {a, b}, dist {node, value}, found {path, cost}, fail {}

const W_SCALE = 14; // pixels per cost unit

// Edge cost grows with the distance between the two nodes (at least 1)
const edgeWeight = (p, q) => Math.max(1, Math.ceil(Math.hypot(p.x - q.x, p.y - q.y) / W_SCALE));

// Straight-line estimate used by A*. It is never larger than the real cost, so A* stays optimal.
const straightLine = (p, q) => Math.hypot(p.x - q.x, p.y - q.y) / W_SCALE;

function buildAdj(graph) {
    const adj = graph.nodes.map(() => []);
    graph.edges.forEach((e) => {
        adj[e.a].push({ to: e.b, w: e.w });
        adj[e.b].push({ to: e.a, w: e.w });
    });
    return adj;
}

// parent[x] is the node we came from (-1 for the start). Walk back from the target.
function tracePath(parent, start, target) {
    const path = [];
    for (let c = target; c !== -1; c = parent[c]) {
        path.push(c);
        if (c === start) return path.reverse();
    }
    return [];
}