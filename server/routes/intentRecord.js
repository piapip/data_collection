const express = require("express");
const router = express.Router();
const { IntentRecord } = require("../models/IntentRecord");

// GET ALL
router.get("/", (req, res) => {
  IntentRecord.find()
    .populate("slots")
    .then((batchIntentFound) => {
      res.status(200).send({ success: true, batchIntentFound });
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});

// GET BY ID
router.get("/:intentRecordID", (req, res) => {
  const { intentRecordID } = req.params;
  IntentRecord.findById(intentRecordID)
    .populate("slots")
    .populate({
      path: "slots",
      populate: {
        path: "subSlots"
      }
    })
    .then((intentFound) => {
      if (!intentFound)
        res.status(400).send({ success: false, message: "No intent found!" });
      else res.status(200).send({ success: true, intentFound });
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});

// CREATE INTENT RECORD
router.post("/", (req, res) => {
  const { name, slots } = req.body;
  IntentRecord.create({
    name,
    slots,
  })
    .then((intentCreated) => {
      res.status(200).send({ success: true, intentCreated });
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});

const intentSamplePool = require("./../config/intent");
const { Slot } = require("../models/Slot");
router.post("/import-old-intent", (req, res) => {
  const intentList = intentSamplePool.INTENT;

  let count = 0;
  IntentRecord.deleteMany({})
    .then(() => {
      intentList.forEach((intent) => {
        count++;
        // get slots
        const slotList = intent.slot;
        let values = [];
        let slotCount = 0;
        slotList.forEach((slot) => {
          const slotName = intentSamplePool.SLOT_LABEL.find(
            (x) => x.tag === slot.toUpperCase()
          ).name;
          Slot.find({ name: slotName }).then((slotFound) => {
            slotCount++;
            values.push(slotFound[0]._id);
            if (slotCount === slotList.length) {
              IntentRecord.create({
                name: intent.name,
                slots: values,
              });
            }
          });
        });

        // if (count === intentList.length) {
        //   res.status(200).send({ success: true, message: "oke" });
        // }
      });
      const genericIntentList = intentSamplePool.GENERIC_INTENT;
      genericIntentList.forEach((intent) => {
        IntentRecord.create({
          name: intent,
        }).then(() => {
          count++;
          if (count === intentList.length + genericIntentList.length) {
            res
              .status(200)
              .send({ success: true, message: `${count} intents recorded.` });
          }
        });
      });
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});
module.exports = router;
