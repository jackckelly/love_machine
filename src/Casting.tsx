import { useState, useCallback, useRef, MutableRefObject } from "react";
import { Hearts } from "svg-loaders-react";

import {
    DialogueEntry,
    ProfileData,
    generateProfile,
    generateTranscript,
} from "./generation.ts";
import Webcam from "react-webcam";

type QuestionCardProps = {
    question: string;
    answer: string;
    id: string;
};

function QuestionCard(props: QuestionCardProps) {
    return (
        <div className="question_card" id={props.id}>
            <div className="question">{props.question}</div>
            <div className="answer">{props.answer}</div>
        </div>
    );
}

function ProfileMini(props: ProfileData) {
    return (
        <div
            className="profile_mini"
            id={`profile_mini_${props.first_name}_${props.age}`}
        >
            <div className="column">
                <img className="profile_mini_photo" src={props.image} />
                <div className="profile_header">{props.first_name}</div>
            </div>
        </div>
    );
}

function Profile(props: ProfileData) {
    if (!props.success) {
        return <div className="profile_fail"></div>;
    }
    const questions = props.questions.map(([q, a], index) => {
        return (
            <QuestionCard
                id={`qc_${index}`}
                question={q}
                answer={a}
            ></QuestionCard>
        );
    });

    const hobbies = props.hobbies.map((h) => (
        <div className="hobby_card">{h}</div>
    ));

    return (
        <div
            className="profile_card"
            id={`profile_${props.first_name}_${props.age}`}
        >
            <div className="column">
                <img className="profile_photo" src={props.image} />
                <div className="profile_header">{`${props.first_name}, ${props.age}`}</div>
                <div className="profile_job">{props.job}</div>
                <div className="profile_hobbies">{hobbies}</div>
                {questions}
            </div>
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

class Profiles {
    profiles: ProfileData[];
    constructor() {
        this.profiles = [];
    }

    withProfile(profile: ProfileData): Profiles {
        let newProfiles = new Profiles();
        for (const p of this.profiles) {
            newProfiles.profiles.push(p);
        }

        newProfiles.profiles.push(profile);
        return newProfiles;
    }
}

function Casting(props: { update: (transcript: DialogueEntry[]) => void }) {
    let updateCallback = props.update;
    const webcamRef = useRef() as MutableRefObject<Webcam>;
    const [imgSrc, setImgSrc] = useState("");
    const [loading, setLoading] = useState(false);
    const [createNew, setCreateNew] = useState(true);
    const [hasMatch, setHasMatch] = useState(false);
    const [profiles, setProfiles] = useState(new Profiles());

    const capture = useCallback(() => {
        if (webcamRef) {
            const imageSrc = webcamRef.current.getScreenshot() || "";
            crop(imageSrc, 1).then((i: string) => setImgSrc(i));
        }
    }, [webcamRef, setImgSrc]);

    const confirm = useCallback(() => {
        console.log("confirm");
        setLoading(true);
        generateProfile(imgSrc).then((profile) => {
            setImgSrc("");
            setProfiles((current) => current.withProfile(profile));
            setLoading(false);
            setCreateNew(false);
        });
    }, [imgSrc]);

    const reject = useCallback(() => {
        setImgSrc("");
    }, [setImgSrc]);

    const addNew = useCallback(() => {
        setCreateNew(true);
    }, [setCreateNew]);

    const startConversation = useCallback(() => {
        console.log(profiles.profiles);
        if (profiles.profiles.length < 2) {
            return;
        } else {
            let p1 = profiles.profiles[0];
            let p2 = profiles.profiles[1];
            setLoading(true);
            setHasMatch(true);
            generateTranscript(p1, p2).then((transcript) => {
                console.log(transcript);
                updateCallback(transcript);
                setLoading(false);
            });
        }
    }, [setCreateNew, setLoading, profiles, updateCallback]);

    const profileDivs = profiles.profiles.map((profile) => (
        <Profile {...profile}></Profile>
    ));

    const loadMatchDiv =
        profiles.profiles.length == 2 ? (
            <div className="loading_match_container">
                <h2>It's a Match!</h2>
                <Hearts className="hearts"></Hearts>
                <div className="mini_profile_container">
                    <ProfileMini {...profiles.profiles[0]}></ProfileMini>
                    <h2>x</h2>
                    <ProfileMini {...profiles.profiles[1]}></ProfileMini>
                </div>
            </div>
        ) : (
            <div></div>
        );
    const loadProfileDiv = (
        <div id="loading_container">
            <h2>Finding your profile...</h2>
            <Hearts className="hearts"></Hearts>
        </div>
    );

    const displayCamera = !imgSrc && createNew;
    const displayConfirm = imgSrc && createNew && !loading;
    const displayLoading = loading;
    const displayProfile = !loading && !createNew;

    return (
        <div id="casting_call">
            <div
                id="camera_container"
                style={displayCamera ? {} : { display: "none" }}
            >
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    mirrored={true}
                    videoConstraints={videoConstraints}
                />
                <div className="button_container">
                    <button onClick={capture}>Capture</button>
                </div>
            </div>
            {displayConfirm && (
                <div id="confirm_container">
                    <img src={imgSrc} />
                    <div className="button_container">
                        <button onClick={reject}>Retake</button>
                        <button onClick={confirm}>Confirm</button>
                    </div>
                </div>
            )}
            <>
                {loading && !hasMatch && loadProfileDiv}
                {loading && hasMatch && loadMatchDiv}
            </>
            <div
                className="profiles_container"
                style={displayProfile ? {} : { display: "none" }}
            >
                {profileDivs}
                <div className="column">
                    <button onClick={addNew}>New Contestant</button>
                    <button onClick={startConversation}>Start!</button>
                </div>
            </div>
        </div>
    );
}

export default Casting;
