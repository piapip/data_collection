import React, { useState } from 'react'

import { Select, InputLabel, MenuItem, TextField, RadioGroup, Radio, FormControl, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import intentInfo from './intent';
import "./Dropdown.css";

const intentData = intentInfo.INTENT;
const genericIntentData = intentInfo.GENERIC_INTENT;

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function Dropdown(props) {

  const classes = useStyles();
  const tagVisible = props ? props.visible : true;
  const disabled = props ? props.disabled : false;

  const [ radioValue, setRadioValue ] = useState("1");

  const [ selectedIntent, setSelectedIntent ] = useState(null);

  const [ selectedDistrict, setSelectedDistrict ] = useState(null);
  const [ districtList, setDisctrictList ] = useState([]);
  const [ validator, setValidator ] = useState({
    name: " ",
    cmnd: " ",
    four_last_digits: " ",
  });

  const handleIntentChange = (event) => {
    const value = event.target.value;
    const intentIndex = intentData.findIndex(item => {
      return item.name === value
    });
    setSelectedIntent(intentIndex);
    props.setIntent(intentIndex);
  }

  const handleGenericIntentChange = (event) => {
    const value = event.target.value;
    const genericIntentIndex = genericIntentData.findIndex(item => {
      return item === value
    });
    props.setGenericIntent(genericIntentIndex);
  }

  const onSlotSelectChange = (event, child) => {
    const key = child.key;
    // const keyParsing = key.split(/(?<=^\S+)\s/)
    const keyParsing = key.split(" ");
    const slot = keyParsing[0].substring(2);
    const tag = keyParsing[1];
    const tagIndex = intentInfo[slot.toUpperCase()].findIndex(item => {
      return item.tag === tag;
    });
    
    props.setSlot(slot, tagIndex);
  }

  const onSlotTypeChange = (e) => {
    const slot = e.target.name;
    const slotValue = e.target.value;

    if (slotValue === "") {
      let newValidator = validator;
      newValidator[slot] = " ";
      setValidator(newValidator);
    } else {
      if (slot === "cmnd") {
        const re = '^[0-9]+$';
        if (!(new RegExp(re).test(slotValue))) {
          let newValidator = validator;
          newValidator[slot] = "CMND chỉ nhận số!";
          setValidator(newValidator);
        } else {
          let newValidator = validator;
          newValidator[slot] = " ";
          setValidator(newValidator);
        }
      }
  
      if (slot === "four_last_digits") {
        const re = '^[0-9]+$';
        if (slotValue.length !== 4 || !(new RegExp(re).test(slotValue))) {
          let newValidator = validator;
          newValidator[slot] = "Phải nhập 4 số!";
          setValidator(newValidator);
        } else {
          let newValidator = validator;
          newValidator[slot] = " ";
          setValidator(newValidator);
        }
      }
    }

    
    props.setSlot(slot, slotValue);
  }

  const handleCityChange = (event) => {
    const value = event.target.value;
    setDisctrictList(intentInfo.DISTRICT[value]);
    setSelectedDistrict(null);
    const cityIndex = intentInfo.CITY.findIndex(item => {
      return item === value;
    })

    props.setSlot("city", cityIndex);
  }

  const handleDistrictChange = (event) => {
    const value = event.target.value;
    setSelectedDistrict(value);
    const districtIndex = districtList.findIndex(item => {
      return item === value;
    })

    props.setSlot("district", districtIndex);
  }
  
  const onRadioGroupChange = (e) => {
    if(e.target.value === "1") props.toggleTagVisibility(true);
    else props.toggleTagVisibility(false);
    setRadioValue(e.target.value);
  }

  const getLabel = (slot) => {
    const slotIndex = intentInfo.SLOT_LABEL.findIndex(item => {
      return item.tag.toUpperCase() === slot.toUpperCase();
    })

    return slotIndex === -1 ? "" : intentInfo.SLOT_LABEL[slotIndex].name
  }

  const renderMainIntent = (
    <FormControl className={classes.formControl}>
      <InputLabel>Ý định</InputLabel>
      <Select sm={12} md={4}
        defaultValue=""
        onChange={handleIntentChange}
        disabled={disabled || !tagVisible}>
        {
          intentData.map((intent, index) => (
            <MenuItem value={intent.name} key={`intent_${index}`}><p>{intent.name}</p></MenuItem>
          ))
        }
      </Select>
    </FormControl>
  )

  const renderSlots = (slot, slotValuePool) => {
    if (slot === null) return emptyOption;

    if (slot === "city") {
      return (
        <FormControl className={classes.formControl} key={`${selectedIntent} ${slot}`}>
          <InputLabel>{getLabel(slot)}</InputLabel>
          <Select
            defaultValue=""
            onChange={handleCityChange}
            disabled={disabled || !tagVisible}>
            {
              intentInfo.CITY.map(city => (
                <MenuItem value={city} key={city}><p>{city}</p></MenuItem>
              ))
            }

          </Select>
        </FormControl>
      )
    }

    if (slot === "district") {
      return (
        <FormControl className={classes.formControl} key={`${selectedIntent} ${slot}`}>
          <InputLabel>{getLabel(slot)}</InputLabel>
          <Select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={disabled || !tagVisible}>
            {
              districtList.map(district => (
                <MenuItem value={district} key={district}><p>{district}</p></MenuItem>
              ))
            }
          </Select>
        </FormControl>
      )
    }

    if (slotValuePool !== undefined) {
      return (
        <FormControl className={classes.formControl} key={`${selectedIntent} ${slot}`}>
          <InputLabel>{getLabel(slot)}</InputLabel>
          <Select
            defaultValue=""
            onChange={onSlotSelectChange}
            disabled={disabled || !tagVisible}>
            {
              slotValuePool.map(item => (
                <MenuItem value={item.name} key={`${slot} ${item.tag}`}><p>{item.name}</p></MenuItem>
              ))
            }
          </Select>
        </FormControl>
      )
    }

    return (
      <FormControl className={classes.formControl} key={`${selectedIntent} ${slot}`}>
        <TextField
          error={validator[slot] !== " "}
          helperText={validator[slot] !== " " ? validator[slot] : ""}
          variant="outlined"
          name={slot}
          label={getLabel(slot)}
          onChange={onSlotTypeChange}
          disabled={disabled || !tagVisible}/>
      </FormControl>
    )
    
  };

  const renderGenericIntent = (
    <>
      <InputLabel>Ý định khác</InputLabel>
      <Select
        defaultValue=""
        onChange={handleGenericIntentChange}
        disabled={disabled || tagVisible}>
        {
          genericIntentData.map((intent, index) => (
            <MenuItem value={intent} key={`generic_intent_${index}`}><p>{intent}</p></MenuItem>
          ))
        }
      </Select>
    </>
  )

  const emptyOption = (
    [1, 2, 3].map((value) => {
      return (
        ""
        // <Col xl={8} xs={24} style={outerColStyle} key={`empty_${value}`}>
        //   <Row>
        //     <Col span={24} style={innerCol1Style}>
        //       <b>???</b>
        //     </Col>
        //     <Col span={24} style={innerCol2Style}>
        //       <Select
        //         // placeholder="Phải chọn ý định trước!"
        //         style={{ width: "100%" }}
        //         disabled={true}>
        //       </Select>
        //     </Col>
        //   </Row>
        // </Col>
      )
    })
  )

  return (
    <FormControl>
      <RadioGroup onChange={onRadioGroupChange} value={radioValue} disabled={disabled}>
        
        <FormControlLabel value="1" control={<Radio />} label={(
          <>
            {renderMainIntent}
            {
              intentData[selectedIntent] ? intentData[selectedIntent].slot.map(slot => {
                const slotValuePool = intentInfo[slot.toUpperCase()];
                return renderSlots(slot, slotValuePool);
              }) : (
                emptyOption
              )
            }
          </>
        )} />

        <FormControlLabel value="2" control={<Radio />} label={(
          <>
            <FormControl className={classes.formControl}>
              {renderGenericIntent}
            </FormControl>
          </>
        )} />
      </RadioGroup>
    </FormControl>
  )
}
