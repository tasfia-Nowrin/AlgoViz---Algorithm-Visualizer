
# 📊 AlgoViz — Algorithm Visualizer

> **Visualize Algorithms. Understand How They Work.**

AlgoViz is an interactive web-based application that helps students and developers understand algorithms through visual animations. It provides sorting algorithm visualizations and graph-based pathfinding demonstrations using HTML, CSS, Tailwind CSS, and JavaScript.

## 🌐 Live demo
🔗 https://tasfia-nowrin.github.io/AlgoViz---Algorithm-Visualizer/


## ✨ Features

### 🔢 Sorting Visualization
- Visualize multiple sorting algorithms using animated array bars.
- Generate random arrays and change array size.
- Control animation speed.
- Play, pause, reset, and execute algorithms step by step.
- Track comparisons and swaps or write operations.
- View algorithm descriptions and time and space complexity.


### 🗺️ Pathfinding Visualization
- Explore algorithms on an interactive weighted graph.
- Select start and target nodes.
- Visualize visited nodes and discovered paths.
- Animate algorithm execution.
- Control playback speed and navigate through steps.
- View visited nodes, checked edges, and path cost.
- Create new graphs and interact with nodes and links.


### 🎨 User Interface
- Responsive user interface.
- Light and dark theme support.
- Interactive controls and real-time visual feedback.
- Tailwind CSS utility-based styling.


## 🧮 Algorithms

### Sorting Algorithms

| Algorithm | Best Case | Average Case | Worst Case |
|---|---|---|---|
| Bubble Sort | O(n) | O(n²) | O(n²) |
| Selection Sort | O(n²) | O(n²) | O(n²) |
| Insertion Sort | O(n) | O(n²) | O(n²) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) |
| Counting Sort | O(n + k) | O(n + k) | O(n + k) |
| Radix Sort | Depends on implementation | Depends on implementation | Depends on implementation |


### Pathfinding Algorithms

- **Breadth-First Search (BFS):** Explores nodes level by level and finds a shortest path in an unweighted graph.
- **Depth-First Search (DFS):** Explores deeper nodes before backtracking.
- **Dijkstra's Algorithm:** Finds shortest paths in graphs with non-negative edge weights.
- **A* Search:** Uses path cost and a heuristic to guide the search toward the target.


## 🛠️ Tech Stack

- **HTML5** — Page structure
- **CSS3** — Custom styling
- **Tailwind CSS** — Utility-based styling
- **JavaScript** — Algorithm implementation and interactivity
- **SVG** — Graph visualization


## 📁 Project Structure

```text
AlgoViz/
├── index.html
├── style.css
├── main.js
├── README.md
│
├── sorting/
│   ├── bubble.js
│   ├── selection.js
│   ├── insertion.js
│   ├── merge.js
│   ├── quick.js
│   ├── heap.js
│   ├── counting.js
│   └── radix.js
│
└── pathfinding/
    ├── utils.js
    ├── bfs.js
    ├── dfs.js
    ├── dijkstra.js
    ├── astar.js
    └── graph.js
```


## 🚀 Getting Started

### Prerequisites

- A modern web browser
- Visual Studio Code or another code editor
- Internet connection to load Tailwind CSS from its CDN


### Installation

**1. Clone the repository**

```bash
git clone https://github.com/tasfia-Nowrin/AlgoViz---Algorithm-Visualizer.git
```

**2. Navigate to the project directory**

```bash
cd AlgoViz---Algorithm-Visualizer
```

**3. Run the application**

Open `index.html` in your browser, or use the Live Server extension in Visual Studio Code.

No backend server or database is required.


## 📖 How to Use

### Sorting
1. Select a sorting algorithm.
2. Adjust the array size and animation speed.
3. Click **Animate** to start.
4. Use Pause, Reset, Step, or New Array to control the visualization.
5. Observe the comparison and swap statistics.


### Pathfinding
1. Open the Pathfinding section.
2. Select an algorithm.
3. Choose the start and target nodes.
4. Use graph tools to move nodes, add nodes, or create links.
5. Start the animation and observe the search process.
6. Review the visited nodes, checked edges, and path cost.


## 🎯 Project Objectives

- Make algorithms easier to understand through visualization.
- Demonstrate sorting and pathfinding techniques interactively.
- Help learners explore algorithm behavior and complexity.
- Practice JavaScript, DOM manipulation, and event handling.


## 🔮 Future Improvements

- Add more algorithms and visualization options.
- Improve mobile responsiveness and accessibility.
- Add customizable graph sizes and edge weights.
- Include detailed algorithm explanations and learning challenges.
- Add algorithm performance comparisons.


## 👩‍💻 Author

**Tasfia Nowrin**

GitHub: [tasfia-Nowrin](https://github.com/tasfia-Nowrin)


## 📄 License

This project is intended for educational and personal learning purposes. Add an open-source license file if you want to define reuse and redistribution permissions.

---

*AlgoViz — Making Algorithms Easier to See, Explore, and Understand.*
