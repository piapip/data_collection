const express = require('express');
const router = express.Router();
const intentSamplePool = require("./../config/intent");
const namePool = require("./../config/name");

// const { Intent } = require("../models/Intent");

// create a random intent.
router.get("/random", (req, res) => {
  // // 0 - bank related intent, 1 - generic intent
  // const intentType = randomIntentType();
  // if (intentType === 0) {
  //   const intent = createRandomBankIntent();
  //   res.status(200).send({ intent });
  // } else {
  //   const genericIntent = createRandomGenericIntent();
  //   res.status(200).send({ genericIntent });
  // }

  const baseIntent = createRandomBankIntent();
  const prevIntent = getRandomProperty(baseIntent, null);
  const nextIntent = getRandomProperty(baseIntent, prevIntent);
  res.status(200).send({ prevIntent, nextIntent });
})

// const createRandomGenericIntent = () => {
//   return getRandomFromArray(intentSamplePool.GENERIC_INTENT);
// }

const getRandomProperty = (baseIntent, prevIntent) => {

  const key = [];
  for (let k in baseIntent) {
    key.push(k);
  }

  const usedKey = [];
  for (let k in prevIntent) {
    usedKey.push(k);
    if (k !== "intent") {
      removeFromArrayByValue(key, k);
    }
  }

  let tempIntent = {
    intent: baseIntent.intent,
  }
  if (prevIntent === null && key.length === 2) {
    return tempIntent;
  }
  const randomProperty = key[1 + Math.floor(Math.random() * (key.length-1))];
  tempIntent[randomProperty] = baseIntent[randomProperty];

  return tempIntent;
}

const createRandomBankIntent = () => {
  // gen base intent
  const intentIndex = getRandomFromArray(intentSamplePool.INTENT);
  const slots = intentSamplePool.INTENT[intentIndex].slot;

  let tempIntent = {
    intent: intentIndex,
  }

  // gen slot required for intent.
  slots.map(slot => {
    const slotPool = intentSamplePool[slot.toUpperCase()];
    if (slot === "city") {
      const slotIndex = getRandomFromArray(slotPool);
      return tempIntent[slot] = slotPool[slotIndex];
    }
    else if (slot === "district") {
      const districtPool = slotPool[tempIntent["city"]];
      const slotIndex = getRandomFromArray(districtPool);
      return tempIntent[slot] = districtPool[slotIndex];
    }
    else if (intentSamplePool[slot.toUpperCase()] === undefined) {
      if (slot === 'name') {
        return tempIntent[slot] = namePool.NAME[getRandomFromArray(namePool.NAME)];
      } else if (slot === 'cmnd') {
        return tempIntent[slot] = generateNumberWithLength(9);
      } else if (slot === 'four_last_digits') {
        return tempIntent[slot] = generateNumberWithLength(4);
      }
      return tempIntent[slot] = -1;
    } else {
      const slotIndex = getRandomFromArray(slotPool);
      return tempIntent[slot] = slotIndex;
    }
  })
  return tempIntent;
}

// random between bank related intent and generic intent (rate 9 to 1)
// const randomIntentType = () => {
//   var num=Math.random();
//   if(num < 0.9) return 0; // bank related intent
//   return 1; // generic intent
// }


const getRandomFromArray = (arr) => {
  return Math.floor(Math.random() * arr.length);
}

const generateNumberWithLength = (length) => {
  let text = '';
  const possible = '0123456789';

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const removeFromArrayByValue = (array, value) => {
  let index = array.indexOf(value);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

module.exports = router;