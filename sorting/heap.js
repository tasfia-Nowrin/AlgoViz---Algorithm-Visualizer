// Heap sort: build a max-heap, then move the largest item to the end again and again.
function heapSort(input) {
    const a = [...input];
    const n = a.length;
    const steps = [];

    function siftDown(root, end) { // end is exclusive
        while (true) {
            let big = root;
            const l = 2 * root + 1;
            const r = l + 1;
            if (l < end) { steps.push({ type: "compare", i: l, j: big }); if (a[l] > a[big]) big = l; }
            if (r < end) { steps.push({ type: "compare", i: r, j: big }); if (a[r] > a[big]) big = r; }
            if (big === root) return;
            [a[root], a[big]] = [a[big], a[root]];
            steps.push({ type: "swap", i: root, j: big });
            root = big;
        }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
    for (let end = n - 1; end > 0; end--) {
        [a[0], a[end]] = [a[end], a[0]];
        steps.push({ type: "swap", i: 0, j: end });
        steps.push({ type: "sorted", i: end });
        siftDown(0, end);
    }
    steps.push({ type: "sorted", i: 0 });
    return steps;
}