import React, { useState } from "react";
import getRecs from "../logic/recommend";
import {ComponentPreview} from "./preview"

export default function Fixes({test, colors}){
    const [results, setResults] = useState();
    const [checked, setChecked] = useState([true, true, true]);
    function getResults(){
      let localColors = structuredClone(colors)
      let colorInput = localColors.slice(0,(test.colors.length))
      setResults(<Results 
      changeColors={colorInput.filter(function(color){
        return checked[color.index];
      })}
      keepColors = {
        colorInput.filter(function(color){
          return !checked[color.index];
        })}
      ratio={test.ratio}
      test = {test}
      />)
    }
    function updateChecked(index){
      let copyChecked = [...checked];
      copyChecked[index] = !copyChecked[index];
      setChecked(copyChecked);
    }
    return(
      <div className="section fixes">
        <div className="fixesInput">
          <h2>👩‍🏫 Recommend colors</h2>
          <p>Choose which colors to change.</p>
          {
            [...Array(test.colors.length).keys()].map((item, index) => {
              return <ColorSelector key={index} index={index} color={colors[index].color} test={test} updateChecked={updateChecked}/>
            })
          }
          <button className="get-fixes" onClick={getResults}>Recommend colors ></button>
          </div>
          {results}
        </div>
    )
}

function ColorSelector({index, color, test, updateChecked}){
  function changeHandler(evt){
    updateChecked(index);
  }
  return(
    <label htmlFor={"color-"+index+"-checkbox"} className="changeSelect">
    <input defaultChecked onChange={changeHandler} type="checkbox" id={"color-"+index+"-checkbox"} /> 
    {test.colors[index]}
    <div className="color-preview" style={{backgroundColor: color}} />
    </label>
  )
}

function Results({changeColors, keepColors, ratio, test}){
  let defaultNumColors = 6;
  let [NumColors, setNumColors] = useState(defaultNumColors);
  let resultBlock = <ResultBlock changeColors={changeColors} keepColors={keepColors} ratio={ratio} test={test} numColors={NumColors} setNumColors={setNumColors} />
  return(
    <div className = "resultsContainer">
        {resultBlock}
    </div>
  )
}

function ResultBlock({changeColors, keepColors, ratio, test, numColors, setNumColors}){
  let isMessage = false;
  function renderResults(changeColors, keepColors, ratio, test, numColors){
    let recs = getRecs(changeColors, keepColors, ratio, numColors);
    if(typeof(recs) == "object"){
      if(recs.length === 0){
        isMessage = true;
        return <>
        <div role="alert" className= "failedMessage">
        <p>No compliant colors were found for this input.</p>
        <p>Consider the following options:</p>
        <ul>
          <li>Try allowing more colors to change, it's possible the colors you chose do not have a compliant option, especially at higher contrast ratios.</li>
          <li>Note that there are no compliant combinations of 3 colors at a ratio of 7.</li>
          <li>Try swapping one of the colors for black or white.</li>
        </ul>
        </div>
         </>;
      } else {
        isMessage = false;
        return <div className = "results">
        {recs.map((colorSet, index) => {
          return <ResultContainer key={index} colorSet={colorSet} test={test}/>
        })}
      </div>
      }
    } else {
      isMessage = true;
       return <div role= "alert" className = "failedMessage">{recs}</div>
    }
  }

  function getButton(){
      return numColors < 20 ?
      <button onClick={()=>{
        setNumColors(20);
      }} className="get-fixes see-more" >See more</button>
      :  <button onClick={()=>{
        setNumColors(6);
      }} className="get-fixes see-more" >See less</button>
    }
  return(
    <>    
      {renderResults(changeColors, keepColors, ratio, test, numColors)}
    {!isMessage && getButton()}
    </>
  )
}

function ResultContainer({colorSet, test}){
  return(
    <div className="result">
      <ComponentPreview test={test} colors={colorSet.map(color => {return color.color})} />
      {colorSet.map(color => (
        <div>
              <p><div className="color-preview" style={{backgroundColor: color.color}} />{test.colors[color.index]}: {color.color} </p>
            </div>
      ))}
    </div>
  )
}