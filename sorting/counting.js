// Counting sort: count each value, then write the values back in order (no comparisons).
function countingSort(input) {
    const steps = [];
    const max = Math.max(...input);
    const count = Array(max + 1).fill(0);
    input.forEach((v) => count[v]++);

    let k = 0;
    for (let v = 0; v <= max; v++) {
        for (let c = 0; c < count[v]; c++) {
            steps.push({ type: "overwrite", i: k, value: v });
            steps.push({ type: "sorted", i: k });
            k++;
        }
    }
    return steps;
}