// Bubble sort: does NOT touch the DOM. It only returns a list of steps.
// Step types: compare (i, j), swap (i, j), sorted (i)
function bubbleSort(input) {
    const a = [...input];          // work on a copy
    const n = a.length;
    const steps = [];

    for (let i = 0; i < n; i++) {
        let swapped = false;

        for (let j = 0; j < n - i - 1; j++) {
            steps.push({ type: "compare", i: j, j: j + 1 });

            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                steps.push({ type: "swap", i: j, j: j + 1 });
                swapped = true;
            }
        }

        steps.push({ type: "sorted", i: n - i - 1 }); // last item is now in place

        if (!swapped) {                // no swaps: everything left is sorted
            for (let k = 0; k < n - i - 1; k++) steps.push({ type: "sorted", i: k });
            break;
        }
    }
    return steps;
}