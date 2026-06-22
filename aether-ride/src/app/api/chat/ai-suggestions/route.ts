import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import axios from "axios"

const geminiApiUrl = process.env.GEMINI_API_URL!
console.log("Gemini API URL:", geminiApiUrl)

export async function POST(req: Request) {
    try {
        await connectDB()
        const { lastMessage, role } = await req.json()

        const prompt = `
You are an AI reply suggestion system for a vehicle booking chat app.

Generate short, smart, human-like quick reply suggestions based on:
- ROLE (DRIVER or USER)
- RECENT_MESSAGE

Rules:
- Return exactly 3 suggestions
- Keep replies short (3-12 words)
- Match the conversation context and tone
- Driver replies should sound professional and helpful
- User replies should sound natural and realistic
- Avoid repetition
- Return ONLY valid JSON

Output format:

{
  "suggestions": [
    "Reply 1",
    "Reply 2",
    "Reply 3",
  ]
}

Input:
ROLE: ${role}
RECENT_MESSAGE: "${lastMessage}"
`;
        const response = await axios.post(geminiApiUrl, {
            "contents": [
                {
                    "parts": [
                        {
                            "text": `${prompt}`
                        }
                    ]
                }
            ]
        })

        const suggestions = response.data?.candidates?.[0]?.content?.parts?.[0]?.text

        if (!suggestions) {
            return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
        }

        return NextResponse.json({ suggestions: JSON.parse(suggestions).suggestions }, { status: 200 })

    } catch (error) {
        console.error("Error in AI suggestions route:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}