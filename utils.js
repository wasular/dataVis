// The sum function takes an array (of any dimension up to 3) and sums its elements along a specific axis.
function sum(arr, axis) {
  // Handle 1D array
  if (!Array.isArray(arr[0])) {
    return arr.reduce((a, b) => a + b, 0);
  }

  // Handle 2D array
  if (!Array.isArray(arr[0][0])) {
    if (axis === 0) {
      // Summing columns
      return arr[0].map((_, i) => arr.reduce((a, b) => a + b[i], 0));
    } else if (axis === 1) {
      // Summing rows
      return arr.map((row) => row.reduce((a, b) => a + b, 0));
    } else {
      // No axis specified
      return arr.reduce((a, b) => a.concat(b)).reduce((a, b) => a + b, 0);
    }
  }

  // Handle 3D array
  if (!Array.isArray(arr[0][0][0])) {
    if (axis === 0) {
      // Sum over the first dimension
      return arr.reduce((a, b) =>
        a.map((row, i) => row.map((val, j) => val + b[i][j]))
      );
    } else if (axis === 1) {
      // Sum over the second dimension
      return arr.map((mat) =>
        mat.reduce((a, b) => a.map((val, j) => val + b[j]))
      );
    } else if (axis === 2) {
      // Sum over the third dimension
      return arr.map((mat) =>
        mat.map((row, i) => row.reduce((a, b) => a + b, 0))
      );
    } else if (Array.isArray(axis)) {
      // Sum over specific dimensions
      if (axis.includes(1) && axis.includes(2)) {
        return arr.map((mat) => {
          return mat.reduce((sum, row) => {
            return sum + row.reduce((a, b) => a + b, 0);
          }, 0);
        });
      }
    } else {
      // No axis specified
      return arr
        .reduce((a, b) => a.concat(b))
        .reduce((a, b) => a.concat(b))
        .reduce((a, b) => a + b, 0);
    }
  }
}

// randn function generates a multidimensional array with normally distributed random numbers
// The dimensions of the array are given by the arguments to the function
function randn() {
  // Converts the arguments object to a real array using Array.prototype.slice
  const dimensions = Array.prototype.slice.call(arguments);

  // Function to recursively generate arrays
  const generateArray = (dimensions) => {
    // Base case: if there are no dimensions left, we generate a normally distributed random number
    if (dimensions.length === 0) {
      let u1 = Math.random();
      let u2 = Math.random();
      // This is the Box-Muller transform, it generates a normally distributed random number
      let randStdNormal =
        Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
      return randStdNormal;
    }

    // Recursive case: generate a new array for the current dimension
    let dimension = dimensions[0];
    let arr = [];
    for (let i = 0; i < dimension; i++) {
      // Recursive call to generate the next dimension
      arr.push(generateArray(dimensions.slice(1)));
    }
    return arr;
  };

  return generateArray(dimensions);
}

// zeros function generates a multidimensional array filled with zeros
// The dimensions of the array are given by the arguments to the function
function zeros() {
  // Converts the arguments object to a real array using Array.prototype.slice
  const dimensions = Array.prototype.slice.call(arguments);

  // Function to recursively generate arrays
  const generateArray = (dimensions) => {
    // Base case: if there are no dimensions left, we return 0
    if (dimensions.length === 0) {
      return 0;
    }

    // Recursive case: generate a new array for the current dimension
    let dimension = dimensions[0];
    let arr = [];
    for (let i = 0; i < dimension; i++) {
      // Recursive call to generate the next dimension
      arr.push(generateArray(dimensions.slice(1)));
    }
    return arr;
  };

  return generateArray(dimensions);
}

function saveParams(filename, params) {
  fs.writeFileSync(filename, JSON.stringify(params));
}

