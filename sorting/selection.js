// Selection sort: find the smallest remaining item, swap it to the front.
function selectionSort(input) {
    const a = [...input];
    const n = a.length;
    const steps = [];

    for (let i = 0; i < n; i++) {
        let min = i;
        for (let j = i + 1; j < n; j++) {
            steps.push({ type: "compare", i: min, j });
            if (a[j] < a[min]) min = j;
        }
        if (min !== i) {
            [a[i], a[min]] = [a[min], a[i]];
            steps.push({ type: "swap", i, j: min });
        }
        steps.push({ type: "sorted", i });
    }
    return steps;
}