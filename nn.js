// The NeuralNetwork class represents a simple, fully-connected, feed-forward neural network.
class NeuralNetwork {
  // The constructor initializes the neural network with a specific number of input nodes, hidden nodes, and output nodes, as well as a learning rate.
  // It can optionally load an existing model from a file.
  constructor(
    inputNodes,
    hiddenNodes,
    outputNodes,
    learningRate,
    modelFile = null
  ) {
    // Number of input, hidden, and output nodes
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;
    // Learning rate for the training process
    this.learningRate = learningRate;

    // The array that will store the highlighting of the hidden output layer nodes (for visualization purposes)
    this.hiddenOutputHighlights = new Array(100).fill(0);

    // The array that will store the indices of the most influential input nodes
    this.mostInfluentialInputs = [];

    // If a model file is provided, load the weights from the file
    if (modelFile) {
      this.weightsInput = modelFile.weightsInput;
      this.weightsOutput = modelFile.weightsOutput;
    } else {
      // If no model file is provided, initialize the weights with normally distributed random values
      // The standard deviation of the random values is chosen such that the variance is inversely proportional to the number of nodes in the next layer
      this.weightsInput = createNormalDistributedMatrix(
        this.hiddenNodes,
        this.inputNodes,
        Math.pow(this.hiddenNodes, -0.5)
      );
      this.weightsOutput = createNormalDistributedMatrix(
        this.outputNodes,
        this.hiddenNodes,
        Math.pow(this.outputNodes, -0.5)
      );
    }
  }

  // The query method performs a forward pass through the network, returning the network's output for a given input
  query(inputsList) {
    // Convert the input list into a matrix (2D array)
    let inputs = transpose([inputsList]);

    // Calculate the inputs and outputs of the hidden layer
    let hiddenInputs = dot(this.weightsInput, inputs);
    let hiddenOutputs = sigmoid(hiddenInputs);

    // Reset the hidden output highlights
    this.hiddenOutputHighlights.fill(0);

    // Find the indices of the 25 most activated hidden nodes
    let indices = topKIndices(hiddenOutputs, 25);

    // Highlight the most activated hidden nodes
    indices.forEach((index) => (this.hiddenOutputHighlights[index] = 1));

    // Get the weights of the most activated hidden nodes
    let activeHiddenWeights = indices.map((index) => this.weightsInput[index]);

    // Calculate the sum of the absolute values of the weights of the most activated hidden nodes for each input
    // This gives a measure of the influence of each input on the most activated hidden nodes
    let inputInfluence = activeHiddenWeights[0].map((_, i) =>
      activeHiddenWeights.reduce(
        (sum, weights) => sum + Math.abs(weights[i]),
        0
      )
    );

    // Find the indices of the 50 most influential inputs
    this.mostInfluentialInputs = topKIndices(inputInfluence, 50);

    // Calculate the inputs and outputs of the output layer
    let finalInputs = dot(this.weightsOutput, hiddenOutputs);
    let finalOutputs = sigmoid(finalInputs);

    // Return the outputs of the network
    return finalOutputs;
  }

  // The train method updates the weights of the network using backpropagation, given a pair of input and target output
  train(inputsList, targetsList) {
    // Convert the input and target lists into matrices (2D arrays)
    let inputs = transpose([inputsList]);
    let targets = transpose([targetsList]);

    // Forward pass
    // Calculate the inputs and outputs of the hidden layer
    let hiddenInputs = dot(this.weightsInput, inputs);
    let hiddenOutputs = sigmoid(hiddenInputs);

    // Calculate the inputs and outputs of the output layer
    let finalInputs = dot(this.weightsOutput, hiddenOutputs);
    let finalOutputs = sigmoid(finalInputs);

    // Backward pass
    // Calculate the error of the output layer
    let outputErrors = subtract(targets, finalOutputs);

    // Calculate the error of the hidden layer
    let hiddenErrors = dot(transpose(this.weightsOutput), outputErrors);

    // Calculate the gradient of the output layer weights
    let errorRate = subtract(1, finalOutputs);
    let errorRate2 = multiply(outputErrors, finalOutputs);
    let errorRate3 = multiply(errorRate, errorRate2);
    let errorDot = dot(errorRate3, transpose(hiddenOutputs));
    let weightUpdate = multiply(this.learningRate, errorDot);

    // Update the output layer weights
    this.weightsOutput = add(this.weightsOutput, weightUpdate);

    // Calculate the gradient of the hidden layer weights
    errorRate = subtract(1, hiddenOutputs);
    errorRate2 = multiply(hiddenErrors, hiddenOutputs);
    errorRate3 = multiply(errorRate, errorRate2);
    errorDot = dot(errorRate3, transpose(inputs));
    weightUpdate = multiply(this.learningRate, errorDot);

    // Update the hidden layer weights
    this.weightsInput = add(this.weightsInput, weightUpdate);
  }
}