async function loadParams(url) {
  const response = await fetch(url);
  const data = await response.json();

  return data;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// The operation function for add, subtract, divide, and multiply
function elementWiseOp(op, a, b) {
  if (isNumeric(a)) {
    // a is a scalar
    if (isNumeric(b)) {
      // b is also a scalar
      return op(a, b);
    } else if (Array.isArray(b[0])) {
      // b is a 2D or 3D array
      if (Array.isArray(b[0][0])) {
        // b is a 3D array
        return b.map((matrixB) =>
          matrixB.map((rowB) => rowB.map((eleB) => op(a, eleB)))
        );
      } else {
        // b is a 2D array
        return b.map((rowB) => rowB.map((eleB) => op(a, eleB)));
      }
    } else {
      // b is a 1D array
      return b.map((eleB) => op(a, eleB));
    }
  } else if (Array.isArray(a[0])) {
    // a is a 2D or 3D array
    if (isNumeric(b)) {
      // b is a scalar
      if (Array.isArray(a[0][0])) {
        // a is a 3D array
        return a.map((matrixA) =>
          matrixA.map((rowA) => rowA.map((eleA) => op(eleA, b)))
        );
      } else {
        // a is a 2D array
        return a.map((rowA) => rowA.map((eleA) => op(eleA, b)));
      }
    } else if (Array.isArray(b[0])) {
      // Both a and b are 2D or 3D: perform operation with broadcasting if needed
      if (Array.isArray(a[0][0]) && Array.isArray(b[0][0])) {
        // Both a and b are 3D arrays
        return a.map((matrixA, k) =>
          matrixA.map((rowA, i) => rowA.map((eleA, j) => op(eleA, b[k][i][j])))
        );
      } else if (Array.isArray(a[0][0])) {
        // a is a 3D array, b is a 2D array
        return a.map((matrixA) =>
          matrixA.map((rowA, i) => rowA.map((eleA, j) => op(eleA, b[i][j])))
        );
      } else {
        // Both a and b are 2D arrays
        return a.map((rowA, i) => rowA.map((eleA, j) => op(eleA, b[i][j])));
      }
    } else {
      // b is a 1D array
      if (Array.isArray(a[0][0])) {
        // a is a 3D array, b is a 1D array
        return a.map((matrixA) =>
          matrixA.map((rowA) => rowA.map((eleA, j) => op(eleA, b[j])))
        );
      } else {
        // a is a 2D array
        return a.map((rowA) => rowA.map((eleA, j) => op(eleA, b[j])));
      }
    }
  } else {
    // a is a 1D array
    if (isNumeric(b)) {
      // b is a scalar
      return a.map((eleA) => op(eleA, b));
    } else if (Array.isArray(b[0])) {
      // b is a 2D or 3D array
      if (Array.isArray(b[0][0])) {
        // b is a 3D array
        return b.map((matrixB) =>
          matrixB.map((rowB) => rowB.map((eleB, j) => op(a[j], eleB)))
        );
      } else {
        // b is a 2D array
        return b.map((rowB) => rowB.map((eleB, j) => op(a[j], eleB)));
      }
    } else {
      // Both a and b are 1D arrays
      return a.map((eleA, i) => op(eleA, b[i]));
    }
  }
}

// Functions for addition, subtraction, multiplication, and division
function add(a, b) {
  return elementWiseOp((x, y) => x + y, a, b);
}

function subtract(a, b) {
  return elementWiseOp((x, y) => x - y, a, b);
}

function multiply(a, b) {
  return elementWiseOp((x, y) => x * y, a, b);
}

function divide(a, b) {
  return elementWiseOp((x, y) => x / y, a, b);
}

function opposite(a) {
  return elementWiseOp((x) => -x, a, a);
}

function flatten(arr, depth = 1) {
  return arr.reduce((flat, toFlatten) => {
    return flat.concat(
      Array.isArray(toFlatten) && depth > 1
        ? flatten(toFlatten, depth - 1)
        : toFlatten
    );
  }, []);
}

function expandDims(arr, axis) {
  if (axis === 0) {
    return [arr];
  } else if (axis === 1) {
    return arr.map((e) => [e]);
  } else if (axis === 2) {
    return arr.map((e) => e.map((el) => [el]));
  } else {
    throw new Error("Axis out of bound");
  }
}

function getDims(arr) {
  if (Array.isArray(arr)) {
    return 1 + getDims(arr[0]);
  } else {
    return 0;
  }
}

// This function reshapes an array into the specified shape.
// The reshaping is done by flattening the array and then partitioning it according to the new shape.
function reshape(array, shape) {
  // Check if the array argument is actually an array.
  if (!Array.isArray(array)) {
    throw new Error("The first argument must be an array");
  }

  // Check if the shape argument is an array.
  if (!Array.isArray(shape)) {
    throw new Error(
      "The second argument must be an array specifying the new shape"
    );
  }

  // Calculate the total size of the array by reducing it.
  // If an element is an array, add its length. If not, add 1.
  const totalSize = array.reduce((acc, cur) => {
    return acc + (Array.isArray(cur) ? cur.length : 1);
  }, 0);

  // Calculate the total size of the new shape by reducing it.
  // The accumulator and the current value are multiplied at each step.
  const newTotalSize = shape.reduce((acc, cur) => acc * cur, 1);

  // Check if the total sizes match.
  if (totalSize !== newTotalSize) {
    throw new Error(
      "The total size of the new shape must match the total size of the array"
    );
  }

  // Flatten the array to 1 dimension.
  const flatArray = array.flat(Infinity);

  // Recursive helper function to partition the array.
  function _divide(arr, shapeIndex) {
    // Base case: if the shape index is larger than the shape length, return the array.
    if (shapeIndex >= shape.length) {
      return arr;
    }

    const dividedArray = [];
    const chunkSize = shape[shapeIndex];

    // Loop over the array in chunks of size chunkSize.
    for (let i = 0; i < arr.length; i += chunkSize) {
      // Recursive call with a slice of the array and incremented shape index.
      dividedArray.push(_divide(arr.slice(i, i + chunkSize), shapeIndex + 1));
    }

    return dividedArray;
  }

  // Call the recursive helper function with the flattened array and initial shape index of 0.
  return _divide(flatArray, 0);
}

function getMaxIndex(arr) {
  let maxIndex = 0;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
      maxIndex = i;
    }
  }
  return maxIndex;
}

