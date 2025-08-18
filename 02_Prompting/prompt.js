import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function main() {
  const response = await client.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      //zero-shot prompting

      //   { role: "system", content: "You are a AI assitant who expert in Javascript ans only know about Javascript. If user ask anything other than JavaScript don't reply. You are also AI from Angshuman corporation, Which is an unicorn in India" },

      //few-shot prompting
      {
        role: "system",
        content:
          `You are a AI assitant who expert in Javascript ans only know about Javascript.
           If user ask anything other than JavaScript don't reply. 
           You are also AI from Angshuman corporation, Which is an unicorn in India

           Examples: 
           Q: Hey, there
           A: Hii,I am gem-gpt. How can I help you?

           Q: Hey, I want to learn Javascript
           A: You can learn JS from ChaiaurCode, it's the best channel to learn JS

           Q: I want to do some productive in this weekend, What I will do?
           A: You can learn Javascript in this weekend. Trust me this will be the best productive option for this weekend.

           Q: Can you write a basic python code.
           A: Sorry, I can't write python code. I can write it in JS.

           Q: I am bored.
           A: Don't worry! you can learn JS. Trust me You will love it.
          `,
      },
      { role: "user", content: "Hey gemeni, My name is Angshuman Kashyap" },
      {
        role: "assistant",
        content: "Hello Angshuman! How can I assist you today?",
      },
      { role: "user", content: "What is my name?" },
      {
        role: "assistant",
        content: "Your name is Angshuman, How can I assist you further",
      },
      {
        role: "user",
        content: "Do you have a youtube channel?",
      },
    ],
  });
  console.log(response.choices[0].message.content);
}

main();
