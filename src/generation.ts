import { registerSchema, validate } from "@hyperjump/json-schema/draft-07";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { AIMessage, HumanMessage } from "langchain/schema";
import OpenAI from "openai";
import profile from "../profile.json";

let profile_questions = [
    "A life goal of mine",
    "A random fact I love",
    "Ask me anything about",
    "Best travel story",
    "Biggest risk I've taken",
    "Can we talk about",
    "Change my mind about",
    "Don't hate me if I",
    "I geek out on",
    "I get myself out of a funk by",
    "I hype myself up by",
    "I recently discovered that",
    "I want someone who",
    "I wish more people knew",
    "I won't shut up about",
    "I'm weirdly attracted to",
    "I'll fall for you if",
    "I'm looking for",
    "Let me teach you how to",
    "Let's make sure we're on the same page about",
    "Most spontaneous thing I've done",
    "My favorite line from a movie",
    "My friends ask me for advice about",
    "My greatest strength",
    "My happy place",
    "My most controversial opinion is",
    "My therapist would say I",
    "One thing I'll never do again",
    "Teach me something about",
    "The last time I cried happy tears was",
    "This year, I really want to",
    "We'll get along if",
    "We're the same type of weird if",
    "When I need advice, I go to",
    "Worst idea I've ever had",
];

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY, // This is the default and can be omitted
    dangerouslyAllowBrowser: true,
});

function get_system_prompt(): string[] {
    profile_questions.sort((a, b) => 0.5 - Math.random());
    let prompt = `You create fun, fake dating profile for fictional characters on reality show.
    Using an image as inspiration, you invent a fictious character and output their dating app profile as JSON with the following fields
    "first_name" - the character's first name
    "age" - the character's age
    "job" - the character's job
    "hobbies" - a list of 3-5 hobbies or pasttimes the character is passionate about. Each should be at most two words.
    "question_1" - a half sentence response finishing the conversation prompt "${profile_questions[0]}". Do not repeat the prompt.
    "question_2" - a half sentence response finishing the conversation prompt "${profile_questions[1]}". Do not repeat the prompt.
    "question_3" - a half sentence response finishing the conversation prompt "${profile_questions[2]}". Do not repeat the prompt.
`;
    return [
        prompt,
        profile_questions[0],
        profile_questions[1],
        profile_questions[2],
    ];
}

registerSchema(profile, "https://jckelly.xyz/schema");
const isValidProfile = await validate("https://jckelly.xyz/schema");

export async function generateProfile(
    imageString: string
): Promise<ProfileData> {
    console.log(imageString);
    let system_prompt = get_system_prompt();
    let response = "";
    let recievedValidResponse = false;
    let profile = null;
    let questions: string[] = [];
    for (let i = 0; i < 3 && !recievedValidResponse; i++) {
        const profileCompletion = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                { role: "system", content: system_prompt[0] },
                {
                    role: "user",
                    content: [
                        {
                            type: "image_url",
                            image_url: {
                                url: imageString,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
        });
        questions = system_prompt.slice(1);
        console.log(profileCompletion);
        response = profileCompletion.choices[0].message.content || "";

        const jsonCleanUp = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content:
                        "You take in text that contains JSON and output the data reformated properly into JSON object. Do not otherwise alter the data or comment on it.",
                },
                {
                    role: "user",
                    content: response,
                },
            ],
            max_tokens: 1000,
        });

        response = jsonCleanUp.choices[0].message.content || "";

        profile = JSON.parse(response);

        recievedValidResponse = isValidProfile(profile).valid;
    }

    if (recievedValidResponse) {
        let question_sets = [
            [questions[0], profile.question_1],
            [questions[1], profile.question_2],
            [questions[2], profile.question_3],
        ];
        profile.questions = question_sets;
        profile.image = imageString;
        profile.success = true;
    } else {
        profile.success = false;
    }

    return profile;
}

export type ProfileData = {
    first_name: string;
    age: number;
    job: string;
    hobbies: string[];
    questions: [string, string][];
    success: boolean;
    image: string;
};

function profile_prompt(profile) {
    let system_prompt = `You help run a new dating reality show called "Love Machine". On "Love Machine", singles looking for romance are paired up to go on dates in hopes of finding the partners of their dreams.
    You will be given descriptions of two contestants. You must generate a transcript of their successful first date and return it as JSON.
    All dialogue should be accessible via field name "dialogue", which stories an array of ordered [speaker, dialogue] arrays.`;
    return system_prompt;
}
export async function generateTranscript(c1, c2) {
    let system_prompt = `You help run a new dating reality show called "Love Machine". On "Love Machine", singles looking for romance are paired up to go on dates in hopes of finding the partners of their dreams.
You will be given descriptions of two contestants. You must generate a transcript of their successful first date and return it as JSON.
All dialogue should be accessible via field name "dialogue", which stories an array of ordered [speaker, dialogue] arrays.`;
    const jsonCleanUp = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        response_format: { type: "json_object" },
        messages: [
            {
                role: "system",
                content: system_prompt,
            },
        ],
        max_tokens: 2000,
    });

    let transcript = jsonCleanUp.choices[0].message.content || "";
    /*
    const guy_prompt =
        "You are James, a 25 year old contestant on a dating show. You are talking to Jennifer, a fellow contestant. She's a woman you are physically and romantically attracted to.";
    const girl_prompt =
        "You are Jennifer, a 25 year old contestant on a dating show. You are talking to James, a fellow contestant. Hes's a man you are physically and romantically attracted to.";

    let guy_turn = true;
    let transcript = [["James", "It's great to meet you."]];
    for (let i = 0; i < 10; i++) {
        guy_turn = !guy_turn;

        let history = [];
        let turn = guy_turn ? "James" : "Jennifer";

        for (const [speaker, message] of transcript) {
            if (speaker != turn) {
                history.push(new AIMessage(message));
            } else {
                history.push(new HumanMessage(message));
            }
        }

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", guy_turn ? guy_prompt : girl_prompt],
            ...history,
        ]);

        const chain = prompt.pipe(model);

        const output = await chain.invoke({
            input: "dummy",
        });
        console.log(output.content);
        transcript.push([turn, String(output.content)]);

        
    }*/
    return transcript;
}

//generateTranscript().then((e) => console.log(e));
