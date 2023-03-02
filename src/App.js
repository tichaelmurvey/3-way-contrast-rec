import './App.css';
import Radio from './components/radio';
import TestColors from './components/testColors';
import Results from './components/results';
import Preview from './components/preview';
import Fixes from './components/fixes'
import {testCases} from './data';
import { useState } from 'react';

function App() {
  const [testCase, setTestCase] = useState(testCases[0]);
  const [testColors, setTestColors] = useState(["#FFFFFF", "#006DFF", "#000000"]);
  function handleTestChange(testCase){
    setTestCase(testCase);
  }
  function handleTestColorChange(testColors){
    console.log(testColors);
    setTestColors(testColors);
  }
  function manualUpdateRatio(newRatio){
    setTestCase({
      ...testCase,
      ratio: newRatio
    })
  }
  return (
    <>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet" />
        <h1>🌈 Contrast Factory</h1>
        <p>This tool tests 2 or 3 colours for contrast, and recommends colours palettes with better contrast.</p>
        <div className="toolset">
          <div className="section choose-example">
            <h2>🧪 Test contrast for</h2>
            <fieldset className="test-cases">
            <h3>2 colours</h3>
              {testCases.filter(testCase => 
                  testCase.colors.length === 2
              ).map(testCase => 
                <Radio changeTest={handleTestChange} test={testCase} key={testCase.testCase} testCase={testCase.testCase} title={testCase.title}/>
              )}
              <h3>3 colours</h3>
              {testCases.filter(testCase => 
                  testCase.colors.length === 3
              ).map(testCase => 
                <Radio changeTest={handleTestChange} test={testCase} key={testCase.testCase} testCase={testCase.testCase} title={testCase.title}/>
              )}


            </fieldset>
            <ManualRatio test={testCase} manualUpdateRatio={manualUpdateRatio}/>
          </div>
          <TestColors changeColors={handleTestColorChange} test={testCase} colors={testColors}/>
          <Results test={testCase} colors={testColors}/>
          <Preview test={testCase} colors={testColors}/>
        </div>
        <Fixes test={testCase} colors={testColors.map((color, index) => {
      return {color: color, index: index}
    })}/>
    </>
  );
}

export default App;

function ManualRatio({test, manualUpdateRatio}){
    function changeHandler(evt){
      manualUpdateRatio(Number(evt.target.value));
    }
  return(
    <>
    <label htmlFor="ratio"><h3>Override default ratio</h3></label>
    <div className="select">
    <select name="ratio" id="ratio" value={String(test.ratio)} onChange={changeHandler}>
      <option value="3">3</option>
      <option value="4.5">4.5</option>
      <option value="7">7</option>
    </select>
    </div>
    </>
  )
}