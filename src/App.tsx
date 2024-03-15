import Editor from "./Editor.tsx";
import Casting from "./Casting.tsx";
import { useState, useCallback, useRef, MutableRefObject } from "react";
import { Hearts } from "svg-loaders-react";

import "./App.css";
import { DialogueEntry } from "./generation.ts";

function App() {
    const [transcript, setTranscript] = useState(new Array<DialogueEntry>());
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);

    const updateDialogue = (newTranscript: DialogueEntry[]) => {
        setTranscript(newTranscript);
    };
    let showTranscript = transcript.length > 0;
    let castingProps = {
        update: updateDialogue,
    };

    const finish = () => {
        setFinished(true);
    };

    let editorProps = {
        dialogue: transcript,
        finishCallback: finish,
    };

    const setStart = () => {
        setStarted(true);
    };

    return (
        <>
            {!started && (
                <div>
                    <h1>Love Machine</h1>
                    <Hearts className="hearts"></Hearts>
                    <div className="button_container">
                        <button onClick={(e) => setStart()}>Start</button>
                    </div>
                </div>
            )}
            {started && !finished && !showTranscript && (
                <Casting {...castingProps}></Casting>
            )}
            {started && !finished && showTranscript && (
                <Editor {...editorProps}></Editor>
            )}
            {started && finished && (
                <div>
                    <h1>Roll credits!</h1>
                    <h2>Thank you everyone!</h2>
                    <Hearts className="hearts"></Hearts>
                </div>
            )}
        </>
    );
}

export default App;
