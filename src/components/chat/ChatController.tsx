import PromptSelectionSidebar from "../layout/PromptSelectionSidebar";
import PromptSelector from "../control/PromptSelector";
import {APIKeyForm} from "../forms/APIKeyForm";
import {useAPIKeys} from "../../hooks/useAPIKeys";
import Chat from "./Chat";
import {useSignalState} from "../../hooks/useSignalState";
import {useLocalAPIKey} from "../../hooks/contextHooks.ts";

export function ChatController() {
    const [systemPromptValue, setSystemPromptValue] = useSignalState<string>("");
    const { apiKeys, isEmpty: isApiKeysEmpty, dispatchers } = useAPIKeys()
    const localAPIKey = useLocalAPIKey()[0];
    const { saveApiKey } = dispatchers;
    const isSavedKeyExists = (apiKeys !== undefined && !isApiKeysEmpty);
    return (
        <div id="chat-controller">
            <div id="chat-content">
                {
                    !isSavedKeyExists && <APIKeyForm keySaveHandler={saveApiKey} />
                }
                {
                    (isSavedKeyExists || localAPIKey.value) &&
                        <Chat systemPromptParams={{systemPromptValue, setSystemPromptValue}} />
                }
            </div>
            <PromptSelectionSidebar>
                <PromptSelector promptSelectionCallback={setSystemPromptValue}/>
            </PromptSelectionSidebar>
        </div>
    );
}