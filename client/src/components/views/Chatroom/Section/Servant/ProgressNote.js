import React from 'react';

import Grid from '@material-ui/core/Grid';

import QuestionMark from './question-mark.png';
import intentInfo from '../Shared/intent';

export default function ProgressNote(props) {

  const currentIntent = props ? props.currentIntent : [];
  
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

  const renderProgressNote = (
    currentIntent.length !== 0 && currentIntent[0][0] !== "generic_intent" ? (
      <>
        <Grid container style={{lineHeight: "40px"}}>
          <Grid container>
            <Grid item sm={3}>
              <b>Ý định:</b>
            </Grid>

            <Grid item sm={9}>
              {intentInfo.INTENT[currentIntent[0][1]].name}
            </Grid>
          </Grid>

          {
            intentInfo.INTENT[currentIntent[0][1]].slot.map((property, index) => {
              const currentIntentIndex = currentIntent.findIndex(item => {
                return item[0] === property;
              })
              return (
                <Grid container key={`ProgressNote_${index}`}>
                  <Grid item sm={3}>
                    <b>{getLabel(property)}:</b>
                  </Grid>

                  <Grid item sm={9}>
                    {
                      currentIntentIndex !== -1 ? 
                      (property === "name" || property === "cmnd" || property === "four_last_digits") ? currentIntent[currentIntentIndex][1] : 
                      (property === "city") ? showCity(currentIntent[currentIntentIndex][1]) :
                      (property === "district") ? showDistrict(currentIntent[currentIntentIndex][1]) :
                      (property === "city" || property === "district") ? intentInfo[property.toUpperCase()][currentIntent[currentIntentIndex][1]] :
                        intentInfo[currentIntent[currentIntentIndex][0].toUpperCase()][currentIntent[currentIntentIndex][1]].name : (
                        <img src={QuestionMark} alt="question-mark" style={{height: "40px"}}/>
                      )
                    }
                  </Grid>
                </Grid>
              )
            })
          }
        </Grid>
      </>
    ) : (
      <p>Chưa có thông tin!!!</p>
    )
  )

  return (
    <>
      <Grid container style={{padding: "10px"}}>
        <Grid item sm={12} md={12}>
          <h3 style={{fontWeight:'bold',fontSize:'18px',textAlign: "center"}}>Hiện trạng</h3>
          {renderProgressNote}
        </Grid>
      </Grid>
    </>
  )
}
