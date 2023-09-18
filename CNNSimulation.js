// Define the spacing between each layer in the visualisation.
let layerSpacingCNN = 120;

// Placeholder variable for the number of rows in the CNN.
let rowsCNN;
let inputLayerModel;

// Create empty arrays to hold all the layer information.
let layers = [];
let cubesToDrawCNN = [];
let linesToDrawCNN = [];

// Placeholder variable for the label of the CNN.
let labelCNN = 0;

// Create arrays to store the images used in the convolution and max pooling layers.
let p5ImagesConv = [];
let p5ImagesMax = [];

// Define the size of the output images in pixels.
let outputImageSize = 26;

// Placeholder variable for the screen that displays text information.
let textScreen;

let textsCNN = [];

function drawImage(image, x, y, z, size) {
  canvas3DCNN.push();
  canvas3DCNN.translate(x, y, z);
  canvas3DCNN.noStroke();
  canvas3DCNN.tint(255, 255, 255, 150); // Set transparency using RGBA value, where A is between 0 (transparent) and 255 (opaque).
  canvas3DCNN.texture(image);
  canvas3DCNN.plane(size, size);
  canvas3DCNN.pop();
  // Reset the image transparency.
  canvas3DCNN.noTint();
}

// This function loads a trained model into the CNN for visualisation.
// Each layer of the trained model is processed, with its type checked and
// a new layer of the appropriate type being created with the parameters
// from the trained model.
function loadNNModel(trainedModel) {
  for (const layerData of trainedModel) {
    if (layerData.type === "ConvolutionLayer") {
      layers.push(
        new ConvolutionLayer(
          layerData.kernelNum,
          layerData.kernelSize,
          layerData.kernels
        )
      );
    } else if (layerData.type === "SoftMaxLayer") {
      layers.push(
        new SoftMaxLayer(null, null, layerData.weight, layerData.bias)
      );
    } else if (layerData.type === "MaxPoolingLayer") {
      layers.push(new MaxPoolingLayer(layerData.kernelSize));
    }
  }
}
// This function updates the visualisation of the output from the max pooling layer.
// adjusts the size of the image and updates the pixel values to match the max pooling output.
function updateMaxPoolOutput() {
  let maxPoolLayer = layers.find((layer) => layer instanceof MaxPoolingLayer);
  if (maxPoolLayer && maxPoolLayer.maxPoolingOutput) {
    maxPoolOutput = maxPoolLayer.maxPoolingOutput;
    let maxPoolOutputHeight = maxPoolOutput.length;
    let maxPoolOutputWidth = maxPoolOutput[0].length;

    for (let k = 0; k < maxPoolOutput[0][0].length; k++) {
      p5ImagesMax[k].resize(maxPoolOutputWidth, maxPoolOutputHeight); // Resize the image to match the max-pooling output
      p5ImagesMax[k].loadPixels();
      for (let i = 0; i < maxPoolOutputHeight; i++) {
        for (let j = 0; j < maxPoolOutputWidth; j++) {
          let colorValue =
            map(Number(maxPoolOutput[i][j][k]), 255, 0, 1, 0) * 255 ** 8;

          let pixelIndex = (i + j * maxPoolOutputWidth) * 4;
          p5ImagesMax[k].pixels[pixelIndex] = colorValue; // red
          p5ImagesMax[k].pixels[pixelIndex + 1] = colorValue; // green
          p5ImagesMax[k].pixels[pixelIndex + 2] = colorValue; // blue
          p5ImagesMax[k].pixels[pixelIndex + 3] = 255; // alpha
        }
      }
      p5ImagesMax[k].updatePixels();
    }
  }
}
// This function updates the visualisation of the output from the convolution layer.
// updates the pixel values to match the convolution output.
function updateConvOutput() {
  let convLayer = layers.find((layer) => layer instanceof ConvolutionLayer);
  if (convLayer && convLayer.convolutionOutput) {
    convOutput = convLayer.convolutionOutput;

    for (let k = 0; k < convOutput[0][0].length; k++) {
      p5ImagesConv[k].loadPixels();
      for (let i = 0; i < outputImageSize; i++) {
        for (let j = 0; j < outputImageSize; j++) {
          let colorValue = map(Number(convOutput[i][j][k]), 1, 0, 0, 255);
          if (colorValue < 255) {
            colorValue -= 250;
          }

          let pixelIndex = (i + j * outputImageSize) * 4;
          p5ImagesConv[k].pixels[pixelIndex] = colorValue; // red
          p5ImagesConv[k].pixels[pixelIndex + 1] = colorValue; // green
          p5ImagesConv[k].pixels[pixelIndex + 2] = colorValue; // blue
          p5ImagesConv[k].pixels[pixelIndex + 3] = 255; // alpha
        }
      }
      p5ImagesConv[k].updatePixels();
    }
  }
}

