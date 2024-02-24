const modelOptions = ['gpt-3.5-turbo', 'gpt-4']


type ModelSelectorProps = {
    activeModel?: string;
    modelSwitchHandler?: (newModel: string) => void;
}

export default function ModelSelector({activeModel, modelSwitchHandler}: ModelSelectorProps) {
    return (
        <div id="model-selector-container">
            <select name="model" id="model-selector" value={activeModel}
                    onChange={e => modelSwitchHandler === undefined ? undefined : modelSwitchHandler(e.target.value)}>
                {modelOptions.map(model => {
                    return <option className="model-selector-option"
                                   key={model} value={model}>{model.toUpperCase()}</option>;
                })}
            </select>
        </div>
    )
}