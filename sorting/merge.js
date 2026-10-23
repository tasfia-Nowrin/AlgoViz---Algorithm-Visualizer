// Merge sort: split in halves, sort each, merge them.
// Merging does not swap, it overwrites positions, step.
function mergeSort(input) {
    const a = [...input];
    const n = a.length;
    const steps = [];

    function merge(lo, mid, hi) {
        const left = a.slice(lo, mid + 1);
        const right = a.slice(mid + 1, hi + 1);
        let i = 0, j = 0, k = lo;

        while (i < left.length && j < right.length) {
            steps.push({ type: "compare", i: lo + i, j: mid + 1 + j });
            if (left[i] <= right[j]) a[k] = left[i++];
            else a[k] = right[j++];
            steps.push({ type: "overwrite", i: k, value: a[k] });
            k++;
        }
        while (i < left.length) {
            a[k] = left[i++];
            steps.push({ type: "overwrite", i: k, value: a[k] });
            k++;
        }
        while (j < right.length) {
            a[k] = right[j++];
            steps.push({ type: "overwrite", i: k, value: a[k] });
            k++;
        }
    }

    function sort(lo, hi) {
        if (lo >= hi) return;
        const mid = Math.floor((lo + hi) / 2);
        sort(lo, mid);
        sort(mid + 1, hi);
        merge(lo, mid, hi);
    }

    sort(0, n - 1);
    for (let k = 0; k < n; k++) steps.push({ type: "sorted", i: k });
    return steps;
}