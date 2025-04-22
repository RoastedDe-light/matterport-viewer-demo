import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

// ⚠️ Replace these with your actual Matterport credentials
const TOKEN = import.meta.env.VITE_MATTERPORT_API_TOKEN;
const SECRET = import.meta.env.VITE_MATTERPORT_API_SECRET;
const SDK_KEY = import.meta.env.VITE_MATTERPORT_SDK_KEY; // For SDK connection (optional)

const AUTH_HEADER = "Basic " + btoa(`${TOKEN}:${SECRET}`);
const GRAPHQL_URL = "https://api.matterport.com/api/models/graph";

function ModelSelectorPage() {
  const [models, setModels] = useState([]);
  const [selectedSid, setSelectedSid] = useState("");

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
            query: `query {
              models(query: "*") {
                totalResults
                results {
                  id
                  name
                }
              }
            }`,
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

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Select a Matterport Model</h1>
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

      <div>
        {selectedSid && (
          <Link
            to={`/viewer/${selectedSid}`}
            style={{
              display: "inline-block",
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            Go to Model Viewer
          </Link>
        )}
      </div>
    </div>
  );
}

function ModelViewerPage() {
  const { sid } = useParams();
  const iframeRef = React.useRef(null);

  // Connect SDK after iframe loads (optional)
  useEffect(() => {
    if (!sid) return;

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
  }, [sid]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Model Viewer</h1>
      {sid && (
        <iframe
          ref={iframeRef}
          title="Matterport Viewer"
          src={`https://my.matterport.com/show/?m=${sid}&play=1`}
          width="1200"
          height="700"
          allow="xr-spatial-tracking"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
}

function AppV2() {
  return (
    <Router>
      <div>
        <nav style={{ padding: "1rem", backgroundColor: "#f8f9fa" }}>
          <Link to="/" style={{ marginRight: "1rem" }}>
            Model Selector
          </Link>
          <Link to="/viewer" style={{ marginRight: "1rem" }}>
            Model Viewer (Direct)
          </Link>
        </nav>
        <Routes>
          <Route path="/" element={<ModelSelectorPage />} />
          <Route path="/viewer/:sid" element={<ModelViewerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default AppV2;
