import { useEffect, useState } from "react";
import api from "../api/axios";
import DelayedHoverExplain from "./ui/DelayedHoverExplain";

export default function AIInsights(){

  const [insights,setInsights]=useState([]);

  useEffect(()=>{

    api.get("/analytics/insights/")
      .then(res=>setInsights(res.data.insights));

  },[]);

  return(

    <DelayedHoverExplain
      title="AI study insights"
      body="This card surfaces machine-generated takeaways so the user can quickly understand what the data is pointing to."
      detailRows={[
        { label: "Purpose", value: "Summarize AI findings" },
        { label: "Use it for", value: "Learn what changed" },
      ]}
    >
      {(open) => (
        <div className={`bg-white p-6 rounded-xl shadow ${open ? "ring-2 ring-orange-100" : ""}`}>

          <h2 className="text-lg mb-4">
            AI Study Insights
          </h2>

          <div className="space-y-3">

            {insights.map((i,index)=>(

              <div
                key={index}
                className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
              >

                {i}

              </div>

            ))}

          </div>

        </div>
      )}
    </DelayedHoverExplain>

  )

}
