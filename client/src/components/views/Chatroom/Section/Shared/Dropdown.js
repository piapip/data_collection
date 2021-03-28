import React, { useState } from 'react'

import { Grid, Select, InputLabel, MenuItem, TextField, RadioGroup, Radio, FormControl, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import intentInfo from './intent';
import "./Dropdown.css";

const intentData = intentInfo.INTENT;
const genericIntentData = intentInfo.GENERIC_INTENT;

const useStyles = makeStyles((theme) => ({
  mainFormControl: {
    // marginLeft: theme.spacing(1),
    // marginRight: theme.spacing(1),
    minWidth: 200,
    // width: "100%",
    marginBottom: "10px",
  },
  formControl: {
    // margin: theme.spacing(1),
    // marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    minWidth: 200,
    width: "31%",
  },
  selectEmpty: {
    // width: "100%",
    // marginTop: theme.spacing(2),
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
    <Grid container>
      <FormControl className={classes.mainFormControl} fullWidth={true}>
        {/* <InputLabel>Ý định nghiệp vụ</InputLabel> */}
        <Select
          defaultValue=""
          onChange={handleIntentChange}
          // className={classes.selectEmpty}
          disabled={disabled || !tagVisible}>
          {
            intentData.map((intent, index) => (
              <MenuItem value={intent.name} key={`intent_${index}`}><p>{intent.name}</p></MenuItem>
            ))
          }
        </Select>
      </FormControl>
    </Grid>
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
            // className={classes.selectEmpty}
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
            // className={classes.selectEmpty}
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
            // className={classes.selectEmpty}
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
          autoComplete='off'
          // className={classes.selectEmpty}
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
    <FormControl className={classes.mainFormControl} fullWidth={true}>
      {/* <InputLabel>Ý định khác</InputLabel> */}
      <Select
        defaultValue=""
        onChange={handleGenericIntentChange}
        // className={classes.selectEmpty}
        disabled={disabled || tagVisible}>
        {
          genericIntentData.map((intent, index) => (
            <MenuItem value={intent} key={`generic_intent_${index}`}><p>{intent}</p></MenuItem>
          ))
        }
      </Select>
    </FormControl>
  )

  const emptyOption = (
    [1, 2, 3].map((value) => {
      return (
        // <Grid item xs={3}>
          <FormControl className={classes.formControl} key={`empty_${value}`}>
            <InputLabel>Phải chọn ý định trước!</InputLabel>
            <Select
              defaultValue=""
              // className={classes.selectEmpty}
              disabled={true}>
            </Select>
          </FormControl>
        // </Grid>
      )
    })
  )

  return (
    <FormControl fullWidth={true}>
      <RadioGroup onChange={onRadioGroupChange} value={radioValue} disabled={disabled}>
        <FormControlLabel value="1" control={<Radio style={{ paddingBottom: "75px" }} disabled={disabled}/>} 
        label={(
          <Grid container alignItems="center">
            <Grid item style={{marginBottom: "13px"}} xs={3}>
              <div>Ý định nghiệp vụ</div>
            </Grid>

            <Grid item xs={9}>
              {renderMainIntent}
            </Grid>
            
            <Grid item xs={3}></Grid>

            <Grid item sm={9}>
              {
                intentData[selectedIntent] ? intentData[selectedIntent].slot.map(slot => {
                  const slotValuePool = intentInfo[slot.toUpperCase()];
                  return renderSlots(slot, slotValuePool);
                }) : (
                  emptyOption
                )
              }
            </Grid>
          </Grid>
        )} />

        <FormControlLabel value="2" control={<Radio disabled={disabled}/>} style={{ marginTop: "10px"}}
        label={(
          <Grid container alignItems="center">
            <Grid item xs={3}>
              <div>Ý định khác</div>
            </Grid>

            <Grid item xs={9}>
              {renderGenericIntent}
            </Grid>
          </Grid>
        )} />
      </RadioGroup>
    </FormControl>
  )
}