// This function computes the maximum of an array along specified axis.
function amax(input, axis = null) {
  // If the input is not an array, return the input itself
  if (!Array.isArray(input)) {
    return input;
  }

  // If the input is a 1D array, find and return the maximum element
  if (!Array.isArray(input[0])) {
    return Math.max(...input);
  }

  // If the input is a 2D array, find the maximum element along the specified axis
  if (!Array.isArray(input[0][0])) {
    if (axis === 0) {
      // If axis is 0, find maximum along each column
      return input[0].map((_, idx) =>
        Math.max(...input.map((row) => row[idx]))
      );
    } else if (axis === 1) {
      // If axis is 1, find maximum along each row
      return input.map((row) => Math.max(...row));
    } else if (JSON.stringify(axis) === JSON.stringify([0, 1])) {
      // If axis is [0, 1], flatten the 2D array and find the maximum
      return Math.max(...[].concat(...input));
    }
  } else {
    // If the input is a 3D array, find the maximum element along the specified axis
    if (axis === 0) {
      // If axis is 0, find maximum along the first dimension
      return input.reduce((maxArr, currArr) =>
        maxArr.map((row, i) => row.map((el, j) => Math.max(el, currArr[i][j])))
      );
    } else if (axis === 1) {
      // If axis is 1, find maximum along the second dimension
      return input.map((arr) =>
        arr.reduce((maxRow, currRow) =>
          maxRow.map((el, j) => Math.max(el, currRow[j]))
        )
      );
    } else if (axis === 2) {
      // If axis is 2, find maximum along the third dimension
      return input.map((arr) => arr.map((row) => Math.max(...row)));
    } else if (JSON.stringify(axis) === JSON.stringify([0, 1])) {
      // If axis is [0, 1], find maximum along the first and second dimension
      return input
        .reduce((maxArr, currArr) =>
          maxArr.map((row, i) =>
            row.map((el, j) => Math.max(el, currArr[i][j]))
          )
        )
        .reduce((maxRow, currRow) =>
          maxRow.map((el, j) => Math.max(el, currRow[j]))
        );
    } else if (JSON.stringify(axis) === JSON.stringify([1, 2])) {
      // If axis is [1, 2], find maximum along the second and third dimension
      return input.map((arr) => Math.max(...[].concat(...arr)));
    } else if (JSON.stringify(axis) === JSON.stringify([0, 1, 2])) {
      // If axis is [0, 1, 2], flatten the 3D array and find the maximum
      return Math.max(...[].concat(...[].concat(...input)));
    }
  }
}

