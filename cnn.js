// ConvolutionLayer applies a set of convolutional filters to the input image. This process allows the neural network to learn local features.
class ConvolutionLayer {
  // Constructor for the ConvolutionLayer class. Initializes the layer with a specific number of kernels, each of a certain size.
  constructor(kernelNum, kernelSize, kernels) {
    // kernels are either provided or initialized with random weights if not provided.
    this.kernelNum = kernelNum;
    this.kernelSize = kernelSize;
    this.kernels = kernels || randn(kernelNum, kernelSize, kernelSize);
  }

  // Generator function that yields patches of the image. The patch size corresponds to the kernel size. T
  // his function is used to slide the kernel across the image during the convolution process.
  *patches(image) {
    // The image to be convolved is stored for use in backpropagation.
    this.image = image;
    // Get the shape (height and width) of the image.
    const imageShape = getShape(image);
    const imageH = imageShape[0];
    const imageW = imageShape[1];
    // Sliding the kernel across the image to generate patches.
    for (let h = 0; h <= imageH - this.kernelSize; h++) {
      for (let w = 0; w <= imageW - this.kernelSize; w++) {
        // The patch is a sub-image with dimensions equal to the kernel's size.
        let patch = [];
        for (let i = h; i < h + this.kernelSize; i++) {
          patch.push(image[i].slice(w, w + this.kernelSize));
        }
        // Yielding each patch along with its location (h, w) in the image.
        yield { patch, h, w };
      }
    }
  }

  // Conducts forward propagation through the convolutional layer.
  // The operation involves taking each patch of the image, applying the convolution operation with the kernels, and storing the results.
  forwardProp(image) {
    // Get the shape of the image.
    const imageShape = getShape(image);
    const imageH = imageShape[0];
    const imageW = imageShape[1];

    // Initialize the output of the convolution operation.
    // The dimensions are based on the image size and the kernel size.
    let convolutionOutput = zeros(
      subtract(imageH, this.kernelSize) + 1,
      subtract(imageW, this.kernelSize) + 1,
      this.kernelNum
    );

    // Applying the convolution operation.
    for (const { patch, h, w } of this.patches(image)) {
      // Each patch is multiplied by the kernels (applying the filters), and the results are summed up.
      // This result is placed in the corresponding location in the convolutionOutput.
      convolutionOutput[h][w] = sum(multiply(this.kernels, patch), [1, 2]);
    }

    // The output of the convolution operation is stored for use in backpropagation.
    this.convolutionOutput = convolutionOutput;

    // Returning the result of the convolution operation.
    return convolutionOutput;
  }

  // Conducts backpropagation through the convolutional layer.
  // The operation involves computing the gradient of the loss function with respect to the parameters of this layer (the kernels).
  backProp(errorGradient, alpha) {
    // Initialize the gradient of the loss function with respect to the kernel weights.
    let errorGradientKernel = zeros(...getShape(this.kernels));

    // Loop over each patch of the original image again.
    for (const { patch, h, w } of this.patches(this.image)) {
      // For each filter in the kernel
      for (let f = 0; f < this.kernelNum; f++) {
        // The gradient is updated based on the error gradient passed from the following layer and the patch.
        errorGradientKernel[f] = add(
          errorGradientKernel[f],
          multiply(errorGradient[h][w][f], patch)
        );
      }
    }

    // Update the parameters (kernels) of this layer based on the computed gradients and the learning rate (alpha).
    this.kernels = subtract(this.kernels, multiply(errorGradientKernel, alpha));

    // Return the computed error gradient for the previous layer.
    return errorGradientKernel;
  }
}

