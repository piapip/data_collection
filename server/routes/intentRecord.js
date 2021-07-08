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
        path: "subSlots lowerThan",
      },
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

const intentInfo = require("../config/intent-sample.js");
const { Domain } = require("../models/Domain");
router.post("/create-by-file", (req, res) => {
  const { domainID } = req.body;

  // we don't want to mess with the old records
  // so we need to mark which one is the new one.
  const newSlotList = [];
  const newIntentList = [];

  Domain.findById(domainID)
    .then(async (domainFound) => {
      if (!domainFound)
        res.status(404).send({
          success: false,
          error: "No domain found! Create one first!",
        });
      else {
        // create all the slots first
        const slotList = intentInfo.SLOT_LABEL;
        const slotDependency = intentInfo.SLOT_DEPENDENCY;

        // let's prioritize those with dependency
        slotDependency.sort((a, b) => a.tier - b.tier);
        // console.log(slotDependency);
        for (let i = 0; i < slotDependency.length; i++) {
          const dependency = slotDependency[i];

          // let's create the higher slot first
          const high_slotTag = dependency.high;
          const high_slotName = slotList.find((slot) => {
            return slot.tag === high_slotTag;
          }).name;
          const low_slotTag = dependency.low;
          const low_slotName = slotList.find((slot) => {
            return slot.tag === low_slotTag;
          }).name;

          // console.log("high_slotTag: ", high_slotTag);
          // console.log("high_slotName: ", high_slotName);
          // console.log("low_slotTag: ", low_slotTag);
          // console.log("low_slotName: ", low_slotName);
          // console.log("newSlotList: ", newSlotList);

          let high_slotID;
          // let's check if it's already created
          const slotIndex = newSlotList.findIndex((slot) => {
            return slot.name === high_slotName;
          });
          // if it's here then let's grab its id
          if (slotIndex !== -1) {
            high_slotID = newSlotList[slotIndex].id;
            // console.log(`HIGH: ${high_slotName} is already created!`);
          } else {
            // console.log(`HIGH: ${high_slotName} was not created!`);
            // create one
            high_slotID = (
              await Slot.create({
                name: high_slotName,
                values: intentInfo[high_slotTag],
              })
            )._id;

            // console.log("high_slotID: ", high_slotID);

            // remember to append it to the temporary record
            newSlotList.push({
              name: high_slotName,
              tag: high_slotTag,
              id: high_slotID,
            });
          }

          let subSlotList = [];
          // console.log(`intentInfo[${low_slotTag}]: `, intentInfo[low_slotTag]);
          // now let's create all the subSlots for lower tier slot
          for (const key of Object.keys(intentInfo[low_slotTag])) {
            // console.log(key, intentInfo[low_slotTag][key], low_slotTag);
            const slotID = (
              await Slot.create({
                name: key,
                values: intentInfo[low_slotTag][key],
              })
            )._id;
            subSlotList.push(slotID);
          }
          // then we can create the lower tier slot
          const low_slotID = (
            await Slot.create({
              name: low_slotName,
              lowerThan: high_slotID,
              subSlots: subSlotList,
            })
          )._id;
          // remember to append it to the temporary record
          newSlotList.push({
            name: low_slotName,
            tag: low_slotTag,
            id: low_slotID,
          });
        }

        // now with all the complicated dependency-related slot out of the way
        // let's create the rest of the slot
        for (let i = 0; i < slotList.length; i++) {
          const targetSlot = slotList[i];
          const { name, tag } = targetSlot;
          // check if it's already created
          const slotIndex = newSlotList.findIndex((slot) => {
            return slot.name === name;
          });

          // only create it if it doesn't exist yet
          if (slotIndex === -1) {
            const slotID = (
              await Slot.create({
                name: name,
                values: intentInfo[tag],
              })
            )._id;

            newSlotList.push({
              name,
              tag,
              id: slotID,
            });
          }
        }

        // then we'll create all the intent
        const intentList = intentInfo.INTENT;
        for (let i = 0; i < intentList.length; i++) {
          const { name, slot } = intentList[i];
          let slots = [];
          // let's grab all the slot's id
          for (let k = 0; k < slot.length; k++) {
            const slotTag = slot[k].toUpperCase();
            const slotIndex = newSlotList.findIndex((slot) => {
              return slot.tag === slotTag;
            });

            slots.push(newSlotList[slotIndex].id);
          }
          const intentID = (
            await IntentRecord.create({
              name,
              slots,
            })
          )._id;

          newIntentList.push(intentID);
        }

        // then we update the intent list to the domain and it's done.
        domainFound.intents = newIntentList;
        domainFound
          .save()
          .then((savedDomain) => {
            res
              .status(200)
              .send({ success: true, newSlotList, newIntentList, savedDomain });
          })
          .catch((error) => {
            res.status(500).send({ success: false, error });
          });
      }
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});
module.exports = router;
