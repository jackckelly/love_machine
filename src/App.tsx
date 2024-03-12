import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

let test_data = [
    [
        "COLSON",
        "...a man known for his integrity, uh, standing before the Bar, you know, that kind of thing. But, a guy who is also totally loyal or just a damned good lawyer who would be professional then. That's one thought that I've been playing with the last couple of days.",
    ],
    ["PRESIDENT", "Yeah. Hum."],
    [
        "COLSON",
        "We have an advantage, you see, of getting all the, the people who have been in one way or another participating out of the damn thing so that you, you've got a guy who, uh, frankly can, can deal with, uh, deal with anybody he has to deal with.",
    ],
    ["PRESIDENT", "Yeah."],
    ["COLSON", "Special counsel."],
    [
        "PRESIDENT",
        "I think they have, of course, of course, you've got the problem of what the judge is gonna say Friday. I suppose he's gonna have quite an harangue, isn't he?",
    ],
    ["COLSON", "Oh yeah, yeah, he's, he's..."],
    [
        "PRESIDENT",
        "He's pretty tough and then, of course, you've got the problem of, uh, the defendants, particularly Hunt. What he, what's he gonna do. That's always a problem, I know.",
    ],
    ["COLSON", "Yeah."],
    [
        "PRESIDENT",
        "Of course he's got problems if he does anything. You know whether he's, uh...",
    ],
    ["COLSON", "Oh, that's right."],
    ["PRESIDENT", "You know what I mean. He's, uh..."],
    [
        "COLSON",
        "Yes, sir. I, my own opinion of that is that he, uh, that he just will hang in where he is. I mean, I think he, uh, that, at the moment I think that's in, in as good shape as it can be. Uh, you never know -- lot of...",
    ],
];

function textToSentences(text: String) {
    text.replace(
        /(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm,
        "$1$2|"
    ).split("|");
}


function 
class DialogueEntry {
  speaker: String;
  sentences: Array<String>
}


function App() {
    const [count, setCount] = useState(0);
    const [highlight, setHighlight] = useState(false);
    const;
    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img
                        src={reactLogo}
                        className="logo react"
                        alt="React logo"
                    />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setHighlight((highlight) => !highlight)}>
                    {highlight ? "ON" : "OFF"}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    );
}

export default App;
