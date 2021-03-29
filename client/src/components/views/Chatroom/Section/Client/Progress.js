import React, { useState, useEffect } from 'react';

import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';

import LoadingComponent from './../../../Loading/LoadingComponent';

import intentInfo from './../Shared/intent';
import "./Progress.css";

export default function Progress(props) {

  const scenario = props ? props.scenario : [];
  const currentIntent = props ? props.currentIntent : [];
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    if (scenario.length !== 0) {
      setLoading(false);
    } else setLoading(true);
  }, [scenario])

  const compareProperty = (scenarioProp, currentIntent) => {
    if (!scenarioProp) return false;
    if (!currentIntent || currentIntent.length === 0) return null;
    const scenarioPropIndex = currentIntent.findIndex(item => {
      return item[0] === scenarioProp[0];
    })

    if (scenarioPropIndex === -1) return null;
    else {
      if ((scenarioProp[1] === "-1" || scenarioProp[1] === -1) && currentIntent[scenarioPropIndex][1] !== null) return currentIntent[scenarioPropIndex][1];
      else {
        if (scenarioProp[1] === currentIntent[scenarioPropIndex][1]) return currentIntent[scenarioPropIndex][1];
        return null;
      }
    }
    
  }

  const getLabel = (slot) => {
    const slotIndex = intentInfo.SLOT_LABEL.findIndex(item => {
      return item.tag.toUpperCase() === slot.toUpperCase();
    })

    return slotIndex === -1 ? "" : intentInfo.SLOT_LABEL[slotIndex].name
  }

  const showCity = (cityIndex) => {
    return intentInfo.CITY[cityIndex];
  }

  const showDistrict = (districtIndex) => {
    const cityIndex = currentIntent.findIndex(item => {
      return item[0] === "city";
    });
    const cityName = showCity(currentIntent[cityIndex][1]);
    return intentInfo.DISTRICT[cityName][districtIndex];
  }

  const renderProgress = (
    (scenario && scenario.length !== 0) ? (
      scenario.map((property, index) => {
        const slotValue = compareProperty(property, currentIntent);
        return slotValue !== null ? (
          <Grid item sm={12} md={12} key={property[0]}>
            <Checkbox color="primary" checked={true} style={{ padding: "0px 9px" }}/>
            <b>{index === 0 ? "Ý định" : getLabel(property[0])}</b>: {
              (property[0] === "name" || property[0] === "cmnd" || property[0] === "four_last_digits") ? slotValue : 
              (property[0] === "city") ? showCity(slotValue) :
              (property[0] === "district") ? showDistrict(slotValue) :
              intentInfo[property[0].toUpperCase()][slotValue].name
            }
          </Grid>
        ) : (
          <Grid item sm={12} md={12} key={property[0]}>
            <Checkbox color="primary" checked={false}/>
            <b>{index === 0 ? "Ý định" : getLabel(property[0])}</b>: {
              (property[1] === "-1" || property[1] === -1) ? "<Tùy chọn>" : intentInfo[property[0].toUpperCase()][property[1]].name
            }
          </Grid>
        )
      })
    ) : <LoadingComponent />
  )

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <>
      <Grid container>
        {renderProgress}
      </Grid>
    </>
  )
}
