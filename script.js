const visualizer = document.getElementById("visualizer");
const sizeInput = document.getElementById("input-size");
const heightInput = document.getElementById("bar-height");
const speedInput = document.getElementById("speed");
const algoSelect = document.getElementById("algorithm");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resumeBtn = document.getElementById("resume");
const darkToggle = document.getElementById("dark-mode");

let array = [];
let delay = 100;
let isPaused = false;
let shouldStop = false;
let comparisons = 0;
let swaps = 0;


darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

function generateArray(size, maxHeight) {
  array = Array.from({ length: size }, () => Math.floor(Math.random() * maxHeight) + 1);
  renderArray();
}

function renderArray() {
  visualizer.innerHTML = "";
  const barWidth = Math.max(1000 / array.length, 20); // auto-fit based on array size
  array.forEach((val) => {
    const bar = document.createElement("div");
    bar.classList.add("bar", "default");
    bar.style.height = `${val}px`;
    bar.style.width = `${barWidth}px`; // Set dynamic width
    bar.innerHTML = `<span>${val}</span>`;
    visualizer.appendChild(bar);
  });
}


function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function pauseCheck() {
  while (isPaused) await sleep(50);
  if (shouldStop) throw new Error("Stopped");
}

async function swap(i, j) {
  [array[i], array[j]] = [array[j], array[i]];
  swaps++;
  updateSwapCount();
  renderArray();
  await pauseCheck();
  await sleep(delay);
}


function getBars() {
  return [...document.querySelectorAll(".bar")];
}

function updateBar(i, className) {
  const bars = getBars();
  bars[i].className = `bar ${className}`;
}

async function bubbleSort() {
  const n = array.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      updateBar(j, "compare");
      updateBar(j + 1, "compare");
      await pauseCheck();
      await sleep(delay);
      if (array[j] > array[j + 1]) {
        updateBar(j, "swap");
        updateBar(j + 1, "swap");
        await swap(j, j + 1);
      }
      updateBar(j, "default");
      updateBar(j + 1, "default");
    }
    updateBar(n - i - 1, "sorted");
  }
  comparisons++;
updateComparisonCount();

}

async function selectionSort() {
  const n = array.length;
  for (let i = 0; i < n; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      updateBar(j, "compare");
      await pauseCheck();
      await sleep(delay);
      if (array[j] < array[min]) min = j;
      updateBar(j, "default");
    }
    if (i !== min) {
      updateBar(i, "swap");
      updateBar(min, "swap");
      await swap(i, min);
    }
    updateBar(i, "sorted");
  }
  comparisons++;
updateComparisonCount();

}

async function insertionSort() {
  const n = array.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0 && array[j] < array[j - 1]) {
      updateBar(j, "swap");
      updateBar(j - 1, "swap");
      await swap(j, j - 1);
      updateBar(j, "default");
      updateBar(j - 1, "default");
      j--;
    }
    updateBar(i, "sorted");
  }
  comparisons++;
updateComparisonCount();

}

async function mergeSort(start = 0, end = array.length - 1) {
  if (start >= end) return;

  const mid = Math.floor((start + end) / 2);
  await mergeSort(start, mid);
  await mergeSort(mid + 1, end);

  let left = array.slice(start, mid + 1);
  let right = array.slice(mid + 1, end + 1);
  let i = 0, j = 0, k = start;

  while (i < left.length && j < right.length) {
    updateBar(k, "compare");
    await pauseCheck();
    await sleep(delay);

    if (left[i] <= right[j]) {
      array[k++] = left[i++];
    } else {
      array[k++] = right[j++];
    }

    renderArray();
  }

  while (i < left.length) {
    array[k++] = left[i++];
    renderArray();
    await pauseCheck();
    await sleep(delay);
  }

  while (j < right.length) {
    array[k++] = right[j++];
    renderArray();
    await pauseCheck();
    await sleep(delay);
  }

  // Highlight merged section
  for (let idx = start; idx <= end; idx++) {
    updateBar(idx, "sorted");
    await sleep(30);
  }

  comparisons++;
  updateComparisonCount();
}


async function quickSort(start = 0, end = array.length - 1) {
  if (start >= end) return;

  let pivotIndex = end;
  let pivot = array[pivotIndex];
  updateBar(pivotIndex, "pivot"); // NEW: mark pivot

  let i = start;
  for (let j = start; j < end; j++) {
    updateBar(j, "compare");
    await pauseCheck();
    await sleep(delay);

    if (array[j] < pivot) {
      updateBar(i, "swap");
      updateBar(j, "swap");
      await swap(i, j);
      updateBar(i, "default");
      updateBar(j, "default");
      i++;
    }

    updateBar(j, "default");
  }

  await swap(i, pivotIndex); // Move pivot to correct position
  updateBar(i, "sorted"); // Mark pivot as sorted

  await quickSort(start, i - 1);
  await quickSort(i + 1, end);
}

async function heapSort() {
  const n = array.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(n, i);
  for (let i = n - 1; i > 0; i--) {
    await swap(0, i);
    await heapify(i, 0);
    updateBar(i, "sorted");
  }
  updateBar(0, "sorted");
  comparisons++;
updateComparisonCount();

}

const algorithms = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
  quick: quickSort,
  heap: heapSort,
};

const complexities = {
  bubble: {
    time: "Best: O(n), Average: O(n²), Worst: O(n²)",
    space: "O(1)"
  },
  selection: {
    time: "Best: O(n²), Average: O(n²), Worst: O(n²)",
    space: "O(1)"
  },
  insertion: {
    time: "Best: O(n), Average: O(n²), Worst: O(n²)",
    space: "O(1)"
  },
  merge: {
    time: "Best: O(n log n), Average: O(n log n), Worst: O(n log n)",
    space: "O(n)"
  },
  quick: {
    time: "Best: O(n log n), Average: O(n log n), Worst: O(n²)",
    space: "O(log n)"
  },
  heap: {
    time: "Best: O(n log n), Average: O(n log n), Worst: O(n log n)",
    space: "O(1)"
  }
};

function updateComplexities() {
  const selected = document.getElementById("algorithm").value;
  const comp = complexities[selected];
  document.getElementById("time-complexity").innerText = comp?.time || "-";
  document.getElementById("space-complexity").innerText = comp?.space || "-";
}

// Run on algorithm change
document.getElementById("algorithm").addEventListener("change", updateComplexities);
// Run on page load to set initial values
window.addEventListener("DOMContentLoaded", updateComplexities);

function updateComparisonCount() {
  document.getElementById("comparison-count").innerText = comparisons;
}

function updateSwapCount() {
  document.getElementById("swap-count").innerText = swaps;
}


startBtn.addEventListener("click", async () => {
  shouldStop = false;
  delay = 200 - speedInput.value;
  generateArray(+sizeInput.value, +heightInput.value);
  const algo = algoSelect.value;
  try {
    await algorithms[algo]();
  } catch {}
  comparisons = 0;
swaps = 0;
updateComparisonCount();
updateSwapCount();

});

pauseBtn.onclick = () => { isPaused = true; };
resumeBtn.onclick = () => { isPaused = false; };
// Add to script.js
document.getElementById("stop").onclick = () => {
  shouldStop = true;
};

// Modify pauseCheck to throw immediately if shouldStop is set
async function pauseCheck() {
  if (shouldStop) throw new Error("Stopped");
  while (isPaused) {
    await sleep(50);
    if (shouldStop) throw new Error("Stopped");
  }
}
