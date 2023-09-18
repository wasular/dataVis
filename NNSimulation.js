let outputCubes, hiddenCubes;
let outputLayer = [];
let hiddenLayer = [];
let inputLayer = [];
let cubesToDraw = [];
let hiddenLayerReduced = [];
let outputSize = 10;
let gridSize = 28;
let hiddenSize = 10;
let cubeSize = 10;
let cubeSpacing = 20;
let layerSpacing = 300;
let neuralNetwork;
let rowsNN;
let currentRow = 0;
let lastProcessedTime = 0;
let inputValues;
let inputValuesRotated;
let label;
let inputHiddenLines = [];
let texts = [];
let lines2, lines3, lines4, lines5;

class NNSimulation {
  constructor() {
    // Name for the visualisation to appear in the menu bar.
    this.name = "Neural Network Simulation";
    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = "nn-sim";
  }
  // Draw dynamic cubes for different layers
  drawDynamicCube(x, y, z, cubeColor, size, layer, index) {
    if (layer == "output") {
      // Add a plane in front of the cube with text texture
      canvas3DNN.push();
      canvas3DNN.translate(x, y, layerSpacing + size / 2 + 1); // Move slightly in front of cube's front face
      canvas3DNN.texture(texts[index]);
      canvas3DNN.noStroke();
      canvas3DNN.plane(size, size); // Draw the plane with same size as cube face
      canvas3DNN.pop();
    }
    canvas3DNN.push();
    canvas3DNN.translate(x, y, z);
    canvas3DNN.fill(cubeColor);
    canvas3DNN.box(size);
    canvas3DNN.pop();
  }

  setup() {
    // Initialize Neural Network with pretrained model
    neuralNetwork = new NeuralNetwork(784, 100, 10, 0.3, trainedModel);
    // Get the rows from the csv Minist Data Set
    rowsNN = testSet.getRows();

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
      texts.push(textGraphics);
    }

