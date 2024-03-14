import { useState, useCallback, useRef, MutableRefObject } from "react";

import Webcam from "react-webcam";

function Casting() {
    const webcamRef = useRef() as MutableRefObject<Webcam>;
    const [imgSrc, setImgSrc] = useState("");

    const capture = useCallback(() => {
        if (webcamRef) {
            const imageSrc = webcamRef.current.getScreenshot() || "";
            setImgSrc(imageSrc);
        }
    }, [webcamRef, setImgSrc]);

    return (
        <div id="casting_call">
            <h1> CASTING CALL</h1>
            <button>Add Contestant</button>
            <button onClick={capture}>Capture photo</button>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                mirrored={true}
            />
            {imgSrc && <img src={imgSrc} />}
        </div>
    );
}

export default Casting;
