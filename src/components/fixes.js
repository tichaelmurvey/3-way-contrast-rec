import React, { useState } from "react";
import getRecs from "../logic/recommend";
import {ComponentPreview} from "./preview"
import {filterSimilarColorsets} from "../logic/recommend"

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
  let recs = getRecs(changeColors, keepColors, ratio, 3);
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
    <div className = "reusltsContainer">
      <div className="results">
        {resultBlock}
      </div>
      <button className="get-fixes" style={{marginLeft: " 40px"}}>See more</button>
    </div>
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