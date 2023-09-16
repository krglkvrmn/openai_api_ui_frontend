import "./style.css";

const defaultModel = "gpt-3.5-turbo";

export default function ModelSelector({model, modelSwitchHandler}: {model: string, modelSwitchHandler: CallableFunction}) {
    return (
        <div id="model-selector-container">
            <select id="model-selector-input"
                    value={model}
                    onChange={e => modelSwitchHandler(e.target.value)}>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
            </select> 
        </div>
    )
}