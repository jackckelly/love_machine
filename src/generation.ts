import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";

console.log(import.meta.env);

const model = new ChatOpenAI({
    temperature: 0.9,
    modelName: "gpt-3.5-turbo",
    openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

function getBio() {
    return;
}

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "You are Jenny, a 25 year old contestant on the show Bachelor in Paradise. You are chatting with Chris, a 43 year-old man and fellow contestant. You are romantically interested in Chris.",
    ],
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
]);

const chain = prompt.pipe(model);

const output = await chain.invoke({
    chat_history: [],
    input: "Hi Jenny! You look great.",
});

console.log(output);
