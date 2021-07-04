const express = require("express");
const router = express.Router();
const { Domain } = require("../models/Domain");

// GET ALL DOMAIN
router.get("/", (req, res) => {
  Domain.find({})
    .then((batchDomainFound) => {
      res.status(200).send({ success: true, batchDomainFound });
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});

router.get("/:domainID", (req, res) => {
  const { domainID } = req.params;
  Domain.findById(domainID)
    .populate("intents")
    .then((domainFound) => {
      if (!domainFound)
        res.status(400).send({ success: false, message: "No domain found!" });
      else res.status(200).send({ success: true, domainFound });
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});

router.get("/get-by-campaignID/:campaignID", (req, res) => {
  const { campaignID } = req.params;

  Domain.find({ campaignID })
    .then((domainFound) => {
      if (domainFound.length === 0)
        res.status(404).send({ success: false, message: "No domain found!" });
      else {
        res.status(200).send({ success: true, domainFound: domainFound[0] });
      }
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});

// CREATE DOMAIN
router.post("/", (req, res) => {
  const { name, intents, campaignName, campaignID } = req.body;
  Domain.create({
    name,
    intents,
    campaignName,
    campaignID,
  })
    .then((domainCreated) => {
      res.status(200).send({ success: true, domainCreated });
    })
    .catch((error) => {
      res.status(500).send({ success: false, error });
    });
});

// update domain's intents list
router.put("/:domainID", (req, res) => {
  const { intents } = req.body;
  const { domainID } = req.params;
  Domain.findById(domainID)
    .then((domainFound) => {
      if (!domainFound)
        res.status(400).send({ success: false, message: "No domain found!" });
      else {
        domainFound.intents = intents;
        domainFound
          .save()
          .then((newDomain) => {
            res.status(200).send({ success: true, newDomain });
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

const intentSamplePool = require("./../config/intent");
const { IntentRecord } = require("../models/IntentRecord");

router.post("/import-old-domain", (req, res) => {
  const name = "SLU-cũ";
  const intentList = intentSamplePool.INTENT;
  const campaignName = "HỘI THOẠI THEO KỊCH BẢN (SLU)";
  const campaignID = "608bf46497e8c09fb9a40a0e";
  const intents = [];
  intentSamplePool.GENERIC_INTENT.forEach((intent) => {
    intentList.push({
      name: intent,
    });
  });
  let count = 0;
  intentList.forEach((intent) => {
    IntentRecord.find({ name: intent.name }).then((intentFound) => {
      count++;
      intents.push(intentFound[0]._id);
      if (count === intentList.length) {
        Domain.create({
          name,
          intents,
          campaignName,
          campaignID,
        })
          .then((createdDomain) => {
            res.status(200).send({ success: true, createdDomain });
          })
          .catch((error) => {
            res.status(500).send({ success: true, error });
          });
      }
    });
  });
});

module.exports = router;
