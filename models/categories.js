const mongoose = require("mongoose");

const sampleCat = new mongoose.Schema({
  titleSample: {
    type: String,
  },
  formsData: [{ type: mongoose.Types.ObjectId, ref: "sample" }],
});

module.exports = mongoose.model("sampleCat", sampleCat);