class MaxPoolingLayer {
  constructor(kernelSize) {
    this.kernelSize = kernelSize;
  }
  // Generator function that yields patches of the image. The patch size corresponds to the pooling size.
  // This function is used to slide the pooling window across the image during the pooling process.
  *patches(image) {
    const imageShape = getShape(image);
    const imageH = imageShape[0];
    const imageW = imageShape[1];
    // Determine the dimensions of the output based on the input image size and the kernel size.
    let output_h = Math.floor(imageH / this.kernelSize);
    let output_w = Math.floor(imageW / this.kernelSize);
    this.image = image;
    // Slide the pooling window across the image to generate patches.
    for (let h = 0; h < output_h; h++) {
      for (let w = 0; w < output_w; w++) {
        let patch = image
          .slice(h * this.kernelSize, h * this.kernelSize + this.kernelSize)
          .map((row) =>
            row.slice(
              w * this.kernelSize,
              w * this.kernelSize + this.kernelSize
            )
          );
        // Yield each patch along with its location (h, w) in the image.
        yield { patch: patch, h: h, w: w };
      }
    }
  }
  // Conducts forward propagation through the max pooling layer.
  // This operation involves taking each patch of the image, applying the max pooling operation, and storing the results.
  forwardProp(image) {
    let imageShape = getShape(image);
    const imageH = imageShape[0];
    const imageW = imageShape[1];
    const numKernels = imageShape[2];
    // Store the input image for use in backpropagation.
    this.image = image;
    // Initialize the output of the max pooling operation.
    let maxPoolingOutput = zeros(
      Math.floor(imageH / this.kernelSize),
      Math.floor(imageW / this.kernelSize),
      numKernels
    );
    // Apply the max pooling operation.
    for (const { patch, h, w } of this.patches(this.image)) {
      maxPoolingOutput[h][w] = amax(patch, [0, 1]);
    }
    // Store the output of the max pooling operation for use in backpropagation.
    this.maxPoolingOutput = maxPoolingOutput;

    return maxPoolingOutput;
  }
  // Conducts backpropagation through the max pooling layer.
  // This operation involves propagating the error gradient back to the locations of the maximum values in each pooling window.
  backProp(errorGradient) {
    let errorGradientKernel = zeros(...getShape(this.image));

    for (const { patch, h, w } of this.patches(this.image)) {
      let imageShape = getShape(patch);
      const imageH = imageShape[0];
      const imageW = imageShape[1];
      const numKernels = imageShape[2];
      let maxVal = amax(patch, [0, 1]);
      // The gradient is propagated back to the location of the maximum value.
      for (let i = 0; i < imageH; i++) {
        for (let j = 0; j < imageW; j++) {
          for (let k = 0; k < numKernels; k++) {
            if (patch[i][j][k] == maxVal[k]) {
              errorGradientKernel[h * this.kernelSize + i][
                w * this.kernelSize + j
              ][k] = errorGradient[h][w][k];
            }
          }
        }
      }
    }
    return errorGradientKernel;
  }
}
// SoftMaxLayer is the final layer of the network, which applies a softmax function to the inputs.
// This operation converts the inputs into probability values that sum to 1, which can be interpreted as class probabilities.
class SoftMaxLayer {
  constructor(inputUnits, outputUnits, weight, bias) {
    this.weight = weight || randn(inputUnits, outputUnits);
    this.bias = bias || zeros(outputUnits);
  }
  // Conducts forward propagation through the softmax layer.
  forwardProp(image) {
    this.originalShape = getShape(image);
    let imageFlattend = [flatten(image, 2)];
    // Store the input image for use in backpropagation.
    this.flattendInput = imageFlattend;
    let firstOutput;
    this.hiddenOutputHighlights = topKIndices(imageFlattend[0], 25);
    firstOutput = add(dot(imageFlattend, this.weight), this.bias);
    this.output = flatten(firstOutput, 2);
    // Store the output of the softmax function for use in backpropagation.
    let softmaxOutput = divide(
      expArray(firstOutput),
      sum(expArray(firstOutput), 0)
    );

    return softmaxOutput;
  }
  // Conducts backpropagation through the softmax layer.
  backProp(errorGradient, alpha) {
    for (let i = 0; i < errorGradient.length; i++) {
      let gradient = errorGradient[i];
      if (gradient === 0) {
        continue;
      }

      let transformationEQ = expArray(this.output);
      let sTotal = sum(transformationEQ);
      let gradientYOutputZ = divide(
        multiply(opposite(transformationEQ[i]), transformationEQ),
        multiply(sTotal, sTotal)
      );
      gradientYOutputZ[i] = divide(
        multiply(transformationEQ[i], sTotal - transformationEQ[i]),
        multiply(sTotal, sTotal)
      );
      let gradientZWeight = flatten(this.flattendInput, 2);
      let gradientZBias = 1;
      let gradientZInput = this.weight;
      let gradientErrorOutputZ = multiply(gradient, gradientYOutputZ);

      let gradientErrorWeight = dot(
        expandDims(gradientZWeight, 1),
        expandDims(gradientErrorOutputZ, 0)
      );
      let gradientErrorBias = multiply(gradientErrorOutputZ, gradientZBias);
      let gradientErrorInput = dot(gradientZInput, gradientErrorOutputZ);

      this.weight = subtract(this.weight, multiply(gradientErrorWeight, alpha));
      this.bias = subtract(this.bias, multiply(alpha, gradientErrorBias));

      return math.reshape(gradientErrorInput, [13, 13, 16]);
    }
  }
}
// Forward Pass through all Layers.
function CNNForward(image, label, layers) {
  let output = divide(image, 255);

  for (const layer of layers) {
    output = layer.forwardProp(output);
  }

  let loss = -Math.log(output[label]);
  let maxOutput = Math.max(...output);
  let labelMax = output.findIndex(
    (val) => Math.abs(val - maxOutput) < Number.EPSILON
  );

  let accuracy = labelMax === label ? 1 : 0;
  return { output, loss, accuracy };
}
// BackProp Pass through all Layers.
function CNNBackprop(gradient, layers, alpha = 0.05) {
  let gradBack = gradient;

  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];

    if (layer instanceof ConvolutionLayer || layer instanceof SoftMaxLayer) {
      gradBack = layer.backProp(gradBack, alpha);
    } else if (layer instanceof MaxPoolingLayer) {
      gradBack = layer.backProp(gradBack);
    }
  }

  return gradBack;
}
// Train the model.
function CNNTraining(image, label, layers, alpha = 0.05) {
  let { output, loss, accuracy } = CNNForward(image, label, layers);
  let gradient = zeros(10);
  gradient[label] = -1 / output[label];
  let gradientBack = CNNBackprop(gradient, layers, alpha);
  return { loss, accuracy };
}
