export default function StudyContextPanel({ context }) {

  if (!context) return <div style={{width:300}}>Loading...</div>;

  const focus = context.focus;
  const decision = context.decision;

  return (

    <div style={{
      width: 300,
      padding: 20,
      background: "white",
      borderRight: "1px solid #eee"
    }}>

      <h2>Study Context</h2>

      <div style={{marginTop:20}}>

        <h4>Focus Score</h4>
        <p>{focus.focus_score}</p>

        <h4>Consistency</h4>
        <p>{focus.consistency}%</p>

        <h4>Engagement</h4>
        <p>{focus.engagement}%</p>

        <h4>Recommended Strategy</h4>
        <p>{decision.strategy}</p>

        <h4>Next Material</h4>
        <p>{decision.pdf_title}</p>

      </div>

    </div>
  );
}