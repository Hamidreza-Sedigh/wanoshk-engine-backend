// controllers/engineController.js
const EngineStatus = require('../models/EngineStatus');

exports.getStatus = async (req, res) => {
  console.log("->Engine getStatus started...");
  const engine = await EngineStatus.findOne();
  res.json({ status: engine?.status || false });
};

exports.updateStatus = async (req, res) => {
  console.log("->Engine updateStatus started...");
  const { status } = req.body;
  let engine = await EngineStatus.findOne();
  if (!engine) engine = new EngineStatus({ status });
  else {
    engine.status = status;
    engine.updatedAt = Date.now();
  }
  await engine.save();
  res.json({ success: true, status: engine.status });
};
