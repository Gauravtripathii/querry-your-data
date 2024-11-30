import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.API_KEY,
});

async function getGroqChatCompletion(jsonData: string, query: string) {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                // content: `Here's the data (consider this a table and make your answer to the point) : ${JSON.stringify(jsonData)}\n${query}. If it is required to print the table, just return pure plain html, nothing else, but only if required? And never mention the query that is being provided`,
                content: `Here's the data (consider this a table and make your answer to the point) : ${JSON.stringify(jsonData)}\n${query}. Return answer in the form of HTML. DO NOT MENTION THAT ANSWER IS IN FORM OF HTML, JUS RETURN ANSWER`,
            },
        ],
        model: "llama3-8b-8192",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null,
    });

    const answer = [];
    for await (const chunk of chatCompletion) {
        answer.push(chunk.choices[0]?.delta?.content || "");
    }
    return answer.join("");
}

export async function POST(request: NextRequest) {
    try {
        const { jsonData, query } = await request.json();
        const answer = await getGroqChatCompletion(jsonData, query);

        return NextResponse.json({
            answer,
            success: true,
        });
    } catch (error) {
        return NextResponse.json({error}, {status: 500});        
    }
}





