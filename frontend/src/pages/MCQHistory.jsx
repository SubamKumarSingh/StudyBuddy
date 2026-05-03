import { useEffect, useState } from "react";
import api from "../api/axios";

export default function MCQHistory() {

  const [data, setData] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [selected, setSelected] = useState({});
  const [results, setResults] = useState({});
  const [explanations, setExplanations] = useState({});
  const [score, setScore] = useState(0);
  const [topic, setTopic] = useState("Notes");

  const letters = ["A", "B", "C", "D"];

  useEffect(() => {
    api.get("/knowledge/mcq/history/")
      .then(res => setData(res.data));
  }, []);

  /* ===============================
     GENERATE MCQs
  =============================== */
  const generate = async () => {

    const res = await api.post("/knowledge/mcq/generate/", {
      topic
    });

    setMcqs(res.data.mcqs);
    setSelected({});
    setResults({});
    setExplanations({});
    setScore(0);
  };

  /* ===============================
     SELECT OPTION
  =============================== */
  const selectOption = (qIndex, optIndex) => {
    setSelected(prev => ({
      ...prev,
      [qIndex]: letters[optIndex]
    }));
  };

  /* ===============================
     SUBMIT ANSWER (UPDATED  )
  =============================== */
  const submitAnswer = async (q, qIndex) => {

    const selectedOption = selected[qIndex];
    if (!selectedOption) return;

    const res = await api.post("/knowledge/mcq/submit/", {
      question: q.question,
      selected: selectedOption,
      correct: q.answer,
      topic: topic,
      pdf_name: q.pdf //   IMPORTANT
    });

    const isCorrect = res.data.correct;

    setResults(prev => ({
      ...prev,
      [qIndex]: isCorrect
    }));

    setExplanations(prev => ({
      ...prev,
      [qIndex]: res.data.explanation
    }));

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-orange-50 p-8">

      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold text-orange-600">
          Practice & Performance
        </h1>

        {/* SUMMARY */}
        <div className="bg-white p-6 rounded-2xl shadow flex justify-between">

          <div>
            <p className="text-gray-500">Total Attempts</p>
            <p className="text-xl font-semibold">{data.summary.total}</p>
          </div>

          <div>
            <p className="text-gray-500">Correct</p>
            <p className="text-xl font-semibold text-green-600">
              {data.summary.correct}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Accuracy</p>
            <p className="text-xl font-bold text-orange-600">
              {data.summary.accuracy}%
            </p>
          </div>

        </div>

        {/* PRACTICE */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">

          <h2 className="font-semibold text-orange-500">
            Practice Questions
          </h2>

          <button
            onClick={generate}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg"
          >
            Generate MCQs
          </button>

          <div className="text-lg font-semibold text-orange-600">
            Score: {score} / {mcqs.length}
          </div>

          {mcqs.map((q, i) => (

            <div key={i} className="border rounded-xl p-4 space-y-3">

              <p className="font-medium">
                {i + 1}. {q.question}
              </p>

              {/* OPTIONS */}
              {q.options.map((opt, j) => {

                const isSelected = selected[i] === letters[j];
                const isCorrect = q.answer === letters[j];
                const showResult = results[i] !== undefined;

                let bg = "bg-white";

                if (showResult) {
                  if (isCorrect) bg = "bg-green-100";
                  else if (isSelected) bg = "bg-red-100";
                } else if (isSelected) {
                  bg = "bg-orange-100";
                }

                return (
                  <div
                    key={j}
                    onClick={() => selectOption(i, j)}
                    className={`p-2 border rounded-lg cursor-pointer ${bg}`}
                  >
                    <span className="font-semibold mr-2">
                      {letters[j]}.
                    </span>
                    {opt}
                  </div>
                );
              })}

              <button
                onClick={() => submitAnswer(q, i)}
                className="bg-orange-500 text-white px-3 py-1 rounded"
              >
                Submit
              </button>

              {/* RESULT */}
              {results[i] !== undefined && (
                <>
                  <p className={`font-medium ${
                    results[i] ? "text-green-600" : "text-red-600"
                  }`}>
                    {results[i] ? "Correct!" : "Wrong!"}
                  </p>

                  {/*   REAL RAG EXPLANATION */}
                  {!results[i] && explanations[i] && (
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                      {explanations[i]}
                    </div>
                  )}
                </>
              )}

            </div>

          ))}

        </div>

        {/* HISTORY */}
        <div className="space-y-4">

          {data.attempts.map((a, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow">

              <p className="font-medium">
                {i + 1}. {a.question}
              </p>

              <p className="text-sm">
                Your: {a.selected} | Correct: {a.correct}
              </p>

              <p className={`font-semibold ${
                a.is_correct ? "text-green-600" : "text-red-600"
              }`}>
                {a.is_correct ? "Correct" : "Wrong"}
              </p>

              {!a.is_correct && a.explanation && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mt-2">
                  {a.explanation}
                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}