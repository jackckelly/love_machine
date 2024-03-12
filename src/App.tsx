import { useState, useCallback, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import "./generation.ts";
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

function textToSentences(text: String): string[] {
    return text
        .replace(/(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|")
        .split("|");
}
class DialogueEntry {
    speaker: string;
    text: string;

    public constructor(speaker: string, text: string) {
        this.speaker = speaker;
        this.text = text;
    }
}

class Highlights {
    highlights: Highlight[];
    constructor() {
        this.highlights = [];
    }

    withUpdate(index: number, start: number, end: number): Highlights {
        const next = new Highlights();
        for (const h of this.highlights) {
            next.highlights.push(new Highlight(h.index, h.start, h.end));
        }
        next.highlights.push(new Highlight(index, start, end));
        return next;
    }

    isHighlighted(index: number, word: number): boolean {
        for (const highlight of this.highlights) {
            if (
                index === highlight.index &&
                word >= highlight.start &&
                word <= highlight.end
            ) {
                return true;
            }
        }
        return false;
    }
}

class Highlight {
    index: number;
    start: number;
    end: number;

    constructor(index: number, start: number, end: number) {
        this.index = index;
        this.start = start;
        this.end = end;
    }
}

const dialogue: DialogueEntry[] = [];
for (const [id, text] of test_data) {
    //const sentences = textToSentences(text);
    const d = new DialogueEntry(id, text);
    dialogue.push(d);
}
console.log(dialogue);

function App() {
    // const [highlight, setHighlight] = useState(false);
    const [transcriptIndex, setTranscriptIndex] = useState(-1);
    const [highlightStart, setHighlightStart] = useState(-1);
    const [transcript, setTranscript] = useState({});
    const [highlights, setHighlights] = useState(new Highlights());

    const handleMouseUp = useCallback((e: MouseEvent) => {
        setHighlightStart(() => -1);
        setTranscriptIndex(() => {
            console.log("updating index to", -1);
            return -1;
        });
        console.log("no highlight");
    }, []);

    useEffect(() => {
        document.addEventListener("mouseup", handleMouseUp);
        return () => document.removeEventListener("mouseup", handleMouseUp);
    });

    const handleHighlightStart = (index: number, start: number) => {
        setTranscriptIndex(() => {
            console.log("updating index to", index);
            return index;
        });
        setHighlightStart(() => start);
        console.log(
            `highlight starts: transcript entry: ${index}, word ${start}`
        );
    };

    const handleHighlightEnd = (index: number, end: number) => {
        const start = highlightStart;
        const prev_index = transcriptIndex;
        setTranscriptIndex(() => {
            console.log("updating index to", -1);
            return -1;
        });
        setHighlightStart(() => -1);

        if (index === prev_index) {
            // account for "backwards" highlights
            const first = Math.min(start, end);
            const last = Math.max(start, end);

            console.log(
                `highlight ends: transcript entry: ${index}, ${first} to ${last}`
            );
            setHighlights((current) => {
                console.log(current.highlights);
                const newHighlights = current.withUpdate(index, first, last);
                console.log(newHighlights.highlights);
                return newHighlights;
            });
        } else {
            console.log(index, prev_index);
            console.log("no highlight; mismatched indices");
        }
    };

    const transcript_entries = dialogue.map((d, i) => {
        const text = d.text.split(" ").map((x, j) => (
            <span
                key={`${d.speaker}_${i}_${j}`}
                onMouseDown={(e) => handleHighlightStart(i, j)}
                onMouseUp={(e) => {
                    e.stopPropagation();
                    handleHighlightEnd(i, j);
                }}
                className={
                    highlights.isHighlighted(i, j)
                        ? "span_highlighted"
                        : "span_normal"
                }
            >
                {x}{" "}
            </span>
        ));
        return (
            <>
                <h3>{d.speaker}</h3>
                <div>{text}</div>
            </>
        );
    });
    return <>{transcript_entries}</>;
}

export default App;
