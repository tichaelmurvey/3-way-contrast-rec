export default function radio(props){
    function clickHandler(){
        props.changeTest(props.test);
    }
    return(
    <div>
        <label htmlFor={props.testCase}> <input type="radio" defaultChecked={props.testCase === "text_regular"} onClick={clickHandler} id={props.testCase} name="example" />{props.title}</label>
    </div>
    )
}