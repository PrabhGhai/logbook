const mongoose = require("mongoose");

const sampleSchema = new mongoose.Schema(
  {
    date: {
      type: String,
    },
    grnNo: {
      type: String,
    },
    rmCode: {
      type: String,
    },
    nameOfRM: {
      type: String,
    },
    receiptLotNo: {
      type: String,
    },
    receiptBatchNo: {
      type: String,
    },
    grnReceivedBy: {
      type: String,
    },
    sampleID: {
      type: String,
    },
    samplingDate: {
      type: String,
    },
    sampledBy: {
      type: String,
    },
    sampledQuantity: {
      type: String,
    },
    retentionQuantity: {
      type: String,
    },
    analysisSampleQuantity: {
      type: Number,
    },
    analysisSampleDiscardedBy: {
      type: String,
    },
    retentionSampleQuantity: {
      type: Number,
    },
    retentionSampleDiscardedBy: {
      type: String,
    },
    approvedBy: {
      type: String,
    },
    approvedByDate: {
      type: String,
    },
    rejectedBy: {
      type: String,
    },
    rejectedByDate: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("sample", sampleSchema);
