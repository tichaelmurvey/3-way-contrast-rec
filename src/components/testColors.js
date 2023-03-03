import React, { useRef, useEffect, useState } from "react";
import { ChromePicker } from "react-color";

export default function TestColors({changeColors, test, colors}){
    function inputChangeHandler(color, index){
      if(/^#([0-9a-f]{3}){1,2}$/i.test(color)){
        let newColors = [...colors];
        newColors[index] = color;
        changeColors(newColors);
      }
    }
    return (
    <div className="section colors">
    <h2>🎨 With the colours</h2>
    {test.colors.map((test, index) =>{
      return <ColorPicker testItem={test} color={colors[index]} index={index} handleChangeColor={inputChangeHandler}/>
    })}
  </div>
  )
}

function ColorPicker({testItem, color, index, handleChangeColor}){
  const [showPicker, setShowPicker] = useState(false);
  const [localColor, setLocalColor] = useState(color);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, closeColorPicker);

  function closeColorPicker(){
    setShowPicker(false);
  }
  function openColorPicker(){
    setShowPicker(!showPicker);
  }
  function changeHandler(evt){
    setLocalColor(evt.target.value);
    handleChangeColor(evt.target.value, index);
  }
  function pickerChangeHandler(color){
    setLocalColor(color.hex);
    handleChangeColor(color.hex, index);
  }
  return(
    <div className="color-input color-one">
      <label htmlFor={"color-"+index}>{testItem}</label>
      <div className="color-container">
        <input onChange={changeHandler} type="text" id={"color-"+index} value={localColor} />
        <button onClick = {openColorPicker} className="picker"><div className={"color-preview color-"+index} style={{backgroundColor: color}} /></button>
      </div>
    <div ref={wrapperRef} >
    <PickerBox color={color} index={index} changeHandler={pickerChangeHandler} show={showPicker}/>
    </div>
    </div>
  )
}

function PickerBox({color, index, changeHandler, show}){
  function pickerChangeHandler(color){
    console.log(color.hex);
    changeHandler(color);
  }
  return(
  <div className = {"pickerPopup pickerPopup"+index} style={show ? {visibility: "visible"} : {visibility: "hidden"}}><ChromePicker 
          color = {color}
          onChange = {pickerChangeHandler}
        /></div>
  )
}

function useOutsideAlerter(ref, closePicker) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        closePicker();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}
