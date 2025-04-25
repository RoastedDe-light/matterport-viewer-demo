import { useEffect, useRef, useState } from "react";
import "./App.css";
import { setupSdk } from "@matterport/sdk";

function AppV4() {
    const [sdk, setSdk] = useState(null);
    const container = useRef(null);
    let started = false;


    useEffect(() => {
        if (!started && container.current) {
            started = true;
            const SDK_KEY = import.meta.env.VITE_MATTERPORT_SDK_KEY; // For SDK connection (optional)

            setupSdk(SDK_KEY, {
                container: container.current,
                space: "QrkEGSEztNh",
                iframeQueryParams: { qs: 1 },
                iframeAttributes: {
                    width: '500px',
                    height: '500px',
                    allow: "xr-spatial-tracking",
                    allowFullScreen: true
                },
            }).then(setSdk);
        }
    }, []);


    return (
        <div className="app">
            <div className="container" ref={container}></div>
        </div>
    );
}

export default AppV4;
