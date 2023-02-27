

export default function Preview({test, colors}){
    return(
        <div className="section preview">
            <h2>🖼️ How it looks</h2>
            {test.testCase === "focused_button" && <FocusedButtonExample colors={colors}/>}
            {test.testCase === "button" && <ButtonExample colors={colors}/>}
            {test.testCase === "link" && <LinkExample colors={colors}/>}
            {test.testCase === "text_regular" && <TextExample colors={colors}/>}
            {test.testCase === "text_large" && <LargeTextExample colors={colors}/>}
            {test.testCase === "neutral_2" && <TwoColorsExample colors={colors}/>}
            {test.testCase === "neutral_3" && <ThreeColorsExample colors={colors}/>}
      </div>
    )
}

function FocusedButtonExample ({colors}){
    return (
        <div className="example focused-button-example"
        style={{
            backgroundColor: colors[0]
        }}
        >
        <button
            style={{
                backgroundColor: colors[2],
                color: colors[0],
                border: "2px solid",
                borderColor: colors[1]
            }}
        >Focused button</button>
        </div>
    )
}


function ButtonExample ({colors}){
    return (
        <div className="example button-example"
        >
        <button
            style = {{
                backgroundColor: colors[0],
                color: colors[1]
            }}
        >Button</button>
        </div>
    )
}

function LinkExample ({colors}){
    return(
    <div className="example link-example"
    style={{
        backgroundColor: colors[0]
    }}
    >
    <span 
    style={{
        color: colors[1]
    }}
    >Some text, with a <a href="#"         
        style={{
        color: colors[2],
        textDecoration: "none"
    }}>link</a></span>
    </div>
    )
}

function TextExample ({colors}){
    return(
    <div className="example text-example"
        style={{
            backgroundColor: colors[0]
        }}
    >
    <span
        style={{
            color: colors[1]
        }}
    >Some text</span>
    </div>
    )
}

function LargeTextExample ({colors}){
    return(
        <div className="example large-text-example"
        style={{
            backgroundColor: colors[0]
        }}
    >
    <span
        style={{
            color: colors[1]
        }}
    >Some large text</span>
    </div>
    )
}



function TwoColorsExample ({colors}){
    return(
    <div className="example two-colors-example"
        style={{
            backgroundColor: colors[0]
        }}
    >
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMaxYMax slice">
        <g transform="scale(1.5306364539439146)">
        <rect x="0" y="0" width="217.78" height="217.78" fill={colors[0]}/><polygon points="0,0 217.78,217.78 0,217.78" fill={colors[1]}/>
        <rect x="217.78" y="0" width="217.78" height="217.78" fill={colors[0]}/>
        <polygon points="217.78,0 435.56,0 435.56,217.78" fill={colors[1]}/>
        <rect x="435.56" y="0" width="217.78" height="217.78" fill={colors[0]}/>
        <path d="M 435.56 0 A 217.78 217.78 0 0 0 653.34 217.78 L 653.34 0" fill={colors[1]}/>
        <rect x="0" y="217.78" width="217.78" height="217.78" fill={colors[1]}/>
        <path d="M 0 217.78 A 217.78 217.78 0 0 1 217.78 435.56 L 0 435.56" fill={colors[0]}/>
        <rect x="217.78" y="217.78" width="217.78" height="217.78" fill={colors[0]}/>
        <path d="M 217.78 217.78 A 217.78 217.78 0 0 0 435.56 435.56 L 435.56 217.78" fill={colors[0]}/>
        <rect x="435.56" y="217.78" width="217.78" height="217.78" fill={colors[0]}/>
        <polygon points="435.56,217.78 653.34,435.56 435.56,435.56" fill={colors[1]}/>
        <rect x="0" y="435.56" width="217.78" height="217.78" fill={colors[1]}/>
        <path d="M 0 435.56 A 217.78 217.78 0 0 1  217.78 653.34 L 0 435.56 A 217.78 217.78 0 0 0 217.78 653.34" fill={colors[1]}/>
        <rect x="217.78" y="435.56" width="217.78" height="217.78" fill={colors[0]}/>
        <path d="M 217.78 653.34 A 217.78 217.78 0 0 1  435.56 435.56 L 435.56 653.34" fill={colors[1]}/>
        <rect x="435.56" y="435.56" width="217.78" height="217.78" fill={colors[1]}/>
        <path d="M 435.56 653.34 A 217.78 217.78 0 0 1  653.34 435.56 L 653.34 653.34" fill={colors[1]}/>
        </g>
      </svg>

    </div>
    )
}
function ThreeColorsExample ({colors}){
    return(
    <div className="example three-colors-example">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMaxYMax slice">
        <g transform="scale(1.5306364539439146)">
        <rect x="0" y="0" width="217.78" height="217.78" fill={colors[0]}/><polygon points="0,0 217.78,217.78 0,217.78" fill={colors[2]}/>
        <rect x="217.78" y="0" width="217.78" height="217.78" fill={colors[0]}/>
        <polygon points="217.78,0 435.56,0 435.56,217.78" fill={colors[1]}/>
        <rect x="435.56" y="0" width="217.78" height="217.78" fill={colors[0]}/>
        <path d="M 435.56 0 A 217.78 217.78 0 0 0 653.34 217.78 L 653.34 0" fill={colors[2]}/>
        <rect x="0" y="217.78" width="217.78" height="217.78" fill={colors[1]}/>
        <path d="M 0 217.78 A 217.78 217.78 0 0 1 217.78 435.56 L 0 435.56" fill={colors[0]}/>
        <rect x="217.78" y="217.78" width="217.78" height="217.78" fill={colors[0]}/>
        <path d="M 217.78 217.78 A 217.78 217.78 0 0 0 435.56 435.56 L 435.56 217.78" fill={colors[0]}/>
        <rect x="435.56" y="217.78" width="217.78" height="217.78" fill={colors[0]}/>
        <polygon points="435.56,217.78 653.34,435.56 435.56,435.56" fill={colors[2]}/>
        <rect x="0" y="435.56" width="217.78" height="217.78" fill={colors[1]}/>
        <path d="M 0 435.56 A 217.78 217.78 0 0 1  217.78 653.34 L 0 435.56 A 217.78 217.78 0 0 0 217.78 653.34" fill={colors[1]}/>
        <rect x="217.78" y="435.56" width="217.78" height="217.78" fill={colors[0]}/>
        <path d="M 217.78 653.34 A 217.78 217.78 0 0 1  435.56 435.56 L 435.56 653.34" fill={colors[1]}/>
        <rect x="435.56" y="435.56" width="217.78" height="217.78" fill={colors[1]}/>
        <path d="M 435.56 653.34 A 217.78 217.78 0 0 1  653.34 435.56 L 653.34 653.34" fill={colors[2]}/>
        </g>
      </svg>
    </div>
    )
}