class CNNSimulation {
  constructor() {
    // Name for the visualisation to appear in the menu bar.
    this.name = "CNN Simulation";
    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = "cnn-sim";
    this.hiddenLayer = [];
    this.outputLayer = [];
    this.inputLayer = [];
    this.hiddenSize = 52;
    this.cubeSpacing = 20;
    this.lastProcessedTime = 0;
    this.currentRow = 0;
    this.hiddenLayer = [];
    this.outputSize = 10;
    this.inputSize = 28;
    this.inputValuesRotated;
    this.label = 0;
  }
  // Function to dynamically create cubes with different colors
  drawDynamicCube(x, y, z, cubeColor, size, layer, index) {
    // Create Cubes for Output Layer
    if (layer == "output") {
      // Add a plane in front of the cube with text texture
      canvas3DCNN.push();
      canvas3DCNN.translate(x, y, layerSpacingCNN * 7 + size / 2 + 1); // Move slightly in front of cube's front face
      // canvas3DCNN.texture(textsCNN[index]);
      canvas3DCNN.noStroke();
      canvas3DCNN.plane(size, size); // Draw the plane with same size as cube face
      canvas3DCNN.pop();
    }
    // Create cubes for hidden and Input Layer

    canvas3DCNN.push();
    canvas3DCNN.translate(x, y, z);
    canvas3DCNN.fill(cubeColor); // Set color according to cubeColor
    canvas3DCNN.box(size);
    canvas3DCNN.pop();
  }
  // Function to dynamically create Lines with different colors
  drawDynamicLine(startX, startY, startZ, endX, endY, endZ, lineColor) {
    canvas3DCNN.stroke(lineColor);
    canvas3DCNN.strokeWeight(0.5);
    canvas3DCNN.line(startX, startY, startZ, endX, endY, endZ);
  }
  // Main setup function
  setup() {
    // Load the trained Convolutional Neural Network model
    loadNNModel(trainedModelCNN);
    rowsCNN = testSet.getRows();
    // Loop to create and setup Graphics objects for digits 0-9
    for (let i = 0; i < 10; i++) {
      let textGraphics = createGraphics(cubeSize * 4, cubeSize * 4);
      textGraphics.background(30); // Set background to white
      textGraphics.fill(90); // Set fill color to black
      let textToDisplay = i; // The text you want to display
      let textSizeToUse = 36;
      textGraphics.textSize(textSizeToUse);
      let textWidth = textGraphics.textWidth(textToDisplay);
      // Set text alignment and baseline to center
      textGraphics.textAlign(CENTER, CENTER);
      // Calculate text position (centered)
      let textX = (cubeSize * 4) / 2;
      let textY = (cubeSize * 4) / 2;
      // Add the Text to the createGraphics Object
      textGraphics.text(textToDisplay, textX, textY);
      textsCNN.push(textGraphics);
    }
    // Initialize the position data for the Input Layer Cubes
    for (let i = 0; i < this.inputSize; i++) {
      for (let j = 0; j < this.inputSize; j++) {
        // Pushes a vector representing the position of the cube in the layer to the inputLayer array
        this.inputLayer.push(
          createVector(
            i * this.cubeSpacing - (this.inputSize * this.cubeSpacing) / 2,
            j * this.cubeSpacing - (this.inputSize * this.cubeSpacing) / 2,
            -layerSpacingCNN
          )
        );
      }
    }
    // Initialize the position data for the Hidden Layer Cubes
    for (let i = 0; i < this.hiddenSize; i++) {
      for (let j = 0; j < this.hiddenSize; j++) {
        // Pushes a vector representing the position of the cube in the layer to the hiddenLayer array
        this.hiddenLayer.push(
          createVector(
            i * this.cubeSpacing -
              (this.hiddenSize * this.cubeSpacing) / 2 +
              random(-100, 100),
            j * this.cubeSpacing -
              (this.hiddenSize * this.cubeSpacing) / 2 +
              random(-100, 100),
            layerSpacingCNN * 4 + random(-200, 300)
          )
        );
      }
    }
    // Initialize the position data for the Output Layer Cubes
    for (let i = 0; i < this.outputSize; i++) {
      // Pushes a vector representing the position of the cube in the layer to the outputLayer array
      this.outputLayer.push(
        createVector(
          i * this.cubeSpacing * 4 -
            (this.outputSize * this.cubeSpacing * 4) / 2,
          0,
          layerSpacingCNN * 7
        )
      );
    }
    // Create images for the convolution and pooling layers, which will later be filled with pixel data
    for (let i = 0; i < 16; i++) {
      p5ImagesConv[i] = createImage(26, 26);
    }
    for (let i = 0; i < 16; i++) {
      p5ImagesMax[i] = createImage(13, 13);
    }
    // Build the geometry for the lines between the pooling and hidden layers
    // Rendering this as regular lines would be too resource-intensive
    this.hiddenLines = buildGeometry("hiddenLines", (builder) => {
      builder.fill(0, 255, 0); // Set the line color to green
      let gridSize = 4; // Grid size for the lines
      let cubeSpacing = 10 / 2; // Half the spacing of the original cubes
      let gapSize = 2; // Gap size between each grid
      let filterSpacing = (13 + gapSize) * cubeSpacing; // Spacing for the filters
      // Create lines between each grid point and hidden layer cube
      for (let k = 0; k < 16; k++) {
        let gridX = k % gridSize; // Grid x-coordinate
        let gridY = Math.floor(k / gridSize); // Grid y-coordinate
        let offsetX = (gridX - gridSize / 2 + 0.5) * filterSpacing; // Offset for x-coordinate
        let offsetY = (gridY - gridSize / 2 + 0.5) * filterSpacing; // Offset for y-coordinate
        // For each cube in the hidden layer, create a line between it and the current grid point
        this.hiddenLayer.forEach((hiddenCube) => {
          builder.beginShape(CLOSE);
          builder.vertex(offsetX, offsetY, layerSpacingCNN * 2);
          builder.vertex(hiddenCube.x, hiddenCube.y, hiddenCube.z);
          builder.vertex(offsetX, offsetY, layerSpacingCNN * 2);
          builder.endShape();
        });
      }
    });
  }

