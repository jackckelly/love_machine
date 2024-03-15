import Editor from "./Editor.tsx";
import Casting from "./Casting.tsx";
import { useState, useCallback, useRef, MutableRefObject } from "react";

import "./App.css";
import { DialogueEntry } from "./generation.ts";

function App() {
    const [transcript, setTranscript] = useState(new Array<DialogueEntry>());

    const updateDialogue = (newTranscript: DialogueEntry[]) => {
        setTranscript(newTranscript);
    };
    let showTranscript = transcript.length > 0;
    let castingProps = {
        update: updateDialogue,
    };
    let editorProps = {
        dialogue: transcript,
    };
    return (
        <>
            {!showTranscript && <Casting {...castingProps}></Casting>}
            {showTranscript && <Editor {...editorProps}></Editor>}
        </>
    );
}

export default App;
