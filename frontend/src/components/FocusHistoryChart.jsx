import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import DelayedHoverExplain from "./ui/DelayedHoverExplain";

export default function FocusHistoryChart(){

  const [data,setData]=useState([]);

  useEffect(()=>{

    api.get("/analytics/focus-history/")
      .then(res=>setData(res.data));

  },[]);

  return(

    <DelayedHoverExplain
      title="Focus over time"
      body="This chart shows how the user’s focus score changes over time so they can connect habits to performance."
      detailRows={[
        { label: "Purpose", value: "Track focus trends" },
        { label: "Use it for", value: "Notice progress or decline" },
      ]}
    >
      {(open) => (
        <div className={`bg-white p-6 rounded-xl shadow ${open ? "ring-2 ring-orange-100" : ""}`}>

          <h2 className="text-lg mb-4">
            Focus Over Time
          </h2>

          <ResponsiveContainer width="100%" height={250}>

            <LineChart data={data}>

              <XAxis dataKey="session"/>
              <YAxis domain={[0,100]}/>
              <Tooltip/>

              <Line
                type="monotone"
                dataKey="focus"
                stroke="#f97316"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>
      )}
    </DelayedHoverExplain>

  )

}
