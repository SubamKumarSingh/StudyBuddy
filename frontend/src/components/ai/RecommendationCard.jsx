import { useEffect, useState } from "react";
import api from "../../api/axios";   // import your axios instance

export default function RecommendationCard(){

  const [recommendation,setRecommendation] = useState("Loading...");

  useEffect(()=>{

    async function loadRecommendation(){

      try{

        console.log("Calling recommendation API");

        const res = await api.get("/ai/recommendation/");

        console.log(res.data);

        setRecommendation(res.data.recommendation);

      }catch(err){

        console.error("Recommendation error:",err);

      }

    }

    loadRecommendation();

  },[]);

  return(

    <div style={{
      background:"white",
      padding:20,
      borderRadius:12,
      boxShadow:"0 2px 6px rgba(0,0,0,0.1)"
    }}>

      <h3>AI Recommendation</h3>

      <p>{recommendation}</p>

    </div>

  )

}