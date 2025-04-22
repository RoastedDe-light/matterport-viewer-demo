import React, { useEffect, useRef, useState } from "react";

// ⚠️ Replace these with your actual Matterport credentials
const TOKEN = import.meta.env.VITE_MATTERPORT_API_TOKEN;
const SECRET = import.meta.env.VITE_MATTERPORT_API_SECRET;
const SDK_KEY = import.meta.env.VITE_MATTERPORT_SDK_KEY; // For SDK connection (optional)

const AUTH_HEADER = "Basic " + btoa(`${TOKEN}:${SECRET}`);
const GRAPHQL_URL = "https://api.matterport.com/api/models/graph";

function App() {
  const [models, setModels] = useState([]);
  const [selectedSid, setSelectedSid] = useState("");
  const iframeRef = useRef(null);

  // Fetch models using GraphQL
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            Authorization: AUTH_HEADER,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query {
                models(query: "*") {
                  totalResults
                  results {
                    id
                    name
                  }
                }
              }
            `,
          }),
        });

        const json = await res.json();
        console.log("🚀 GraphQL response:", json);

        if (json.errors) {
          console.error("❌ GraphQL Errors:", json.errors);
        }

        const results = json?.data?.models?.results || [];
        setModels(results);
      } catch (error) {
        console.error("❌ Fetch failed:", error);
      }
    };

    fetchModels();
  }, []);

  // Connect SDK after iframe loads (optional)
  useEffect(() => {
    if (!selectedSid || !iframeRef.current) return;

    const script = document.createElement("script");
    script.src = "https://static.matterport.com/showcase-sdk/latest.js";
    script.async = true;

    script.onload = () => {
      window.MP_SDK.connect(iframeRef.current, SDK_KEY, "")
        .then((sdk) => {
          console.log("✅ SDK Connected:", sdk);
        })
        .catch((err) => console.error("SDK Connection Error:", err));
    };

    document.body.appendChild(script);
  }, [selectedSid]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Matterport Model Viewer</h1>

      <select
        value={selectedSid}
        onChange={(e) => setSelectedSid(e.target.value)}
        style={{ padding: "0.5rem", fontSize: "1rem", marginBottom: "1rem" }}
      >
        <option value="">Select a model</option>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name || model.id}
          </option>
        ))}
      </select>

      {selectedSid && (
        <iframe
          ref={iframeRef}
          title="Matterport Viewer"
          src={`https://my.matterport.com/show/?m=${selectedSid}&play=1`}
          width="1200"
          height="700"
          allow="xr-spatial-tracking"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
}

export default App;
