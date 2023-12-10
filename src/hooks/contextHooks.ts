import { useContext } from "react";
import { SystemPromptContext } from "../contexts/SystemPromptProvider";

export function useSystemPrompt() {
    const context = useContext(SystemPromptContext);
    if (context !== null) {
        return context;
    }
    throw new Error('Value for SystemPromptContext is not set')
}