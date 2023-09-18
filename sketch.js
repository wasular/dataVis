// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;
let predictor;
let canvas3D;
let canvas2D;
let mapRows;
let mapData = [];
let colorbar;
let imageZero;

function preload() {
  testSet = loadTable("./data/nn/mnist_test_10.csv", "csv");
  trainedModel = loadJSON("./data/nn/trained_model.json");
  loadJSON("./data/nn/model.json", (data) => {
    trainedModelCNN = Object.values(data); // Convert the object to an array
  });

  let mapTable = loadTable(
    "./data/map/output.csv",
    "csv",
    "header",
    (results) => {
      // Get the column headers of the CSV file
      let headers = results.columns;
      // Convert table rows to JavaScript objects
      mapRows = results.getRows();
      for (let row of mapRows) {
        let obj = {};
        // Loop through each header and get the data for the corresponding header in this row
        for (let header of headers) {
          obj[header] = row.get(header);
        }
        mapData.push(obj);
      }
    }
  );
}

function setup() {
  // Create a canvas to fill the content div from index.html.
  canvas3D = createGraphics(1200, 1000, WEBGL);
  canvas3DNN = createGraphics(1200, 1000, WEBGL);
  canvas3DCNN = createGraphics(1200, 1000, WEBGL);
  p5.disableFriendlyErrors = true;

  canvas2D = createCanvas(1200, 1000);
  frameRate(60);
  colorbar = select(".map-container");
  zoomBtn = select(".zoom-btns");

  canvas2D.parent("app");

  // Create a new gallery object.
  gallery = new Gallery();
  predictor = new NNSimulation();
  nyMap = new NewYorkCrime();
  cnnSim = new CNNSimulation();
  predictor.setup();
  nyMap.setup();
  cnnSim.setup();

  // //Add the visualisation objects here.
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new TechDiversityGender());
  gallery.addVisual(new PayGapByJob2017());
  gallery.addVisual(new PayGapTimeSeries());
  gallery.addVisual(new ClimateChange());
  gallery.addVisual(predictor);
  gallery.addVisual(cnnSim);
  gallery.addVisual(nyMap);
}

function draw() {
  background(255);
  if (gallery.selectedVisual != null) {
    // Check if the selected visual is 'NNSimulation'
    if (gallery.getSelectedVisualID() === "nn-sim") {
      // Draw on 3D canvas
      canvas3DNN.clear();
      predictor.draw();
      image(canvas3DNN, 0, 0);
      colorbar.style("display", "none");
      zoomBtn.style("display", "none");
    } else if (gallery.getSelectedVisualID() === "ny-crime") {
      nyMap.draw();
      image(canvas3D, 0, 0);
      colorbar.style("display", "flex");
      zoomBtn.style("display", "flex");
    } else if (gallery.getSelectedVisualID() === "cnn-sim") {
      cnnSim.draw();
      image(canvas3DCNN, 0, 0);
      colorbar.style("display", "none");
      zoomBtn.style("display", "none");
    } else {
      // Draw on 2D canvas
      gallery.selectedVisual.draw();
      colorbar.style("display", "none");
      zoomBtn.style("display", "none");
    }
  }
}
