import { useEffect, useState } from "react";
import api from "../api/axios";
import DelayedHoverExplain from "./ui/DelayedHoverExplain";

export default function StudyHeatmap() {

  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/analytics/heatmap/")
      .then(res => setData(res.data));
  }, []);

  return (

    <DelayedHoverExplain
      title="Study activity heatmap"
      body="This grid highlights when the user studied most so it is easier to spot productive days and identify gaps."
      detailRows={[
        { label: "Purpose", value: "Show daily activity density" },
        { label: "Use it for", value: "See habits at a glance" },
      ]}
    >
      {(open) => (
        <div className={`bg-white p-6 rounded-xl shadow ${open ? "ring-2 ring-orange-100" : ""}`}>

          <h2 className="text-lg mb-4">
            Study Activity
          </h2>

          <div className="grid grid-cols-7 gap-2">

            {data.map((d,i)=>{

              const intensity =
                d.minutes > 60 ? "bg-green-600" :
                d.minutes > 30 ? "bg-green-400" :
                d.minutes > 10 ? "bg-green-200" :
                "bg-gray-100"

              return (

                <div
                  key={i}
                  className={`w-6 h-6 rounded ${intensity}`}
                  title={`${d.date} : ${d.minutes} minutes`}
                />

              )

            })}

          </div>

        </div>
      )}
    </DelayedHoverExplain>

  )

}
