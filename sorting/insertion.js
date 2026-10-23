// Insertion sort: take each item and move it left until it is in place.
// Moves are shown as neighbor swaps so the animation is easy to follow.
function insertionSort(input) {
    const a = [...input];
    const n = a.length;
    const steps = [];

    for (let i = 1; i < n; i++) {
        let j = i;
        while (j > 0) {
            steps.push({ type: "compare", i: j - 1, j });
            if (a[j - 1] > a[j]) {
                [a[j - 1], a[j]] = [a[j], a[j - 1]];
                steps.push({ type: "swap", i: j - 1, j });
                j--;
            } else {
                break;
            }
        }
    }
    for (let k = 0; k < n; k++) steps.push({ type: "sorted", i: k });
    return steps;
}