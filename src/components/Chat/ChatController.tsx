import PromptSelectionSidebar from "../layout/PromptSelectionSidebar";
import PromptSelector from "../control/PromptSelector";
import {APIKeyForm} from "../forms/APIKeyForm";
import {useAPIKeys} from "../../hooks/useAPIKeys";
import {Route, Routes} from "react-router-dom";
import Chat from "./Chat";
import {useSignalState} from "../../hooks/useSignalState";

export function ChatController() {
    const [systemPromptValue, setSystemPromptValue] = useSignalState<string>("");
    const { apiKeys, isEmpty: isApiKeysEmpty } = useAPIKeys()
    return (
        <div id="chat-controller">
            <div id="chat-content">
                {(apiKeys === undefined || isApiKeysEmpty) && <APIKeyForm />}
                <Routes>
                    <Route path=':chatId' element={
                        <Chat systemPromptParams={{systemPromptValue, setSystemPromptValue}} />
                    }/>
                </Routes>
                
            </div>
            <PromptSelectionSidebar>
                <PromptSelector promptSelectionCallback={setSystemPromptValue}/>
            </PromptSelectionSidebar>
        </div>
    );
}