    // Initialize Input Layer Cubes Position Data
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        inputLayer.push(
          createVector(
            i * cubeSpacing - (gridSize * cubeSpacing) / 2,
            j * cubeSpacing - (gridSize * cubeSpacing) / 2,
            -layerSpacing
          )
        );
      }
    }
    // Initialize Hidden Layer Cubes Position Data
    for (let i = 0; i < hiddenSize; i++) {
      for (let j = 0; j < hiddenSize; j++) {
        hiddenLayer.push(
          createVector(
            i * cubeSpacing -
              (hiddenSize * cubeSpacing) / 2 +
              random(-200, 200),
            j * cubeSpacing -
              (hiddenSize * cubeSpacing) / 2 +
              random(-200, 200),
            0 + random(-200, 200)
          )
        );
      }
    }
    // Initialize Output Layer Cubes Position Data
    for (let i = 0; i < outputSize; i++) {
      outputLayer.push(
        createVector(
          i * cubeSpacing * 4 - (outputSize * cubeSpacing * 4) / 2,
          0,
          layerSpacing
        )
      );
    }
    // Splitting Input Layer to Hidden Layer Lines in to different Models since 78400 Lines exceeds the Vertices Limit of WebGL
    const inputLayerParts = [
      inputLayer.slice(0, inputLayer.length / 4),
      inputLayer.slice(inputLayer.length / 4, inputLayer.length / 2),
      inputLayer.slice(inputLayer.length / 2, (3 * inputLayer.length) / 4),
      inputLayer.slice((3 * inputLayer.length) / 4),
    ];

    lines2 = buildGeometry("myLines2", (builder) => {
      builder.fill(0, 255, 0);
      inputLayerParts[0].forEach((inputCube, index) => {
        hiddenLayer.forEach((hiddenCube) => {
          builder.beginShape(CLOSE);
          builder.vertex(inputCube.x, inputCube.y, inputCube.z);
          builder.vertex(hiddenCube.x, hiddenCube.y, hiddenCube.z);
          builder.vertex(inputCube.x, inputCube.y, inputCube.z);
          builder.endShape();
        });
      });
    });

    lines3 = buildGeometry("myLines3", (builder) => {
      builder.fill(0, 255, 0);
      inputLayerParts[1].forEach((inputCube, index) => {
        hiddenLayer.forEach((hiddenCube) => {
          builder.beginShape(CLOSE);
          builder.vertex(inputCube.x, inputCube.y, inputCube.z);
          builder.vertex(hiddenCube.x, hiddenCube.y, hiddenCube.z);
          builder.vertex(inputCube.x, inputCube.y, inputCube.z);
          builder.endShape();
        });
      });
    });

    lines4 = buildGeometry("myLines4", (builder) => {
      builder.fill(0, 255, 0);
      inputLayerParts[2].forEach((inputCube, index) => {
        hiddenLayer.forEach((hiddenCube) => {
          builder.beginShape(CLOSE);
          builder.vertex(inputCube.x, inputCube.y, inputCube.z);
          builder.vertex(hiddenCube.x, hiddenCube.y, hiddenCube.z);
          builder.vertex(inputCube.x, inputCube.y, inputCube.z);
          builder.endShape();
        });
      });
    });

    lines5 = buildGeometry("myLines5", (builder) => {
      builder.fill(0, 255, 0);
      inputLayerParts[3].forEach((inputCube, index) => {
        hiddenLayer.forEach((hiddenCube) => {
          builder.beginShape(CLOSE);
          builder.vertex(inputCube.x, inputCube.y, inputCube.z);
          builder.vertex(hiddenCube.x, hiddenCube.y, hiddenCube.z);
          builder.vertex(inputCube.x, inputCube.y, inputCube.z);
          builder.endShape();
        });
      });
    });
  }

  draw() {
    canvas3DNN.background(30);
    canvas3DNN.translate(0, 0, 0);
    canvas3DNN.rotateY(0.01);
    // Do a Network query every 700ms and update the visuals
    if (rowsNN && millis() - lastProcessedTime >= 700) {
      cubesToDraw = [];
      lastProcessedTime = millis();
      inputValues = rowsNN[currentRow].arr;
      inputValuesRotated = rotateArray(rowsNN[currentRow].arr);

      let inputs = inputValues
        .slice(1)
        .map((x) => (Number(x) / 255.0) * 0.99 + 0.01);

      let outputs = neuralNetwork.query(inputs);

      for (let i = 1; i < inputValuesRotated.length; i++) {
        // calculate the color based on the corresponding allValues entry
        let colorValue = map(Number(inputValuesRotated[i]), 0, 255, 0, 1); // map the value to range [0,1]
        let cubeColor = color(colorValue * 255); // map it back to [0,255] and set as grayscale color

        cubesToDraw.push({
          position: inputLayer[i - 1],
          color: cubeColor,
          size: cubeSize,
          layer: "input",
        });
      }

      let maxVal = Math.max(...outputs);
      label = outputs.findIndex(
        (val) => Math.abs(val - maxVal) < Number.EPSILON
      );

      for (let i = 0; i < outputs.length; i++) {
        let cubeColor = label === i ? 255 : 20;
        cubesToDraw.push({
          position: outputLayer[i],
          color: cubeColor,
          size: cubeSize * 4,
          layer: "output",
          index: i,
        });
      }
      hiddenLayerReduced = [];
      for (let i = 0; i < neuralNetwork.hiddenOutputHighlights.length; i++) {
        let cubeColor =
          neuralNetwork.hiddenOutputHighlights[i] === 1 ? 255 : 20;
        let isHighlighted = neuralNetwork.hiddenOutputHighlights[i] === 1;

        if (isHighlighted) {
          hiddenLayerReduced.push(hiddenLayer[i]);
        }
        cubesToDraw.push({
          position: hiddenLayer[i],
          color: cubeColor,
          size: cubeSize / 2,
          line: isHighlighted,
          lineTo: "output",
        });
      }
      if (!inputHiddenLines[label]) {
        inputHiddenLines[label] = buildGeometry(
          `inputHiddenLines${label}`,
          (builder) => {
            builder.fill(0, 255, 0);
            neuralNetwork.mostInfluentialInputs.forEach((inputIndex) => {
              let inputCube = inputLayer[inputIndex]; // Adjust this to select from the correct inputLayerPart array
              hiddenLayer.forEach((hiddenCube, index) => {
                if (neuralNetwork.hiddenOutputHighlights[index] === 1) {
                  builder.beginShape(CLOSE);
                  builder.vertex(inputCube.x, inputCube.y, inputCube.z);
                  builder.vertex(hiddenCube.x, hiddenCube.y, hiddenCube.z);
                  builder.vertex(inputCube.x, inputCube.y, inputCube.z);
                  builder.endShape();
                }
              });
            });
          }
        );
      }
      currentRow = (currentRow + 1) % rowsNN.length;
    }

    for (let cube of cubesToDraw) {
      this.drawDynamicCube(
        cube.position.x,
        cube.position.y,
        cube.position.z,
        cube.color,
        cube.size,
        cube.layer,
        cube.index
      );

      if (cube.line) {
        if (cube.lineTo === "output") {
          canvas3DNN.push();
          canvas3DNN.stroke(200, 200, 230, 50);
          canvas3DNN.strokeWeight(1);
          canvas3DNN.line(
            cube.position.x,
            cube.position.y,
            cube.position.z,
            outputLayer[label].x,
            outputLayer[label].y,
            outputLayer[label].z
          );
          canvas3DNN.pop();
        }
      }
    }
    canvas3DNN.strokeWeight(0.25);
    canvas3DNN.stroke(200, 200, 230, 10);
    canvas3DNN.model(inputHiddenLines[label]);
    canvas3DNN.strokeWeight(0.25);
    canvas3DNN.stroke(40, 40, 40, 40);
    canvas3DNN.model(lines2);
    canvas3DNN.model(lines3);
    canvas3DNN.model(lines4);
    canvas3DNN.model(lines5);
  }
}
