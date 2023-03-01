import React, { useState } from "react";
import getRecs from "../logic/recommend";
import {ComponentPreview} from "./preview"

export default function Fixes({test, colors}){
    const [results, setResults] = useState();
    const [checked, setChecked] = useState([false, false, false]);

    function getResults(){
      let colorInput = colors.slice(0,(test.colors.length))
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
      console.log(copyChecked);
      setChecked(copyChecked);
    }
    return(
      <div className="section fixes">
        <div className="fixesInput">
          <h2>👩‍🏫 Recommend colours</h2>
          <p>Choose which colours to change.</p>
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
    <input onChange={changeHandler} type="checkbox" id={"color-"+index+"-checkbox"} /> 
    {test.colors[index]}
    <div className="color-preview" style={{backgroundColor: color}} />
    </label>
  )
}

function Results({changeColors, keepColors, ratio, test}){
  let recs = getRecs(changeColors, keepColors, ratio);
  console.log(recs);
  let resultBlock;
  if(typeof(recs) == "object"){
    if(recs.length === 0){
      return "No colors found";
    } else {
      resultBlock = recs.map((colorSet, index) => {
        return <ResultContainer key={index} colorSet={colorSet} test={test}/>
      })
    }
  } else {
    resultBlock = recs
  }

  return(
    <div className="results">
      {resultBlock}
    </div>
  )
}

function ResultContainer({colorSet, test}){
  const sortedColorSet = colorSet.sort((a,b) => a.index - b.index);
  return(
    <div className="result">
      <ComponentPreview test={test} colors={sortedColorSet.map(color => {return color.color})} />
      {sortedColorSet.map(color => (
        <div>
              <p><div className="color-preview" style={{backgroundColor: color.color}} />{test.colors[color.index]}: {color.color} </p>
            </div>
      ))}
    </div>
  )
}