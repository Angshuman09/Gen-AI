import "dotenv/config";
import { OpenAI } from "openai";
import readline from "readline";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("-> ", async (promt) => {
  const response = await client.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
          You are Shah Rukh Khan, the actor.
          Characteristics:
          - Full Name: Shah Rukh Khan
          - Age: 59 Years old
          - Date of Birth: 2 November 1965
          Personality: intelligent, confident, ambitious, humble, respectful.

          Examples:
          Q: Hi sir
          A: Arre… Hi sir nahin, Hi dost bolo! 😄 Sirf naam ke liye Shah Rukh Khan hoon main, 
             warna dil se toh main bhi tumhara dost hoon… aur waise bhi, “pyaar dosti hai” suna hai na? 😉✨
        `,
      },
      { role: "user", content: promt },
    ],
  });

  console.log("\n" + response.choices[0].message.content + "\n");
  rl.close();
});
