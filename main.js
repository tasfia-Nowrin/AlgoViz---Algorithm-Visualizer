// ---------- Algorithm info ----------
const ALGO_INFO = {
    bubble: { name: "Bubble Sort", desc: "Repeatedly steps through the array, compares adjacent elements, and swaps them if they are in the wrong order. Each pass bubbles the largest unsorted element to its correct position.", concept: "Stable and in-place. Stops early when a pass makes no swaps, which is why the best case is O(n).", best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
    selection: { name: "Selection Sort", desc: "Finds the smallest unsorted element and swaps it into the next position at the front.", concept: "In-place but not stable. Always makes about n²/2 comparisons, but at most n swaps.", best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
    insertion: { name: "Insertion Sort", desc: "Builds the sorted part one element at a time by moving each new element left until it fits.", concept: "Stable and in-place. Very fast on nearly sorted data, which is why it is used for small arrays.", best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
    merge: { name: "Merge Sort", desc: "Splits the array in halves, sorts each half recursively, then merges the sorted halves.", concept: "Divide and conquer. Stable with guaranteed O(n log n), but needs O(n) extra space. Shown as writes, not swaps.", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
    quick: { name: "Quick Sort", desc: "Picks a pivot, moves smaller elements to its left and larger ones to its right, then sorts both sides.", concept: "Divide and conquer and in-place. Fast in practice, but consistently bad pivots give O(n²).", best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
    heap: { name: "Heap Sort", desc: "Builds a max-heap, then repeatedly moves the largest element to the end and repairs the heap.", concept: "In-place with guaranteed O(n log n), but not stable. The array is treated as a binary tree: the children of i are 2i+1 and 2i+2.", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
    counting: { name: "Counting Sort", desc: "Counts how many times each value appears, then writes the values back in order.", concept: "Not comparison-based, so it shows 0 comparisons. Runs in O(n + k), where k is the largest value.", best: "O(n + k)", avg: "O(n + k)", worst: "O(n + k)", space: "O(k)" },
    radix: { name: "Radix Sort", desc: "Sorts numbers digit by digit, from the least significant digit to the most significant.", concept: "Not comparison-based. Runs in O(d · (n + b)) for d digits in base b (here b = 10). Each pass is a stable bucket sort.", best: "O(d(n + b))", avg: "O(d(n + b))", worst: "O(d(n + b))", space: "O(n + b)" },
};

const ALGORITHMS = {
    bubble: bubbleSort, selection: selectionSort, insertion: insertionSort, merge: mergeSort,
    quick: quickSort, heap: heapSort, counting: countingSort, radix: radixSort,
};

// ---------- State ----------
let current = "bubble";
let original = [];            // the array as generated (Reset returns to it)
let array = [];               // live array while animating
let steps = null;             // steps from the chosen algorithm
let index = 0;                // next step to play
let playing = false;
let runId = 0;                // lets an old animation loop notice it was replaced
let counts = { cmp: 0, swap: 0 };
let active = [];              // bars with a temporary highlight

// ---------- Elements ----------
const $ = (id) => document.getElementById(id);
const barsEl = $("bars"), algoTabs = $("algoTabs"), statusEl = $("status");
const playBtn = $("playBtn"), pauseBtn = $("pauseBtn"), resetBtn = $("resetBtn"), stepBtn = $("stepBtn"), newBtn = $("newBtn");
const sizeRange = $("sizeRange"), sizeLabel = $("sizeLabel"), speedRange = $("speedRange");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getDelay = () => Math.round(1000 / Number(speedRange.value));

function generateArray(size) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 91) + 10);
}

function renderBars() {
    barsEl.innerHTML = "";
    barsEl.classList.toggle("labels", array.length <= 25); // value labels only when there is room
    array.forEach((value) => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = value + "%";
        const label = document.createElement("span");
        label.className = "val";
        label.textContent = value;
        bar.appendChild(label);
        barsEl.appendChild(bar);
    });
}

function setBar(i, value) {
    barsEl.children[i].style.height = value + "%";
    barsEl.children[i].firstChild.textContent = value;
}

function updateCounts() {
    $("cmpCount").textContent = counts.cmp;
    $("swapCount").textContent = counts.swap;
}

function updateButtons() {
    const finished = steps !== null && index >= steps.length;
    playBtn.disabled = playing;
    pauseBtn.disabled = !playing;
    stepBtn.disabled = playing || finished;
    newBtn.disabled = playing;
    sizeRange.disabled = playing;
    algoTabs.querySelectorAll("button").forEach((b) => (b.disabled = playing));
}

function renderInfo() {
    const info = ALGO_INFO[current];
    $("infoName").textContent = info.name;
    $("infoDesc").textContent = info.desc;
    $("infoConcept").textContent = info.concept;
    $("infoBest").textContent = info.best;
    $("infoAvg").textContent = info.avg;
    $("infoWorst").textContent = info.worst;
    $("infoSpace").textContent = info.space;
    algoTabs.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.key === current));
}

