# AlgoViz

An interactive visualizer for sorting and pathfinding algorithms, built with **HTML, CSS, Tailwind CSS and vanilla JavaScript**. No frameworks and no build step.

**Live demo:** https://YOUR-USERNAME.github.io/algoviz/

<!-- Add screenshots to an assets/ folder and uncomment:
![Sorting view](assets/sorting.png)
![Pathfinding view](assets/pathfinding.png)
-->

## Features

**Sorting**
- Bubble, Selection, Insertion, Merge, Quick, Heap, Counting and Radix sort
- Animate, Pause, Step and Reset controls, with live speed and array size
- Comparison and swap counters, value labels, color-coded bars
- Big-O complexity and key concepts for each algorithm

**Pathfinding**
- BFS, DFS, Dijkstra and A* on a weighted graph drawn with SVG
- Edge costs follow node distance, so Dijkstra and A* find cheaper routes than BFS and DFS
- Pick start and target nodes, step forward and backward through the search
- Move nodes, add nodes, and add or remove links to build your own graph
- Shows nodes visited, edges checked, path cost, and the route found

**General**
- Dark and light theme (remembered between visits)
- Responsive layout, keyboard focus styles, reduced-motion support

## Run locally

No installation needed.

1. Download or clone this repository.
2. Open `index.html` in a browser (or use the VS Code "Live Server" extension).

Tailwind is loaded from its CDN, so an internet connection is required.

## Project structure

```
algoviz/
├── index.html
├── css/style.css
└── js/
    ├── main.js              # sorting UI, animation, tabs, theme
    ├── sorting/             # bubble, selection, insertion, merge, quick
    └── pathfinding/
        ├── utils.js         # edge weights, adjacency list, path tracing
        ├── graph.js         # SVG graph, tools, playback
        └── bfs.js, dfs.js, dijkstra.js, astar.js
```

## How it works

Algorithms and UI are separated. Each algorithm is a pure function that **does not touch the page**. It only returns a list of steps, and the UI plays those steps back with `async/await` and a delay.

- Sorting steps: `compare`, `swap`, `overwrite` (merge sort), `sorted`
- Pathfinding steps: `visit`, `edge`, `dist`, `found`

This makes every algorithm easy to test and means a new algorithm only needs one new file and one line to register it.

## Algorithm complexity

| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Bubble    | O(n) | O(n²) | O(n²) | O(1) |
| Selection | O(n²) | O(n²) | O(n²) | O(1) |
| Insertion | O(n) | O(n²) | O(n²) | O(1) |
| Merge     | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick     | O(n log n) | O(n log n) | O(n²) | O(log n) |

BFS and DFS run in O(V + E). Dijkstra runs in O((V + E) log V) with a priority queue (this project uses a simple scan for clarity). A* uses a Manhattan-distance heuristic and finds the shortest path while visiting fewer cells.

## What I learned

- Designing algorithms as pure functions that return steps
- Async JavaScript for animation (`async/await`, timers)
- DOM manipulation, pointer events for mouse and touch
- Graph search and how heuristics change behavior
- Responsive, accessible UI with Tailwind CSS

## Possible improvements

- Directed edges and editable edge weights
- A grid mode with walls and maze generation
- Shell sort, Greedy Best-First Search, and Bellman-Ford

## License

MIT