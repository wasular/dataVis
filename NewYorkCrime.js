// Initial zoom level for the map
let zoom = 12;

// Center coordinates for the map (latitude and longitude)
let centerX = -73.971321;
let centerY = 40.776676;

// Stores the map tiles
let tiles = {};

// Variables to store mouse coordinates for panning
let previousMouseX = 0;
let previousMouseY = 0;

// Boolean variable indicating whether the map is currently panning
let isPanning = false;

// An object to store the counts for each grid cell
let grid = {};

// Select element for choosing a crime type
let crimeSelect;

// Dictionary with latitude/longitude as keys and count of crimes as values
latlongDict = {};

// Maximum count of crimes in a single location
let maxCountCrimes;

// Maximum count value for color scaling
let maxCount;

// Function to calculate color scale based on data count
function colorScale(count) {
  // Minimum and Maxium Data Count Values
  const minCount = 0;
  const maxCount = 607;
  // Transform to RGB
  const minColor = [0, 0, 255]; // blue
  const maxColor = [255, 0, 0]; // red
  // Calculate the ratio of count in relation to min and max count
  const ratio = (count - minCount) / (maxCount - minCount);
  // Calculate the color by linear interpolation
  const color = [
    minColor[0] + (maxColor[0] - minColor[0]) * ratio,
    minColor[1] + (maxColor[1] - minColor[1]) * ratio,
    minColor[2] + (maxColor[2] - minColor[2]) * ratio,
  ];
  return color;
}