function buildTabs() {
    Object.entries(ALGO_INFO).forEach(([key, info]) => {
        const b = document.createElement("button");
        b.className = "algo-tab";
        b.dataset.key = key;
        b.textContent = info.name;
        b.addEventListener("click", () => selectAlgo(key));
        algoTabs.appendChild(b);
    });
}

// ---------- Playing steps ----------
function clearActive() {
    active.forEach((i) => barsEl.children[i]?.classList.remove("compare", "swap"));
    active = [];
}

function mark(cls, ...indexes) {
    indexes.forEach((i) => barsEl.children[i].classList.add(cls));
    active.push(...indexes);
}

function applyStep(s) {
    clearActive();
    if (s.type === "compare") {
        counts.cmp++;
        mark("compare", s.i, s.j);
    } else if (s.type === "swap") {
        [array[s.i], array[s.j]] = [array[s.j], array[s.i]];
        setBar(s.i, array[s.i]);
        setBar(s.j, array[s.j]);
        counts.swap++;
        mark("swap", s.i, s.j);
    } else if (s.type === "overwrite") {
        array[s.i] = s.value;
        setBar(s.i, s.value);
        counts.swap++;
        mark("swap", s.i);
    } else if (s.type === "sorted") {
        barsEl.children[s.i].classList.add("sorted");
    }
    updateCounts();
}

function ensureSteps() {
    if (!steps) steps = ALGORITHMS[current](array);
}

function finish() {
    clearActive();
    barsEl.querySelectorAll(".bar").forEach((b) => b.classList.add("sorted"));
    statusEl.textContent = `Sorted: ${counts.cmp} comparisons, ${counts.swap} swaps/writes.`;
}

function resetPlayback() {
    runId++;                       // stops any running loop
    playing = false;
    steps = null;
    index = 0;
    counts = { cmp: 0, swap: 0 };
    array = [...original];
    active = [];
    renderBars();
    updateCounts();
    statusEl.textContent = "";
    updateButtons();
}

function newArray() {
    original = generateArray(Number(sizeRange.value));
    resetPlayback();
}

function selectAlgo(key) {
    if (playing) return;
    current = key;
    renderInfo();
    resetPlayback(); 
}

async function play() {
    if (playing) return;
    ensureSteps();
    if (index >= steps.length) { resetPlayback(); ensureSteps(); } // finished: start over
    const myRun = ++runId;
    playing = true;
    statusEl.textContent = "";
    updateButtons();

    while (playing && myRun === runId && index < steps.length) {
        applyStep(steps[index++]);
        await sleep(getDelay());
    }
    if (myRun !== runId) return;  
    playing = false;
    if (index >= steps.length) finish();
    updateButtons();
}

function pausePlayback() {
    playing = false;
    updateButtons();
}

function stepOnce() {
    if (playing) return;
    ensureSteps();
    if (index >= steps.length) return;
    applyStep(steps[index++]);
    if (index >= steps.length) finish();
    updateButtons();
}

playBtn.addEventListener("click", play);
pauseBtn.addEventListener("click", pausePlayback);
resetBtn.addEventListener("click", resetPlayback);
stepBtn.addEventListener("click", stepOnce);
newBtn.addEventListener("click", newArray);
sizeRange.addEventListener("input", () => {
    sizeLabel.textContent = sizeRange.value;
    newArray();
});

$("themeBtn").addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ---------- Tabs: Sorting / Pathfinding ----------
const sortingView = $("sortingView"), pathView = $("pathView");
const tabSort = $("tabSort"), tabPath = $("tabPath");

function showView(name) {
    const isSort = name === "sort";
    sortingView.classList.toggle("hidden", !isSort);
    pathView.classList.toggle("hidden", isSort);

    [[tabSort, isSort], [tabPath, !isSort]].forEach(([tab, active]) => {
        tab.classList.toggle("bg-blue-600", active);
        tab.classList.toggle("text-white", active);
        tab.classList.toggle("hover:bg-slate-200", !active);
        tab.classList.toggle("dark:hover:bg-slate-800", !active);
        tab.setAttribute("aria-current", active ? "page" : "false");
    });

    if (!isSort) PathViz.init();
}

tabSort.addEventListener("click", () => showView("sort"));
tabPath.addEventListener("click", () => showView("path"));

buildTabs();
renderInfo();
newArray();