function checkBroadcastable(a, b) {
  if (a.length !== b.length && b.length !== 1 && a.length !== 1) {
    throw "Incompatible shapes for broadcasting";
  }
  if (b.length > a.length) {
    [a, b] = [b, a];
  }
  for (let i = a.length - 1, j = b.length - 1; i >= 0, j >= 0; i--, j--) {
    if (a[i] !== b[j] && b[j] !== 1) {
      throw "Incompatible shapes for broadcasting";
    }
  }
  return true;
}

// Box-Muller transform to generate a normally distributed random number
function normalRandom(mean = 0.0, stdDev = 1.0) {
  const u1 = Math.random();
  const u2 = Math.random();
  const randStdNormal =
    Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
  return mean + stdDev * randStdNormal;
}

// Create a matrix with normally distributed random numbers
function createNormalDistributedMatrix(rows, cols, stdDev) {
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(normalRandom(0.0, stdDev));
    }
    matrix.push(row);
  }
  return matrix;
}

function create2DArray(input) {
  if (!Array.isArray(input)) {
    // If input is a scalar
    return [[input]];
  }

  if (!Array.isArray(input[0])) {
    // If input is a 1D array
    return [input];
  }

  // If input is a 2D array or larger
  return input;
}

function transpose(matrix) {
  // Check if the matrix is a scalar or 1D array
  if (typeof matrix === "number" || !Array.isArray(matrix[0])) {
    return matrix;
  }

  // If it's a 2D array, perform the transpose operation
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}

// Matrix function for dot product
function dot(a, b) {
  if (!Array.isArray(b[0])) {
    // if b is a 1D array
    if (!Array.isArray(a[0])) {
      // if a is a 1D array
      // Dot product for 1D array
      if (a.length !== b.length) throw "Invalid dimensions";
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        result += a[i] * b[i];
      }
      return result;
    } else {
      // if a is a 2D array
      // Multiply 2D array with 1D array
      let result = new Array(a.length).fill(0);
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
          result[i] += a[i][j] * b[j];
        }
      }
      return create2DArray(result);
    }
  } else {
    // if b is a 2D array
    if (!Array.isArray(a[0])) {
      // if a is a 1D array
      throw "Invalid dimensions for dot product";
    } else {
      // if a is a 2D array
      // Multiply 2D array with 2D array
      let result = new Array(a.length)
        .fill(0)
        .map(() => new Array(b[0].length).fill(0));
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b[0].length; j++) {
          for (let k = 0; k < b.length; k++) {
            result[i][j] += a[i][k] * b[k][j];
          }
        }
      }
      return result;
    }
  }
}

function topKIndices(array, k) {
  let sortedIndices = array
    .map((value, index) => [value, index])
    .sort(([a], [b]) => b - a)
    .map(([_, index]) => index);

  return sortedIndices.slice(0, k);
}

// Sigmoid Activation Function
function sigmoid(x) {
  // Check if x is an array
  if (Array.isArray(x)) {
    return x.map((el) => sigmoid(el)); // Recursively apply sigmoid function
  } else {
    return 1 / (1 + Math.exp(-x));
  }
}

function getShape(array) {
  let shape = [];
  let currentArray = array;

  while (Array.isArray(currentArray)) {
    shape.push(currentArray.length);
    currentArray = currentArray[0];
  }

  return shape;
}

function expArray(value) {
  if (Array.isArray(value)) {
    if (value.length === 1 && Array.isArray(value[0])) {
      return value[0].map(expArray);
    } else {
      return value.map(expArray);
    }
  } else if (typeof value === "number") {
    return Math.exp(value);
  } else {
    console.log("Unexpected input type!");
  }
}

function rotateArray(arr) {
  let rotatedArr = new Array(arr.length);
  for (let i = 1; i < arr.length; i++) {
    let oldRow = Math.floor((i - 1) / 28);
    let oldCol = (i - 1) % 28;

    let newRow = 27 - oldCol;
    let newCol = oldRow;

    let newIndex = newRow * 28 + newCol + 1;

    rotatedArr[newIndex] = arr[i];
  }
  return rotatedArr;
}
