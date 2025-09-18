import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import axios from 'axios';
import {exec} from 'child_process';//not need to install it's an build-in module
dotenv.config();
async function executeCommand(cmd = '') {
    return new Promise((res,rej)=>{
        exec(cmd, (error, data) =>{
            if(error){
                return res(`Error running command ${error}`);
            }else{
                res(data);
            }
        })
    })
}

const TOOL_MAP ={
    executeCommand: executeCommand
};

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

async function main() {
    const SYSTEM_PROMPT =  `You are an AI assistant who works on START, THINK and OUTPUT format.
    For a given user query first think and breakdown the problem into sub problems.
    You should always keep thinking and thinking before giving the actual output.
    
    Also, before outputing the final result to user you must check once if everything is correct.
    You also have list of available tools that you can call based on user query.
    
    For every tool call that you make, wait for the OBSERVATION from the tool which is the response from the tool that you called.
    
    Available Tools:
    - executeCommand(command: string): Takes a linux/unix command as arg and executes the command on user's machine and returns the output
    
    Rules:
    - Strictly follow the output JSON format
    - Always follow the output sequence that is START, THINK, OBSERVE and OUTPUT.
    - Always perform only one step at a time and wait for other step.
    - Always make sure to do multiple steps of thinking before giving out output.
    - For every tool call always wait for the OBSERVE which contains the output from tool
    
    Output JSON Format:
    {"step": "START | THINK | OUTPUT | OBSERVE | TOOL" , "content":"string", "tool_name":"string","input":"string"}
    
    Example:
    User: Hey, can you tell me average of first 5 natural numbers?
    Assistant: {"step": "START", "content": "The user is interested in the average of first 5 natural numbers."}
    Assistant: {"step": "THINK", "content":"Let me see if there is any available tool for this query"}
    Assistant: {"step": "THINK", "content": "I see that there is a tool available getAverageofNumbers which returns average of numbers}
    Assistant: {"step": "THINK", "content": "I need to call getAverageofNumbers for number 5 to get average of first 5 natural numbers}
    Assistant: {"step": "TOOL", "input": 5, "tool_name": "getAverageofNumbers" }
    Developer: {"step": "OBSERVE", "content": "The average of first 5 natural numbers is 3}
    Assistant: {"step": "THINK", "content": "Great, I got the average of first 5 natural numbers" }
    Assistant: {"step": "OUTPUT", "content": "The average of 5 natural numbers is 3}`;

    const messages = [
        {
            role: 'system',
            content: SYSTEM_PROMPT,
        }, 
        {
            role: 'user',
            content: 'Hey, Create a folder todo_app and create a simple todo application using html,css and js.',
        }
    ];

    while(true){
        const response = await client.chat.completions.create({
            model: 'mixtral-8x7b-32768',
    messages: messages,
    temperature: 0.7,
        });

        const rawContent = response.choices[0].message.content;
        const parsedContent = JSON.parse(rawContent);

        messages.push({
            role:'assistant',
            content: JSON.stringify(parsedContent),
        });

        if(parsedContent.step === 'START'){
            console.log('🔥', parsedContent.content);
            continue;
        }

        if (parsedContent.step === 'THINK') {
      console.log(`\t🧠`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === 'TOOL') {
      const toolToCall = parsedContent.tool_name;
      if (!TOOL_MAP[toolToCall]) {
        messages.push({
          role: 'developer',
          content: `There is no such tool as ${toolToCall}`,
        });
        continue;
      }

      const responseFromTool = await TOOL_MAP[toolToCall](parsedContent.input);
      console.log(
        `🛠️: ${toolToCall}(${parsedContent.input}) = `,
        responseFromTool
      );
      messages.push({
        role: 'developer',
        content: JSON.stringify({ step: 'OBSERVE', content: responseFromTool }),
      });
      continue;
    }

    if (parsedContent.step === 'OUTPUT') {
      console.log(`🤖`, parsedContent.content);
      break;
    }
  }

  console.log('Done...');
}

main();
