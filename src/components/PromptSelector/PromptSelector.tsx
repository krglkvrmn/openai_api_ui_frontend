import { useState } from "react";
import { SystemPrompt } from "../Prompt/Prompt";
import "./style.css";


function fetchSystemPrompts(): SystemPrompt[] {
    const result: SystemPrompt[] = [];
    fetch(
        'http://localhost:8000/api/v1/prompt/system/popular',
        {method: "GET"
    }).then(response => {
        if (!response.ok) {throw new Error('Failed to fetch system prompts')};
        return response.json();
    }).then(prompts => {
        result.push(...prompts);
    }).catch(error => console.error('Error:', error));
    console.log(result);
    return result;
};

export default function PromptSelector() {
    const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>(() => fetchSystemPrompts());
    return (
        <div id="system-prompt-selection-container">
            {systemPrompts.map((prompt, index) => {
                return (
                    <div className="system-prompt-selection-instance" key={index}>
                        <b>{prompt.content}</b>
                    </div>
                )})
            }
        </div>
    );
}