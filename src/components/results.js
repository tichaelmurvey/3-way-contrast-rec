import {checkCompliant} from '../logic/checkContrast';
import chroma from "chroma-js";


export default function Results({test, colors}){
    const ratio = test.ratio;
    let compliant = false;
    if(test.colors.length > 2){
      compliant = checkCompliant(colors[0], colors[1], ratio) && checkCompliant(colors[0], colors[2], ratio) && checkCompliant(colors[1], colors[2], ratio);
    } else {
      compliant = checkCompliant(colors[0], colors[1], ratio);
      console.log(compliant);
    }
    return(          
    <div className="section results">
    <h2>📝 Results</h2>
      <p className={compliant ? "passfail pass" : "passfail fail"}>
      These colours {compliant ? "meet" : "do not meet"} contrast requirements.
    </p>
    <p>
      <RatioResult colors={[colors[0], colors[1]]} testNames={[test.colors[0], test.colors[1]]} ratio={test.ratio}/>
      {test.colors.length > 2 && 
      <>
      <RatioResult colors={[colors[1], colors[2]]} testNames={[test.colors[1], test.colors[2]]} ratio={test.ratio}/>
      <RatioResult colors={[colors[2], colors[0]]} testNames={[test.colors[2], test.colors[0]]} ratio={test.ratio}/>
      </>
    }
    </p>
    <p>    
        {test.req}
    </p>
  </div>
)
}

function RatioResult({colors, testNames, ratio}){
  return(
    <div className = "ratio-result">
  <div className="ratio-preview">
    <div style={{
      backgroundColor: colors[0]
    }}
    ></div>
    <div style={{
      backgroundColor: colors[1]
    }}
    ></div>
  </div>
  <p className="ratio">{checkCompliant(colors[0], colors[1], ratio) ? "✔️" : "❌"} The {testNames[0]} and {testNames[1]} have a ratio of {Math.round(chroma.contrast(colors[0], colors[1])*100)/100}.</p>
  </div>
  )
}