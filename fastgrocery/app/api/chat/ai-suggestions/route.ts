import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  let role = "";
  try {
    const body = await req.json();
    const message = body.message;
    role = body.role;

    if (!message || !role) {
      return NextResponse.json(
        { error: "Message and role parameters are required" },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    // Fallback if Gemini key is missing or not yet configured
    if (!geminiKey || geminiKey.includes("<your-gemini-")) {
      console.log("Mock Gemini Mode: Generating local static reply suggestions.");
      let suggestions: string[] = [];

      if (role === "user") {
        suggestions = [
          "Okay, please come fast! 🚀",
          "I am at home, call me when you reach 📞",
          "Sure, thank you! 👍",
        ];
      } else {
        suggestions = [
          "On my way, will reach in 10 mins! 🏍️",
          "I have arrived at your location, please come down 📍",
          "Please share the delivery OTP code 🔑",
        ];
      }
      return NextResponse.json({ suggestions });
    }

    // Build the instruction prompt
    const promptText = `
You are an AI quick-reply suggestion engine for a grocery delivery application.
The user is a "${role}" in the system.
The last message received from the other person is: "${message}"

Based on this message, generate exactly 3 short, conversational, WhatsApp-style quick reply suggestions that this user can send.
Rules:
- Keep each reply under 10 words.
- Include a friendly emoji in each suggestion.
- Output ONLY the 3 suggestions separated by commas (no numbering, no quotes, no markdown). E.g.: "Option one 🌟, Option two 🚗, Option three 🍎"
`;

    // Make request to Gemini 2.5 Flash API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: promptText,
              },
            ],
          },
        ],
      }
    );

    const generatedText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!generatedText) {
      throw new Error("Empty response from Gemini API");
    }

    // Parse the comma-separated output
    const suggestions = generatedText
      .split(",")
      .map((item: string) => item.trim().replace(/^["']|["']$/g, "")) // trim spaces and quotes
      .filter((item: string) => item.length > 0)
      .slice(0, 3); // ensure only 3 suggestions are returned

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error.response?.data || error.message);
    
    // Safety fallback on error
    let suggestions = ["Sure! 👍", "Okay, thanks! 😊", "Got it! 👌"];
    if (role === "deliveryBoy") {
      suggestions = ["I'm on my way! 🏍️", "Arrived at location! 📍", "OTP please? 🔑"];
    }
    return NextResponse.json({ suggestions, error: error.message });
  }
}
