export default function testColors({changeColors, test, colors}){
    function inputChangeHandler(evt){
      const test = evt.target.id;
      console.log(test === "one");
      const newColors = [
        evt.target.id === "color-one" ? evt.target.value : colors[0],
        evt.target.id === "color-two" ? evt.target.value : colors[1],
        evt.target.id === "color-three" ? evt.target.value : colors[2],
      ]
      changeColors(newColors);
    }
    return (
    <div className="section colors">
    <h2>🎨 With the colours</h2>
    <div className="color-input color-one">
      <label htmlFor="color-one">{test.colors[0]}</label>
      <div className="color-container">
        <input onChange={evt => inputChangeHandler(evt)} type="text" id="color-one" defaultValue={colors[0]} />
        <div className="color-preview color-one" style={{backgroundColor: colors[0]}} />
      </div>
    </div>
    <div className="color-input color-two">
      <label htmlFor="color-one">{test.colors[1]}</label>
      <div className="color-container">
        <input onChange={evt => inputChangeHandler(evt)} type="text" id="color-two" defaultValue={colors[1]} />
        <div className="color-preview color-two" style={{backgroundColor: colors[1]}}/>
      </div>
    </div>
    {test.colors.length > 2 && 
    <div className="color-input color-three">
      <label htmlFor="color-one">{test.colors[2]}</label>
      <div className="color-container">
        <input onChange={evt => inputChangeHandler(evt)} type="text" id="color-three" defaultValue={colors[2]} />
        <div className="color-preview color-three" style={{backgroundColor: colors[2]}}/>
      </div>
    </div> }
  </div>
  )
}