import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { AIMessage, HumanMessage } from "langchain/schema";

console.log(import.meta.env);

const model = new ChatOpenAI({
    temperature: 0.9,
    modelName: "gpt-3.5-turbo",
    openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export async function generateTranscript() {
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

        transcript.push([turn, String(output.content)]);
    }
    return transcript;
}

generateTranscript().then((e) => console.log(e));
