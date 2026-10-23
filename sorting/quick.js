// Quick sort: the last item is the pivot.
function quickSort(input) {
    const a = [...input];
    const steps = [];

    function sort(lo, hi) {
        if (lo > hi) return;
        if (lo === hi) {
            steps.push({ type: "sorted", i: lo });
            return;
        }

        const pivot = a[hi];
        let p = lo; // final position of the pivot

        for (let j = lo; j < hi; j++) {
            steps.push({ type: "compare", i: j, j: hi });
            if (a[j] < pivot) {
                if (p !== j) {
                    [a[p], a[j]] = [a[j], a[p]];
                    steps.push({ type: "swap", i: p, j });
                }
                p++;
            }
        }
        if (p !== hi) {
            [a[p], a[hi]] = [a[hi], a[p]];
            steps.push({ type: "swap", i: p, j: hi });
        }
        steps.push({ type: "sorted", i: p });

        sort(lo, p - 1);
        sort(p + 1, hi);
    }

    sort(0, a.length - 1);
    return steps;
}