// Function to build a dictionary with lat/long as keys and count of crimes as values
function buildLatLongDict(selectedCrime) {
  latlongDict = {};
  maxCountCrimes = 0;

  for (let row of mapData) {
    let lat = Number(row["latitude"]);
    let lon = Number(row["longitude"]);
    let crimeVariant = row["ofns_desc"];
    // If no specific crime is selected, or the current crime is the selected crime
    if (!selectedCrime || crimeVariant === selectedCrime) {
      // Create a key from the lat/long pair
      let key = lat + "," + lon;
      // If this key is already in the dictionary, increment its value
      // Otherwise, add it to the dictionary with a value of 1
      if (latlongDict[key]) {
        // If this key is already in the dictionary, increment its value
        latlongDict[key]++;
      } else {
        // If this key is not in the dictionary, add it with a value of 1
        latlongDict[key] = 1;
      }
      // If the current count is the highest so far, update maxCountCrimes
      if (latlongDict[key] > maxCountCrimes) {
        console.log(latlongDict[key]);
        maxCountCrimes = latlongDict[key];
      }
    }
  }
}
// Function to rebuild lat/long dictionary based on selected crime
function rebuildLatLongDictForCrime() {
  let selectedCrime = crimeSelect.value();
  if (selectedCrime === "All") {
    buildLatLongDict();
  } else {
    buildLatLongDict(selectedCrime);
  }
}
// Class definition for New York Crime visualization
class NewYorkCrime {
  constructor() {
    // Name for the visualisation to appear in the menu bar.
    this.name = "New York Crime Stats";
    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = "ny-crime";
  }
  // This is a setup function that is called to initialize the crime visualization.
  setup() {
    // Creating a new set to store unique crime variants.
    let crimeVariants = new Set();
    // Looping over all the rows of the mapData object.
    for (let row of mapData) {
      // Converting latitude and longitude to number.
      let lat = Number(row["latitude"]);
      let lon = Number(row["longitude"]);

      // Get the crime variant for the current row.
      let crimeVariant = row["ofns_desc"];
      // Add the crime variant to the set. This ensures that each crime variant is stored only once in the set.
      crimeVariants.add(crimeVariant);
      // Create a key from the latitude/longitude pair.
      let key = lat + "," + lon;
      // If this key already exists in the dictionary, increment its count. If it doesn't exist, create it and set its count to 1.
      if (latlongDict[key]) {
        latlongDict[key]++;
      } else {
        latlongDict[key] = 1;
      }
    }
    // Select the HTML element with id "crimeSelect". This is a dropdown menu that lets the user select a crime type.
    crimeSelect = select("#crimeSelect");
    // Whenever the selected option in the dropdown changes, call the function rebuildLatLongDictForCrime().
    crimeSelect.changed(rebuildLatLongDictForCrime);
    // Add an "All" option to the dropdown menu, which corresponds to showing all data.
    crimeSelect.option("All");
    // For each unique crime variant, add an option to the dropdown menu. This will allow the user to select a specific crime type.
    for (let crimeVariant of crimeVariants) {
      if (crimeVariant == "(null)") {
        crimeVariant = "Others";
      }
      crimeSelect.option(crimeVariant);
    }
  }
  // This method is called continuously to update the visual representation of data.
  draw() {
    canvas3D.background(255);
    canvas3D.translate(width / 2, height / 2);
    // Further translate the canvas based on the map's current center coordinates.
    canvas3D.translate(
      -this.long2tile(centerX, zoom) * 256,
      -this.lat2tile(centerY, zoom) * 256
    );
    // Set the camera perspective for the canvas.
    canvas3D.camera(
      0,
      -600,
      height / 2 / tan((PI * 30.0) / 180.0),
      0,
      0,
      0,
      0,
      1,
      0
    );
    // Calculate the range of visible tiles based on the map's current center coordinates and zoom level.
    const minTileX = this.long2tile(
      centerX - (this.degreesPerPixel() * width) / 2,
      zoom
    );
    const maxTileX = this.long2tile(
      centerX + (this.degreesPerPixel() * width) / 2,
      zoom
    );
    const maxTileY = floor(
      this.lat2tile(centerY - (this.degreesPerPixel() * height) / 2, zoom)
    );
    const minTileY = ceil(
      this.lat2tile(centerY + (this.degreesPerPixel() * height) / 2, zoom)
    );

    for (let x = floor(minTileX); x <= ceil(maxTileX); x++) {
      for (let y = floor(minTileY); y <= ceil(maxTileY); y++) {
        // Generate the key for this tile.
        const tileKey = `${zoom}/${x}/${y}`;
        // If this tile is not yet loaded, load its image from the local server.
        if (!tiles[tileKey]) {
          tiles[tileKey] = loadImage(`./new-york-y/Mapnik/${tileKey}.jpg`);
        }

        canvas3D.push();
        // Further translate the canvas based on the map's current center coordinates.
        canvas3D.translate(
          (x - this.long2tile(centerX, zoom)) * 256,
          0,
          (y - this.lat2tile(centerY, zoom)) * 256
        );
        canvas3D.rotateX(PI / 2); // Rotate plane to horizontal
        canvas3D.noStroke();
        canvas3D.texture(tiles[tileKey]);
        canvas3D.plane(256, 256);
        canvas3D.pop();
      }
    }
    // If the user is currently panning, adjust the map's center coordinates based on the mouse movement.
    if (isPanning) {
      const deltaX = mouseX - previousMouseX;
      const deltaY = mouseY - previousMouseY;

      centerX -= deltaX * this.degreesPerPixel();
      centerY += deltaY * this.degreesPerPixel();
    }
    // Update the previous mouse coordinates for the next frame.
    previousMouseX = mouseX;
    previousMouseY = mouseY;

    for (let key in latlongDict) {
      let [lat, lon] = key.split(",").map(Number); // Convert the key back to latitude and longitude
      let count = latlongDict[key];

      canvas3D.push();
      // Calculate tile position
      let tileX = this.long2tile(Number(lon), zoom);
      let tileZ = this.lat2tile(Number(lat), zoom);

      if (
        tileX < minTileX ||
        tileX > maxTileX ||
        tileZ < minTileY ||
        tileZ > maxTileY
      ) {
        continue;
      }
      // Calculate position within tile
      let x = (tileX - floor(tileX)) * 256;
      let z = (tileZ - floor(tileZ)) * 256;
      // Calculate relative position
      let relX = (floor(tileX) - this.long2tile(centerX, zoom)) * 256 + x - 128;
      let relZ = (floor(tileZ) - this.lat2tile(centerY, zoom)) * 256 + z - 128;
      canvas3D.push();
      canvas3D.translate(relX, -ceil(Math.sqrt(count) * 20) / 2 + 2, relZ);
      let color = colorScale(count);
      //Draw Boxes for the Data
      canvas3D.fill(color[0], color[1], color[2], 50 + count / 5);
      canvas3D.noStroke();
      canvas3D.box(
        10 + count / 20,
        ceil(Math.sqrt(count) * 20),
        10 + count / 20
      );
      canvas3D.pop();
      canvas3D.push();
      canvas3D.translate(
        relX,
        -ceil(Math.sqrt(count) * 20) / 2 - 10,
        relZ + count / 20
      );
      canvas3D.pop();
    }
  }
  // This function converts longitude to tile coordinates
  long2tile(lon, zoom) {
    const result = ((lon + 180) / 360) * pow(2, zoom);
    return result;
  }
  // This function converts latitude to tile coordinates
  lat2tile(lat, zoom) {
    const result =
      ((1 - log(tan((lat * PI) / 180) + 1 / cos((lat * PI) / 180)) / PI) / 2) *
      pow(2, zoom);
    return result;
  }
  // This function converts tile coordinates to longitude
  tile2long(x, z) {
    return (x / Math.pow(2, z)) * 360 - 180;
  }

  // This function converts tile coordinates to latitude
  tile2lat(y, z) {
    var n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }

  degreesPerPixel() {
    const result = 360 / pow(2, zoom + 8);
    return result;
  }
}
// When mouse button is pressed, enable panning
function mousePressed() {
  isPanning = true;
}

function mouseReleased() {
  isPanning = false;
}
// Zoom in and out with arrow keys
function keyPressed() {
  if (keyCode === UP_ARROW) {
    zoom++;
  } else if (keyCode === DOWN_ARROW) {
    zoom--;
  }
  // Restrict zoom level between a min and max
  zoom = constrain(zoom, 12, 16);
}

// Define the functions that will run when the + and - buttons are clicked
function zoomIn() {
  zoom++;
  zoom = constrain(zoom, 12, 16); // Restrict zoom level between a min and max
}

function zoomOut() {
  zoom--;
  zoom = constrain(zoom, 12, 16); // Restrict zoom level between a min and max
}

document.addEventListener("DOMContentLoaded", function () {
  // Get the buttons from the HTML document
  let zoomInButton = document.getElementById("zoomIn");
  let zoomOutButton = document.getElementById("zoomOut");
  // Add the event listeners for the click events
  zoomInButton.addEventListener("click", zoomIn);
  zoomOutButton.addEventListener("click", zoomOut);
});
