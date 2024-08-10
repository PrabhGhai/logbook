const router = require("express").Router();
const sampleCat = require("../models/categories");
const authMiddleware = require("../middlewares/JWTVerification");
const Sample = require("../models/sample");
//post sample
router.post("/add-category", async (req, res) => {
  const { titleSample } = req.body;
  const newCat = new sampleCat({ titleSample });
  await newCat.save();
  return res.status(201).json({ message: "Sample category added" });
});

// Fetch all samples, sorted by timestamps in descending order
router.get("/get-samples/:product", authMiddleware, async (req, res) => {
  const { product } = req.params;

  try {
    const sampleCatData = await sampleCat.findOne({ titleSample: product });

    if (!sampleCat) {
      return res.status(404).json({ message: "Sample category not found" });
    }

    // Extract formsData IDs
    const formsDataIds = sampleCatData.formsData;

    // Fetch and populate samples based on the formsData IDs
    const samples = await Sample.find({ _id: { $in: formsDataIds } })
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(samples);
  } catch (error) {
    console.error("Error fetching samples:", error);
    res.status(500).json({ message: "Error fetching samples", error });
  }
});

// POST route to save form data
router.post("/save-form-data", authMiddleware, async (req, res) => {
  const {
    date,
    GRN,
    RM,
    NameOfRM,
    ReceiptLotNo,
    ReceiptBatchNo,
    SampleID,
    SampledQuantity,
    RetentionQuantity,
    AnalysisSampleQuantity,
    AnalysisSampleDiscardedBy,
    RetentionSampleQuantity,
    RetentionSampleDiscardedBy,
    ApprovedBy,
    ApprovedByDate,
    RejectedBy,
    RejectedByDate,
    employeeName,
  } = req.body;

  // Check if user is an ANALYST
  if (req.user.role !== "analyst") {
    return res
      .status(403)
      .json({ message: "Access forbidden: only ANALYST can submit this form" });
  }

  // Validate required fields
  if (
    (!GRN || !RM || !NameOfRM || !SampleID || !RetentionQuantity) &&
    req.user.role === "analyst"
  ) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields." });
  }

  try {
    // Save form data
    const newFormData = new Sample({
      date: date,
      grnNo: GRN,
      rmCode: RM,
      nameOfRM: NameOfRM,
      receiptLotNo: ReceiptLotNo,
      receiptBatchNo: ReceiptBatchNo,
      grnReceivedBy: employeeName,
      sampleID: SampleID,
      samplingDate: date,
      sampledBy: employeeName,
      sampledQuantity: SampledQuantity,
      retentionQuantity: RetentionQuantity,
    });
    await newFormData.save();
    const { titleSample } = req.body;
    await sampleCat.findOneAndUpdate(
      { titleSample },
      { $push: { formsData: newFormData._id } }
    );

    return res.status(201).json({ message: "Form data saved successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error saving form data." });
  }
});

module.exports = router;
