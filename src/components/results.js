export default function Results({test}){
    return(          
    <div className="section results">
    <h2>📝 Results</h2>
      <p className="passfail">
      These colours meet contrast requirements.
      </p>
      <p className="requirements">
        {test.req}
    </p>
  </div>
)
}