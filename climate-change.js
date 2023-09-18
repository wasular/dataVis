function ClimateChange() {
  // Name for the visualisation to appear in the menu bar.
  this.name = "Climate Change";

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = "climate-change";

  // Names for each axis.
  this.xAxisLabel = "year";
  this.yAxisLabel = "℃";

  var marginSize = 35;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    marginSize: marginSize,

    // Margin positions around the plot. Left and bottom have double
    // margin size to make space for axis and tick labels on the canvas.
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: 35,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: false,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 8,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      "./data/surface-temperature/surface-temperature.csv",
      "csv",
      "header",
      // Callback function to set the value
      // this.loaded to true.
      function (table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {
    // Font defaults.
    textSize(16);
    textAlign("center", "center");

    // Set min and max years: assumes data is sorted by year.
    this.minYear = this.data.getNum(0, "year");
    this.maxYear = this.data.getNum(this.data.getRowCount() - 1, "year");

    // Find min and max temperature for mapping to canvas height.
    this.minTemperature = min(this.data.getColumn("temperature"));
    this.maxTemperature = max(this.data.getColumn("temperature"));

    // Find mean temperature to plot average marker.
    this.meanTemperature = mean(this.data.getColumn("temperature"));

    // Count the number of frames drawn since the visualisation
    // started so that we can animate the plot.
    this.frameCount = 0;

    // Create sliders to control start and end years. Default to
    // visualise full range.
    this.startSlider = createSlider(
      this.minYear,
      this.maxYear - 1,
      this.minYear,
      1
    );
    this.startSlider.position(400, 10);

    this.endSlider = createSlider(
      this.minYear + 1,
      this.maxYear,
      this.maxYear,
      1
    );
    this.endSlider.position(600, 10);
  };

  this.destroy = function () {
    this.startSlider.remove();
    this.endSlider.remove();
  };

  this.draw = function () {
    if (!this.loaded) {
      console.log("Data not yet loaded");
      return;
    }

    // Prevent slider ranges overlapping.
    if (this.startSlider.value() >= this.endSlider.value()) {
      this.startSlider.value(this.endSlider.value() - 1);
    }
    this.startYear = this.startSlider.value();
    this.endYear = this.endSlider.value();

    // Draw all y-axis tick labels.
    drawYAxisTickLabels(
      this.minTemperature,
      this.maxTemperature,
      this.layout,
      this.mapTemperatureToHeight.bind(this),
      1
    );

    // Draw x and y axis.
    drawAxis(this.layout);

    // Draw x and y axis labels.
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

    // Plot average line.
    stroke(200);
    strokeWeight(1);
    line(
      this.layout.leftMargin,
      this.mapTemperatureToHeight(this.meanTemperature),
      this.layout.rightMargin,
      this.mapTemperatureToHeight(this.meanTemperature)
    );

    var numYears = this.endYear - this.startYear;
    var segmentWidth = this.layout.plotWidth() / numYears;

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var current = {
        year: this.data.getNum(i, "year"),
        temperature: this.data.getNum(i, "temperature"),
      };

      if (current.year > this.startYear && current.year <= this.endYear) {
        var barHeight = Math.abs(
          this.mapTemperatureToHeight(current.temperature) -
            this.mapTemperatureToHeight(0)
        );
        var startY = this.mapTemperatureToHeight(0);

        if (current.temperature > 0) {
          fill(213, 98, 98); // Red for above 0
          startY -= barHeight; // start drawing the bar from above the 0 mark
        } else {
          fill(80, 106, 178); // Blue for below 0
        }

        rect(
          this.mapYearToWidth(current.year) - segmentWidth / 2, // centering the bar on the year
          startY,
          segmentWidth - 1,
          barHeight
        );

        // The number of x-axis labels to skip so that only numXTickLabels are drawn.
        var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

        // Draw the tick label marking the current year.
        if ((current.year - this.startYear) % xLabelSkip == 0) {
          drawXAxisTickLabel(
            current.year,
            this.layout,
            this.mapYearToWidth.bind(this)
          );
        }

        // When six or fewer years are displayed also draw the final year x tick label.
        if (numYears <= 6 && i == this.data.getRowCount() - 1) {
          drawXAxisTickLabel(
            current.year,
            this.layout,
            this.mapYearToWidth.bind(this)
          );
        }
      }
    }

    this.frameCount++;
  };

  this.mapYearToWidth = function (value) {
    return map(
      value,
      this.startYear,
      this.endYear,
      this.layout.leftMargin, // Draw left-to-right from margin.
      this.layout.rightMargin
    );
  };

  this.mapTemperatureToHeight = function (value) {
    return map(
      value,
      this.minTemperature,
      this.maxTemperature,
      this.layout.bottomMargin, // Lower temperature at bottom.
      this.layout.topMargin
    ); // Higher temperature at top.
  };
}
