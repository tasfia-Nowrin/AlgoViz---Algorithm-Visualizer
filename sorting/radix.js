// Radix sort: sort by the ones digit, then tens, then hundreds.
function radixSort(input) {
    let a = [...input];
    const steps = [];
    const max = Math.max(...a);

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        const buckets = Array.from({ length: 10 }, () => []);
        a.forEach((v) => buckets[Math.floor(v / exp) % 10].push(v));
        a = buckets.flat();
        a.forEach((v, i) => steps.push({ type: "overwrite", i, value: v }));
    }
    for (let k = 0; k < a.length; k++) steps.push({ type: "sorted", i: k });
    return steps;
}