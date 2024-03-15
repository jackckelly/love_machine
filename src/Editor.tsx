import { useState, useCallback, useEffect } from "react";

import { generateTranscript, DialogueEntry } from "./generation.ts";

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

class Highlights {
    highlights: Map<number, [number, number][]>;
    constructor() {
        this.highlights = new Map<number, [number, number][]>();
    }

    withUpdate(index: number, start: number, end: number): Highlights {
        const next = new Highlights();
        for (const [i, ranges] of this.highlights) {
            if (i !== index) {
                next.highlights.set(i, ranges);
            }
        }
        const current_ranges: [number, number][] =
            this.highlights.get(index) || [];
        const new_ranges: [number, number][] = [];
        let candidate_range: [number, number] = [start, end];
        let add_candidate = true;

        for (const [start_2, end_2] of current_ranges) {
            if (end >= start_2 && start <= end_2) {
                // okay, the two ranges overlap

                // Case one, it expands the selection
                if (start < start_2 || end > end_2) {
                    candidate_range = [
                        Math.min(start, start_2),
                        Math.max(end, end_2),
                    ];
                }
                // Case two, it deletes part of the selection
                else if (start == start_2 && end == end_2) {
                    // no op
                    add_candidate = false;
                } else if (start == start_2 && end < end_2) {
                    new_ranges.push([end + 1, end_2]);
                    add_candidate = false;
                } else if (start > start_2 && end == end_2) {
                    new_ranges.push([start_2, start - 1]);
                    add_candidate = false;
                } else {
                    new_ranges.push([start_2, start - 1]);
                    new_ranges.push([end + 1, end_2]);
                    add_candidate = false;
                }
            } else {
                new_ranges.push([start_2, end_2]);
            }
        }
        if (add_candidate) {
            new_ranges.push(candidate_range);
        }

        //console.log(new_ranges);
        new_ranges.sort((a, b) => a[0] - b[0]);
        //console.log(new_ranges);

        next.highlights.set(index, new_ranges);

        return next;
    }

    isHighlighted(index: number, word: number): boolean {
        let ranges = this.highlights.get(index);

        if (ranges === undefined) {
            return false;
        }
        for (const [start, end] of ranges) {
            if (word >= start && word <= end) {
                return true;
            }
        }
        return false;
    }
}

const dialogue: DialogueEntry[] = [];
for (const [id, text] of test_data) {
    //const sentences = textToSentences(text);
    const d = new DialogueEntry(id, text);
    dialogue.push(d);
}
console.log(dialogue);

function Editor(props: {
    dialogue: DialogueEntry[];
    finishCallback: () => void;
}) {
    // const [highlight, setHighlight] = useState(false);
    const [transcriptIndex, setTranscriptIndex] = useState(-1);
    const [highlightStart, setHighlightStart] = useState(-1);
    const [highlights, setHighlights] = useState(new Highlights());
    //const [editorOn, setEditorOn] = useState(false);
    const [edits, setEdits] = useState(new Array<Highlights>());

    const handleMouseUp = useCallback((e: MouseEvent) => {
        setHighlightStart(() => -1);
        setTranscriptIndex(() => {
            console.log("updating index to", -1);
            return -1;
        });
        console.log("no highlight");
    }, []);

    let transcript = props.dialogue;

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

    /*
    const handleRegenerate = () => {
        generateTranscript().then((value) => {
            let new_transcript: DialogueEntry[] = [];
            for (const [id, text] of value) {
                //const sentences = textToSentences(text);
                const d = new DialogueEntry(id, text);
                new_transcript.push(d);
            }
            setTranscript(() => new_transcript);
            setHighlights(() => new Highlights());
        });
    };*/

    const clear = () => {
        setHighlightStart(-1);
        setTranscriptIndex(-1);
        setHighlights(new Highlights());
    };

    const save = () => {
        let h = highlights;
        setHighlights(new Highlights());
        setEdits((current) => {
            let copy = [...current];
            copy.push(h);
            return copy;
        });
    };

    const finish = () => {};

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

    const transcript_entries = transcript.map((d, i) => {
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
                <div className="text_container">{text}</div>
            </>
        );
    });

    const jsx_rows = [];

    const num_entries = transcript.length;
    let current_speaker = "";
    let text_buffer = [];
    for (let i = 0; i < num_entries; i++) {
        for (const [start, end] of highlights.highlights.get(i) || []) {
            if (transcript[i].speaker != current_speaker) {
                current_speaker = transcript[i].speaker;
                if (text_buffer.length != 0) {
                    jsx_rows.push(
                        <div className="text_container">
                            {text_buffer.join(" ... ")}
                        </div>
                    );
                    text_buffer = [];
                }
                jsx_rows.push(<h3>{current_speaker}</h3>);
            }
            text_buffer.push(
                transcript[i].text
                    .split(" ")
                    .slice(start, end + 1)
                    .join(" ")
            );
        }
    }
    if (text_buffer.length != 0) {
        jsx_rows.push(
            <div className="text_container">{text_buffer.join(" ... ")}</div>
        );
        text_buffer = [];
    }

    return (
        <>
            <h3>{"First Date Transcript <3"}</h3>
            <div id="editor_container" className="row">
                <div id="transcript">
                    <h3>ORIGINAL</h3>
                    {transcript_entries}
                </div>
                <div id="edited">
                    <h3>EDIT {edits.length + 1}</h3>
                    {jsx_rows}
                </div>
                <div>
                    <button onClick={(e) => clear()}>Clear</button>
                    <button onClick={(e) => save()}>Save</button>
                    <button onClick={(e) => props.finishCallback()}>
                        Finish
                    </button>
                </div>
            </div>
        </>
    );
}

export default Editor;
