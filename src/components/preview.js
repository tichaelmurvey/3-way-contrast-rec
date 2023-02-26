

export default function Preview({test}){
    return(
        <div className="section example">
            <h2>🖼️ How it looks</h2>
            {test.testCase === "focused_button" && <FocusedButtonExample />}
            {test.testCase === "button" && <ButtonExample />}
            {test.testCase === "link" && <LinkExample />}
            {test.testCase === "text_regular" && <TextExample />}
            {test.testCase === "text_large" && <LargeTextExample />}
            {test.testCase === "neutral_2" && <TwoColorsExample />}
            {test.testCase === "neutral_3" && <ThreeColorsExample />}
      </div>
    )
}

function FocusedButtonExample (){
    return (
        <div className="focused-button-example">
        <button>Focused button</button>
        </div>
    )
}


function ButtonExample (){
    return (
        <div className="button-example">
        <button>Button</button>
        </div>
    )
}

function LinkExample (){
    return(
    <div className="link-example">
    <span>Some text, with a <a href="#">link</a></span>
    </div>
    )
}

function TextExample (){
    return(
    <div className="text-example">
    <span>Some text</span>
    </div>
    )
}

function LargeTextExample (){
    return(
    <div className="large-text-example">
    <span>Some large text</span>
    </div>
    )
}



function TwoColorsExample (){
    return(
    <div className="colors-example">
    <p>Some colors</p>
    </div>
    )
}
function ThreeColorsExample (){
    return(
    <div className="colors-example">
    <p>Some colors</p>
    </div>
    )
}