// Pathfinding view: a weighted graph drawn with SVG.
const PathViz = (() => {
    const q = (id) => document.getElementById(id);
    const R = 16;           
    const MAX_NODES = 40;

    const NAMES = { bfs: "Breadth-First Search", dfs: "Depth-First Search", dijkstra: "Dijkstra", astar: "A* Search" };
    const INFO = {
        bfs: "Explores neighbors level by level and finds the route with the fewest edges. It ignores edge costs, so the route may not be the cheapest.",
        dfs: "Follows one branch as deep as possible before backing up. Finds a route quickly, but it can be long and expensive.",
        dijkstra: "Always expands the node with the lowest total cost so far. Guarantees the cheapest route when all costs are positive.",
        astar: "Like Dijkstra, but adds a straight-line estimate toward the target, so it usually visits fewer nodes and still finds the cheapest route.",
    };
    const NOTE = {
        bfs: "BFS minimizes the number of hops, not the total cost.",
        dfs: "DFS does not guarantee the cheapest route.",
        dijkstra: "Dijkstra always finds the cheapest route.",
        astar: "A* finds the cheapest route and usually checks fewer nodes than Dijkstra.",
    };
    const HINT = {
        move: "Move: drag nodes to reposition them. Edge costs follow the distance between nodes.",
        node: "Node: tap empty space to add a node. It links to its 2 nearest neighbors.",
        link: "Link: tap two nodes to add a link between them, or to remove an existing link.",
    };

    let ready = false, svg = null;
    let graph = { nodes: [], edges: [] };
    let W = 0, H = 0;
    let algo = "bfs", tool = "move", linkFrom = null, dragId = null;
    let steps = null, bounds = [], index = 0, playing = false, runId = 0;

    const label = (i) => String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : "");
    const key = (a, b) => (a < b ? a + "-" + b : b + "-" + a);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const getStart = () => Number(q("gStart").value);
    const getTarget = () => Number(q("gTarget").value);
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    // ---------- Graph building ----------
    const hasEdge = (a, b) => graph.edges.some((e) => key(e.a, e.b) === key(a, b));
    function addEdge(a, b) {
        if (a === b || hasEdge(a, b)) return;
        graph.edges.push({ a, b, w: edgeWeight(graph.nodes[a], graph.nodes[b]) });
    }
    function nearest(id) {
        const p = graph.nodes[id];
        return graph.nodes
            .filter((n) => n.id !== id)
            .sort((u, v) => Math.hypot(u.x - p.x, u.y - p.y) - Math.hypot(v.x - p.x, v.y - p.y))
            .map((n) => n.id);
    }
    function components() {
        const adj = buildAdj(graph);
        const comp = Array(graph.nodes.length).fill(-1);
        let c = 0;
        for (let s = 0; s < comp.length; s++) {
            if (comp[s] !== -1) continue;
            const stack = [s];
            comp[s] = c;
            while (stack.length) {
                for (const { to } of adj[stack.pop()]) if (comp[to] === -1) { comp[to] = c; stack.push(to); }
            }
            c++;
        }
        return comp;
    }
    function connectAll() {
        while (true) {
            const comp = components();
            if (new Set(comp).size === 1) return;
            let best = null;
            for (let a = 0; a < comp.length; a++)
                for (let b = a + 1; b < comp.length; b++) {
                    if (comp[a] === comp[b]) continue;
                    const d = Math.hypot(graph.nodes[a].x - graph.nodes[b].x, graph.nodes[a].y - graph.nodes[b].y);
                    if (!best || d < best.d) best = { a, b, d };
                }
            addEdge(best.a, best.b);
        }
    }

    function makeGraph() {
        W = Math.max(280, q("graphWrap").clientWidth);
        H = Math.round(Math.min(520, Math.max(300, W * 0.72)));
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

        const n = clamp(Math.round((W * H) / 13000), 9, 24);
        const M = 30;
        const cols = Math.ceil(Math.sqrt((n * W) / H));
        const rows = Math.ceil(n / cols);
        const cw = (W - 2 * M) / cols, ch = (H - 2 * M) / rows;

        let cells = [];
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([r, c]);
        cells.sort(() => Math.random() - 0.5);
        cells = cells.slice(0, n).sort((a, b) => a[1] - b[1] || a[0] - b[0]); // labels run left to right

        graph = {
            nodes: cells.map(([r, c], i) => ({
                id: i,
                x: M + cw * (c + 0.5 + (Math.random() - 0.5) * 0.6),
                y: M + ch * (r + 0.5 + (Math.random() - 0.5) * 0.6),
            })),
            edges: [],
        };
        for (let i = 0; i < n; i++) {
            const near = nearest(i);
            addEdge(i, near[0]);
            addEdge(i, near[1]);
            if (Math.random() < 0.4) addEdge(i, near[2]);
        }
        connectAll();
    }

    function fillSelects(start, target) {
        const options = graph.nodes.map((n) => `<option value="${n.id}">${label(n.id)}</option>`).join("");
        q("gStart").innerHTML = options;
        q("gTarget").innerHTML = options;
        q("gStart").value = start ?? 0;
        q("gTarget").value = target ?? graph.nodes.length - 1;
    }

    // ---------- Replaying steps ----------
    function stateAt(i) {
        const st = { visited: new Set(), active: null, dist: new Map(), edge: null, path: null, cost: null, edges: 0 };
        for (let k = 0; k < i; k++) {
            const s = steps[k];
            if (s.type === "visit") { if (st.active !== null) st.visited.add(st.active); st.active = s.node; }
            else if (s.type === "edge") { st.edge = [s.a, s.b]; st.edges++; }
            else if (s.type === "dist") st.dist.set(s.node, s.value);
            else if (s.type === "found") { st.path = s.path; st.cost = s.cost; st.edge = null; }
        }
        return st;
    }

    function draw(st) {
        const s = st || { visited: new Set(), active: null, dist: new Map(), edge: null, path: null };
        const pathNodes = new Set(s.path || []);
        const pathEdges = new Set();
        if (s.path) for (let i = 0; i < s.path.length - 1; i++) pathEdges.add(key(s.path[i], s.path[i + 1]));
        const activeKey = s.edge ? key(s.edge[0], s.edge[1]) : null;
        const rank = (e) => (pathEdges.has(key(e.a, e.b)) ? 2 : key(e.a, e.b) === activeKey ? 1 : 0);
        const edges = [...graph.edges].sort((x, y) => rank(x) - rank(y)); // highlighted edges on top
        const start = getStart(), target = getTarget();
        let html = "";

        for (const e of edges) {
            const a = graph.nodes[e.a], b = graph.nodes[e.b], r = rank(e);
            html += `<line class="ge${r === 2 ? " path" : r === 1 ? " active" : ""}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
        }
        for (const e of edges) {
            const a = graph.nodes[e.a], b = graph.nodes[e.b];
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            html += `<rect class="gw" x="${mx - 10}" y="${my - 7}" width="20" height="14" rx="7"/><text class="gwt" x="${mx}" y="${my}">${e.w}</text>`;
        }
        for (const n of graph.nodes) {
            const cls = "gn" + (pathNodes.has(n.id) ? " path" : n.id === s.active ? " active" : s.visited.has(n.id) ? " visited" : "") + (n.id === linkFrom ? " pick" : "");
            html += `<g data-node="${n.id}"><circle class="${cls}" cx="${n.x}" cy="${n.y}" r="${R}"/><text class="gl" x="${n.x}" y="${n.y}">${label(n.id)}</text>`;
            if (n.id === start) html += `<text class="gtag start" x="${n.x}" y="${n.y - R - 7}">START</text>`;
            if (n.id === target) html += `<text class="gtag target" x="${n.x}" y="${n.y - R - 7}">TARGET</text>`;
            if (s.dist.has(n.id)) html += `<rect class="gcb" x="${n.x - 12}" y="${n.y + R + 3}" width="24" height="14" rx="3"/><text class="gc" x="${n.x}" y="${n.y + R + 10}">${s.dist.get(n.id)}</text>`;
            html += `</g>`;
        }
        svg.innerHTML = html;
    }

    function updateStats(st) {
        q("gVisited").textContent = st ? st.visited.size + (st.active !== null ? 1 : 0) : 0;
        q("gEdges").textContent = st ? st.edges : 0;
        q("gCost").textContent = st && st.cost !== null ? st.cost : "–";
    }

    function updateResult(st) {
        const el = q("gResult");
        if (!steps || index < steps.length) { el.textContent = ""; return; }
        el.textContent = st.path && st.path.length
            ? `Route found: ${st.path.map(label).join(" → ")} (cost ${st.cost}). ${NOTE[algo]}`
            : "No route between these nodes. Add a link to connect them.";
    }

    function updateButtons() {
        const done = steps !== null && index >= steps.length;
        q("gPlay").disabled = playing;
        q("gPause").disabled = !playing;
        q("gPrev").disabled = playing || index === 0;
        q("gNext").disabled = playing || done;
        ["gNew", "gStart", "gTarget"].forEach((id) => (q(id).disabled = playing));
        document.querySelectorAll("#pathTabs button, [data-tool]").forEach((b) => (b.disabled = playing));
    }

    function refresh() {
        const st = steps ? stateAt(index) : null;
        draw(st);
        updateStats(st);
        updateResult(st);
        updateButtons();
    }

    function ensureSteps() {
        if (steps) return;
        steps = window[algo](graph, getStart(), getTarget());
        const visits = [];
        steps.forEach((s, i) => { if (s.type === "visit") visits.push(i); });
        bounds = [0, ...visits.slice(1), steps.length]; // Next/Prev jump from one expanded node to the next
    }

    function resetPlayback() {
        runId++;
        playing = false;
        steps = null;
        index = 0;
        refresh();
    }

    async function play() {
        if (playing) return;
        ensureSteps();
        if (index >= steps.length) index = 0;
        const myRun = ++runId;
        playing = true;
        while (playing && myRun === runId && index < steps.length) {
            const s = steps[index++];
            refresh();
            await sleep(Math.round(1500 / Number(q("gSpeed").value)) * (s.type === "visit" ? 3 : 1));
        }
        if (myRun !== runId) return;
        playing = false;
        refresh();
    }

    function next() {
        if (playing) return;
        ensureSteps();
        const b = bounds.find((x) => x > index);
        index = b === undefined ? steps.length : b;
        refresh();
    }

    function prev() {
        if (playing || !steps) return;
        const before = bounds.filter((x) => x < index);
        index = before.length ? before[before.length - 1] : 0;
        refresh();
    }

    function selectAlgo(k) {
        if (playing) return;
        algo = k;
        document.querySelectorAll("#pathTabs button").forEach((b) => b.classList.toggle("active", b.dataset.key === k));
        q("gAlgoName").textContent = NAMES[k];
        q("gAlgoDesc").textContent = INFO[k];
        resetPlayback();
    }

    function setTool(t) {
        tool = t;
        linkFrom = null;
        document.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("active", b.dataset.tool === t));
        q("gHint").textContent = HINT[t];
        refresh();
    }

    // ---------- Editing the graph ----------
    const toSvg = (e) => {
        const r = svg.getBoundingClientRect();
        return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
    };

    function addNode(p) {
        if (graph.nodes.length >= MAX_NODES) { q("gHint").textContent = `Maximum of ${MAX_NODES} nodes reached.`; return; }
        const id = graph.nodes.length;
        graph.nodes.push({ id, x: clamp(p.x, R, W - R), y: clamp(p.y, R, H - R) });
        const near = nearest(id);
        addEdge(id, near[0]);
        addEdge(id, near[1]);
        fillSelects(getStart(), getTarget());
        resetPlayback();
    }

    function linkClick(id) {
        if (linkFrom === null) { linkFrom = id; refresh(); return; }
        if (linkFrom !== id) {
            if (hasEdge(linkFrom, id)) graph.edges = graph.edges.filter((e) => key(e.a, e.b) !== key(linkFrom, id));
            else addEdge(linkFrom, id);
        }
        linkFrom = null;
        resetPlayback();
    }

    function wire() {
        svg.addEventListener("pointerdown", (e) => {
            if (playing) return;
            const g = e.target.closest("[data-node]");
            const id = g ? Number(g.dataset.node) : null;
            if (tool === "move" && id !== null) { dragId = id; resetPlayback(); svg.setPointerCapture(e.pointerId); }
            else if (tool === "node" && id === null) addNode(toSvg(e));
            else if (tool === "link" && id !== null) linkClick(id);
            e.preventDefault();
        });
        svg.addEventListener("pointermove", (e) => {
            if (dragId === null) return;
            const p = toSvg(e), n = graph.nodes[dragId];
            n.x = clamp(p.x, R, W - R);
            n.y = clamp(p.y, R, H - R);
            graph.edges.forEach((ed) => {
                if (ed.a === dragId || ed.b === dragId) ed.w = edgeWeight(graph.nodes[ed.a], graph.nodes[ed.b]);
            });
            draw(null);
        });
        ["pointerup", "pointercancel"].forEach((t) => svg.addEventListener(t, () => (dragId = null)));

        q("gPlay").addEventListener("click", play);
        q("gPause").addEventListener("click", () => { playing = false; updateButtons(); });
        q("gNext").addEventListener("click", next);
        q("gPrev").addEventListener("click", prev);
        q("gReset").addEventListener("click", resetPlayback);
        q("gNew").addEventListener("click", () => { makeGraph(); fillSelects(); resetPlayback(); });

        q("gStart").addEventListener("change", () => {
            if (getStart() === getTarget()) q("gTarget").value = (getStart() + 1) % graph.nodes.length;
            resetPlayback();
        });
        q("gTarget").addEventListener("change", () => {
            if (getStart() === getTarget()) q("gStart").value = (getTarget() + 1) % graph.nodes.length;
            resetPlayback();
        });
        document.querySelectorAll("[data-tool]").forEach((b) => b.addEventListener("click", () => setTool(b.dataset.tool)));
    }

    function init() {
        if (ready) return;
        ready = true;
        svg = q("graphSvg");

        const files = { buildAdj: "utils.js", bfs: "bfs.js", dfs: "dfs.js", dijkstra: "dijkstra.js", astar: "astar.js" };
        const missing = Object.keys(files).filter((name) => typeof window[name] !== "function");
        if (missing.length) {
            q("gResult").textContent = "Missing file in js/pathfinding/: " + missing.map((m) => files[m]).join(", ") + ". Check your folder structure.";
            return;
        }

        Object.entries(NAMES).forEach(([k, name]) => {
            const b = document.createElement("button");
            b.className = "algo-tab";
            b.dataset.key = k;
            b.textContent = name;
            b.addEventListener("click", () => selectAlgo(k));
            q("pathTabs").appendChild(b);
        });

        wire();
        makeGraph();
        fillSelects();
        setTool("move");
        selectAlgo("bfs");
    }

    return { init };
})();