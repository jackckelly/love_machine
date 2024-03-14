import { useState, useCallback, useRef, MutableRefObject } from "react";
import { Hearts } from "svg-loaders-react";

import { generateProfile } from "./generation.ts";
import Webcam from "react-webcam";

function Profile(props) {
    return (
        <div>
            <div></div>
        </div>
    );
}

const videoConstraints = {
    width: 480,
    height: 480,
    facingMode: "user",
};

async function crop(url: string, aspectRatio: number): Promise<string> {
    return await new Promise<string>((resolve) => {
        // this image will hold our source image data
        const inputImage = new Image();

        // we want to wait for our image to load
        inputImage.onload = () => {
            // let's store the width and height of our image
            const inputWidth = inputImage.naturalWidth;
            const inputHeight = inputImage.naturalHeight;

            // get the aspect ratio of the input image
            const inputImageAspectRatio = inputWidth / inputHeight;

            // if it's bigger than our target aspect ratio
            let outputWidth = inputWidth;
            let outputHeight = inputHeight;
            if (inputImageAspectRatio > aspectRatio) {
                outputWidth = inputHeight * aspectRatio;
            } else if (inputImageAspectRatio < aspectRatio) {
                outputHeight = inputWidth / aspectRatio;
            }

            // calculate the position to draw the image at
            const outputX = (outputWidth - inputWidth) * 0.5;
            const outputY = (outputHeight - inputHeight) * 0.5;

            // create a canvas that will present the output image
            const outputImage = document.createElement("canvas");

            // set it to the same size as the image
            outputImage.width = outputWidth;
            outputImage.height = outputHeight;

            // draw our image at position 0, 0 on the canvas
            const ctx = outputImage.getContext("2d");
            let newImgUri = url;
            if (ctx) {
                ctx.drawImage(inputImage, outputX, outputY);
                newImgUri = outputImage.toDataURL("image/png").toString();
            }
            resolve(newImgUri);
        };
        // start loading our image
        inputImage.src = url;
    });
}

function Casting() {
    const webcamRef = useRef() as MutableRefObject<Webcam>;
    const [imgSrc, setImgSrc] = useState("");
    const [loading, setLoading] = useState(false);

    const capture = useCallback(() => {
        if (webcamRef) {
            const imageSrc = webcamRef.current.getScreenshot() || "";
            crop(imageSrc, 1).then((i: string) => setImgSrc(i));
        }
    }, [webcamRef, setImgSrc]);

    const confirm = useCallback(() => {
        console.log("confirm");
        setLoading(true);
        generateProfile(imgSrc);
    }, [imgSrc]);

    const reject = useCallback(() => {
        setImgSrc("");
    }, [setImgSrc]);

    return (
        <div id="casting_call">
            <h1> CASTING CALL</h1>
            <div id="camera_container">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    mirrored={true}
                    videoConstraints={videoConstraints}
                />
                <button onClick={capture}>Capture</button>
            </div>
            <div id="confirm_container">
                <img src={imgSrc} />
                <button onClick={reject}>Retake</button>
                <button onClick={confirm}>Confirm</button>
            </div>
            <div id="loading_container">
                <Hearts className="hearts"></Hearts>
            </div>
        </div>
    );
}

export default Casting;
