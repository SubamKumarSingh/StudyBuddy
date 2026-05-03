import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AIDashboard() {

  const [data, setData] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [mcqs, setMcqs] = useState([]);
  const [selected, setSelected] = useState({});
  const [results, setResults] = useState({});
  const [score, setScore] = useState(0);

  const letters = ["A", "B", "C", "D"];

  useEffect(() => {
    api.get("/knowledge/dashboard/")
      .then(res => setData(res.data));
  }, []);

  const ask = async () => {
    const res = await api.post("/knowledge/chat/global/", {
      question
    });
    setAnswer(res.data.answer);
  };

  const generate = async () => {
    const res = await api.post("/knowledge/mcq/generate/", {
      topic: question
    });

    setMcqs(res.data.mcqs);
    setSelected({});
    setResults({});
    setScore(0);
  };

  const selectOption = (qIndex, optIndex) => {
    setSelected(prev => ({
      ...prev,
      [qIndex]: letters[optIndex]
    }));
  };

  const submitAnswer = async (q, qIndex) => {
    const selectedOption = selected[qIndex];

    if (!selectedOption) return;

    const res = await api.post("/knowledge/mcq/submit/", {
      question: q.question,
      selected: selectedOption,
      correct: q.answer,
      topic: question
    });

    const isCorrect = res.data.correct;

    setResults(prev => ({
      ...prev,
      [qIndex]: isCorrect
    }));

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  if (!data) return <p className="p-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-orange-50 p-8">

      <div className="max-w-5xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold text-orange-600">
          AI Study Dashboard
        </h1>

        {/* DASHBOARD CARDS */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="font-semibold text-orange-500">Focus</h2>
            <p className="text-lg">{data.focus.focus_score}</p>
            <p className="text-sm text-gray-600">{data.focus.explanation}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="font-semibold text-orange-500">Recommended</h2>
            <p>{data.pedagogy.strategy}</p>
            <p className="text-sm text-gray-500">{data.pedagogy.pdf_title}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="font-semibold text-orange-500">Performance</h2>
            <p>Accuracy: {data.performance.accuracy}%</p>
            <p className="text-sm text-gray-600">
              Weak: {data.performance.weak_topics.join(", ")}
            </p>
          </div>

        </div>

        {/* CHAT */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask anything..."
            className="w-full border p-3 rounded-lg focus:outline-orange-400"
          />

          <button
            onClick={ask}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Ask AI
          </button>

          {answer && (
            <p className="bg-orange-50 p-3 rounded">{answer}</p>
          )}
        </div>

        {/* MCQ SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-6">

          <div className="flex justify-between items-center">
            <button
              onClick={generate}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Generate MCQs
            </button>

            <div className="text-lg font-semibold text-orange-600">
              Score: {score} / {mcqs.length}
            </div>
          </div>

          {mcqs.map((q, i) => (
            <div key={i} className="border rounded-xl p-4 space-y-3">

              <p className="font-medium">{i + 1}. {q.question}</p>

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
                    className={`p-2 border rounded-lg cursor-pointer hover:bg-orange-50 ${bg}`}
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
                className="mt-2 bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
              >
                Submit
              </button>

              {results[i] !== undefined && (
                <p className={`text-sm font-medium ${results[i] ? "text-green-600" : "text-red-600"}`}>
                  {results[i] ? "Correct!" : "Wrong!"}
                </p>
              )}

              {results[i] !== undefined && (
                <p className="text-sm text-gray-600">
                  {q.explanation}
                </p>
              )}

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}




