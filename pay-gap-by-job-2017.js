function PayGapByJob2017() {
  // Name for the visualisation to appear in the menu bar.
  this.name = "Pay gap by job: 2017";

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = "pay-gap-by-job-2017";

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Graph properties.
  this.pad = 20;
  this.dotSizeMin = 15;
  this.dotSizeMax = 40;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      "./data/pay-gap/occupation-hourly-pay-by-gender-2017.csv",
      "csv",
      "header",
      // Callback function to set the value
      // this.loaded to true.
      function (table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {};

  this.destroy = function () {};

  this.draw = function () {
    if (!this.loaded) {
      console.log("Data not yet loaded");
      return;
    }

    // Draw the axes.
    this.addAxes();

    // Get data from the table object.
    var jobs = this.data.getColumn("job_subtype");
    var propFemale = this.data.getColumn("proportion_female");
    var payGap = this.data.getColumn("pay_gap");
    var numJobs = this.data.getColumn("num_jobs");

    // Convert numerical data from strings to numbers.
    propFemale = stringsToNumbers(propFemale);
    payGap = stringsToNumbers(payGap);
    numJobs = stringsToNumbers(numJobs);

    // Set ranges for axes.
    var propFemaleMin = 0;
    var propFemaleMax = 100;

    var payGapMin = -20;
    var payGapMax = 20;

    var numJobsMin = min(numJobs);
    var numJobsMax = max(numJobs);

    fill(0);
    text("Proportion Female (%)", width - 200, height / 2 + 20);
    text("Pay Gap (%)", width / 2 + 10, 20);
    stroke(0);
    strokeWeight(1);

    for (i = 0; i < this.data.getRowCount(); i++) {
      // Set the color of the dot based on the proportion of females.
      var propFem = this.data.getRow(i).getNum(9);
      var job = this.data.getRow(i).get(3);
      var col = map(propFem, propFemaleMin, propFemaleMax, 0, 255);

      var x = map(
        this.data.getRow(i).getNum(9),
        propFemaleMin,
        propFemaleMax,
        0 + this.pad,
        width - this.pad
      );
      var y = map(
        this.data.getRow(i).getNum(10),
        payGapMin,
        payGapMax,
        height - this.pad,
        0 + this.pad
      );
      var size = map(
        this.data.getRow(i).getNum(8),
        numJobsMin,
        numJobsMax,
        this.dotSizeMin,
        this.dotSizeMax
      );

      fill(255 - col, 0, col);
      noStroke();
      ellipse(x, y, size);

      // Check if the mouse is over this bubble.
      if (dist(mouseX, mouseY, x, y) < size / 2) {
        // Draw the job name centered at the position of the bubble.
        fill(0);
        noStroke();
        textAlign(LEFT, CENTER);
        text(job, width / 2 + 10, 50);
      }
    }

    fill(30);
    stroke(30);
    textSize(32);
    text("Men", width / 4, height - 50);
    text("Woman", 1200 - width / 4, height - 50);
    textSize(16);
  };

  this.addAxes = function () {
    stroke(200);

    // Add vertical line.
    line(width / 2, 0 + this.pad, width / 2, height - this.pad);

    // Add horizontal line.
    line(0 + this.pad, height / 2, width - this.pad, height / 2);
  };
}