  draw() {
    canvas3DCNN.background(30);
    canvas3DCNN.camera(0, 0, -1700, 0, 0, 0, 0, 1, 0); // set camera position
    // Rotate the scene around the Y-axis
    canvas3DCNN.rotateY(frameCount / 80);
    canvas3DCNN.strokeWeight(0.25);
    canvas3DCNN.stroke(100, 100, 100, 40);
    canvas3DCNN.model(this.hiddenLines);
    if (rowsCNN && millis() - this.lastProcessedTime >= 700) {
      this.lastProcessedTime = millis();
      inputValues = rowsCNN[this.currentRow].arr;
      this.inputValuesRotated = rotateArray(rowsCNN[this.currentRow].arr);
      cubesToDrawCNN = [];
      linesToDrawCNN = [];
      labelCNN = inputValues[0];

      let flat_image = inputValues.slice(1).map((val) => val / 255);
      // convert the flat image array to a 2D array
      let inputImage = [];
      for (let i = 0; i < 28; i++) {
        let image_row = flat_image.slice(i * 28, (i + 1) * 28);
        inputImage.push(image_row);
      }
      // perform forward propagation in the Convolutional Neural Network (CNN)
      let { loss, accuracy } = CNNForward(inputImage, labelCNN, layers);

      for (let i = 1; i < this.inputValuesRotated.length; i++) {
        // calculate the color based on the corresponding allValues entry
        let colorValue = map(Number(this.inputValuesRotated[i]), 0, 255, 0, 1); // map the value to range [0,1]
        let cubeColor = color(colorValue * 255); // map it back to [0,255] and set as grayscale color

        cubesToDrawCNN.push({
          position: this.inputLayer[i - 1],
          color: cubeColor,
          size: cubeSize,
          layer: "input",
        });
      }
      // Update Max and Conv Layer with new Pixel Data
      updateConvOutput();
      updateMaxPoolOutput();

      let hidden = layers.find((layer) => layer instanceof SoftMaxLayer);

      if (hidden && hidden.flattendInput) {
        for (let i = 0; i < hidden.flattendInput[0].length; i++) {
          // let cubeColor = neuralNetwork.hiddenOutputHighlights[i] === 1 ? 255 : 20;
          // let isHighlighted = neuralNetwork.hiddenOutputHighlights[i] === 1;
          let colorValue = map(
            Number(hidden.flattendInput[0][i]),
            0,
            255,
            0,
            1
          ); // map the value to range [0,1]
          let cubeColor = color(colorValue * 255 * 255 * 255 * 255);
          // Add to the cubes for the hidden layer to be drawn
          cubesToDrawCNN.push({
            position: this.hiddenLayer[i],
            color: cubeColor,
            size: 5,
          });
          // Draw the dynamic Lines from Hidden to Output layer based on their influence
          if (hidden.hiddenOutputHighlights.includes(i)) {
            linesToDrawCNN.push({
              start: this.hiddenLayer[i],
              end: this.outputLayer[labelCNN],
              lineColor: 255,
            });
          }
        }
        // Add to the cubes for the output layer to be drawn
        for (let i = 0; i < this.outputLayer.length; i++) {
          let cubeColor = labelCNN == i ? 255 : 20;
          cubesToDrawCNN.push({
            position: this.outputLayer[i],
            color: cubeColor,
            size: 40,
            layer: "output",
            index: i,
          });
        }
      }
      // move to the next row, and wrap around when the end of the dataset is reached
      this.currentRow = (this.currentRow + 1) % rowsCNN.length;
    }

    // draw each cube and line in their respective lists
    for (let cube of cubesToDrawCNN) {
      this.drawDynamicCube(
        cube.position.x,
        cube.position.y,
        cube.position.z,
        cube.color,
        cube.size,
        cube.layer,
        cube.index
      );
    }

    for (let line of linesToDrawCNN) {
      this.drawDynamicLine(
        line.start.x,
        line.start.y,
        line.start.z,
        line.end.x,
        line.end.y,
        line.end.z,
        line.lineColor
      );
    }
    // Update Conv Layer
    let convLayer = layers.find((layer) => layer instanceof ConvolutionLayer);
    if (convLayer && convLayer.convolutionOutput) {
      let convOutput = convLayer.convolutionOutput;

      let gridSize = 4;
      let outputImageSize = 26; // The size of each filter's output image
      let cubeSpacing = 10 / 2; // Half the spacing of the original cubes
      let gapSize = 2; // Gap size between each grid
      let filterSpacing = (outputImageSize + gapSize) * cubeSpacing; // The spacing between each filter's output image

      for (let k = 0; k < convOutput[0][0].length; k++) {
        // assuming that k is the index of the kernel
        let gridX = k % gridSize; // calculate grid position
        let gridY = Math.floor(k / gridSize);

        let offsetX = (gridX - gridSize / 2 + 0.5) * filterSpacing; // calculate offset for each grid
        let offsetY = (gridY - gridSize / 2 + 0.5) * filterSpacing;

        drawImage(p5ImagesConv[k], offsetX, offsetY, layerSpacingCNN, 100);
      }
    }
    // Update Max Pool Layer
    let maxPoolLayer = layers.find((layer) => layer instanceof MaxPoolingLayer);
    if (maxPoolLayer && maxPoolLayer.maxPoolingOutput) {
      let maxPoolOutput = maxPoolLayer.maxPoolingOutput;

      let gridSize = 4;
      let cubeSpacing = 10 / 2; // Half the spacing of the original cubes
      let gapSize = 2; // Gap size between each grid
      let filterSpacing = (13 + gapSize) * cubeSpacing;

      for (let k = 0; k < maxPoolOutput[0][0].length; k++) {
        let gridX = k % gridSize;
        let gridY = Math.floor(k / gridSize);
        let offsetX = (gridX - gridSize / 2 + 0.5) * filterSpacing;
        let offsetY = (gridY - gridSize / 2 + 0.5) * filterSpacing;
        drawImage(p5ImagesMax[k], offsetX, offsetY, layerSpacingCNN * 2, 50); // Adjust z-index (layerSpacing) to properly place the images in 3D space.
      }
    }
  }
}
