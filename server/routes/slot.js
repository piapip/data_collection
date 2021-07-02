const express = require("express");
const router = express.Router();
const { Slot } = require("../models/Slot");

// GET ALL SLOT
router.get("/", (req, res) => {
  Slot.find({})
    .then((batchSlotFound) => {
      res.status(200).send({ success: true, batchSlotFound });
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});

// GET SLOT BY ID
router.get("/:slotID", (req, res) => {
  const { slotID } = req.params;
  Slot.findById(slotID)
    .populate({
      path: "lowerThan",
    })
    .populate({
      path: "subSlots",
    })
    .then((slotFound) => {
      if (!slotFound)
        res.status(400).send({ success: false, message: "No intent found!" });
      else res.status(200).send({ success: true, slotFound });
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});

// CREATE SLOT
router.post("/", (req, res) => {
  const { name, values, lowerThan, subSlots } = req.body;
  Slot.create({
    name,
    values,
    lowerThan,
    subSlots,
  })
    .then((slotCreated) => {
      res.status(200).send({ success: true, slotCreated });
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});

const intentSamplePool = require("./../config/intent");
router.post("/import-old-slot", (req, res) => {
  let count = 0;
  Slot.deleteMany({}).then(() => {
    const slotList = intentSamplePool.SLOT_LABEL;
    // IMPORT NORMAL STUFF
    slotList.forEach((slot) => {
      console.log(slot);
      if (
        slot.name.toLowerCase() !== "ý định" &&
        slot.name.toLowerCase() !== "tỉnh thành" &&
        slot.name.toLowerCase() !== "quận"
      ) {
        count++;
        const slotName = slot.name;
        const slotValues = [];
        if (slot.tag in intentSamplePool) {
          intentSamplePool[slot.tag].forEach((slotValue) => {
            slotValues.push(slotValue.name);
          });
        }
        Slot.create({
          name: slotName,
          values: slotValues,
        }).catch((error) => {
          console.log("error: ", error);
          res.status(500).send({ success: false, error });
          return;
        });
      }
    });

    // IMPORT CITY
    Slot.create({
      name: "Tỉnh thành",
      values: intentSamplePool.CITY,
    }).then(async (cityCreated) => {
      // IMPORT DISTRICT
      let subSlots = [];
      await cityCreated.values.forEach((city) => {
        Slot.create({
          name: city,
          values: intentSamplePool.DISTRICT[city],
        }).then((createdDistrict) => {
          subSlots.push(createdDistrict._id);
          if (subSlots.length === cityCreated.values.length) {
            Slot.create({
              name: "Quận",
              values: [],
              lowerThan: cityCreated._id,
              subSlots,
            });
          }
        });
      });
    });
    res.status(200).send({ success: true });
  });
});

module.exports = router;
