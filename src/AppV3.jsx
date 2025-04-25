import React, { useEffect, useRef, useState } from 'react';
import { setupSdk } from '@matterport/sdk';
import axios from 'axios';

const AppV3 = () => {
    const [matterportModelsList, setMatterportModelsList] = useState([]);
    const [selectedSid, setSelectedSid] = useState('');
    const containerRef = useRef(null);
    const sdkRef = useRef(null);
    const startedRef = useRef(false);

    const getMatterportModels = async () => {
        const TOKEN = import.meta.env.VITE_MATTERPORT_API_TOKEN;
        const SECRET = import.meta.env.VITE_MATTERPORT_API_SECRET;
        const AUTH_HEADER = "Basic " + btoa(`${TOKEN}:${SECRET}`);
        const GRAPHQL_URL = "https://api.matterport.com/api/models/graph";

        try {
            const results = await axios({
                method: 'post',
                url: GRAPHQL_URL,
                headers: {
                    Authorization: AUTH_HEADER,
                    "Content-Type": "application/json",
                },
                data: {
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
                    `
                }
            });

            const modelsList = results.data.data.models.results || [];
            setMatterportModelsList(modelsList);
        } catch (error) {
            console.error("GraphQL Errors:", error);
        }
    };

    useEffect(() => {
        getMatterportModels();
    }, []);

    useEffect(() => {
        const sdkKey = import.meta.env.VITE_MATTERPORT_SDK_KEY;

        if (selectedSid && containerRef.current && !startedRef.current) {
            setupSdk(sdkKey, {
                space: selectedSid,
                container: containerRef.current,
                iframeQueryParams: { qs: 1 },
                iframeAttributes: {
                    width: '100%',
                    height: '500px',
                    allow: "xr-spatial-tracking",
                    allowFullScreen: true
                }
            }).then((sdk) => {
                sdkRef.current = sdk;
                startedRef.current = true;
                console.log(`SDK initialized with model: ${selectedSid}`);
            });
        } else if (selectedSid && sdkRef.current) {
            sdkRef.current.Scene.load(selectedSid).then(() => {
                console.log(`Loaded model: ${selectedSid}`);
            });
        }
    }, [selectedSid]);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Virtual Tour</h1>
            <select
                value={selectedSid}
                onChange={(e) => {
                    setSelectedSid(e.target.value);
                    startedRef.current = false; // allow reinitialization
                }}
                style={{ padding: "0.5rem", fontSize: "1rem", marginBottom: "1rem" }}
            >
                <option value="">Select a model</option>
                {matterportModelsList.map((model) => (
                    <option key={model.id} value={model.id}>
                        {model.name || model.id}
                    </option>
                ))}
            </select>

            {selectedSid && (
                <div ref={containerRef}></div>
            )}
        </div>
    );
};

export default AppV3;
