import React, { useState } from "react";
import getRecs from "../logic/recommend";

export default function Fixes({test, colors}){
    const [changeColors, setChangeColors] = useState([false, false, false]);
    const [results, setResults] = useState();

    function getResults(){
      setResults(<Results 
      changeColors={colors.filter(function(color, index){
        return changeColors[index];
      })}
      keepColors = {
        colors.slice(0,(test.colors.length))
        .filter(function(color, index){
          return !changeColors[index];
        })}
      ratio={test.ratio}
      />)
    }
    function updateColors(index){
      let copyChangeColors = [...changeColors];
      copyChangeColors[index] = !copyChangeColors[index];
      setChangeColors(copyChangeColors);
    }
    return(
    <div className="section fixes">
        <h2>👩‍🏫 Recommend colours</h2>
        <p>Choose which colours to change.</p>
        {
          [...Array(test.colors.length).keys()].map((item, index) => {
            return <ColorSelector key={index} index={index} colors={colors} updateColors={updateColors}/>
          })
        }
        <button className="get-fixes" onClick={getResults}>Recommend colors ></button>
        {results}
      </div>
    )
}

function ColorSelector({index, colors, updateColors}){
  function changeHandler(evt){
    updateColors(index);
  }
  return(
    <label htmlFor={"color-"+index+"-checkbox"} className="changeSelect">
    <input onChange={changeHandler} type="checkbox" id={"color-"+index+"-checkbox"} /> 
    Color {index+1}
    <div className="color-preview" style={{backgroundColor: colors[index]}} />
    </label>
  )
}

function Results({changeColors, keepColors, ratio}){
  let recs = getRecs(changeColors, keepColors, ratio);
  console.log(recs);
  return(
    <div class="results">
      {recs.map((color, index) => {
        return <ResultContainer key={index} color={color}/>
      })}
    </div>
  )
}

function ResultContainer({color}){
  return(
    <div class="result">
      <p>{color.color}</p>
    </div>
  )
}