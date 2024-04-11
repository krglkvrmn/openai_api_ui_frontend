import styles from "./style.module.css";


const modelOptions = ['gpt-3.5-turbo', 'gpt-4']


type ModelSelectorProps = {
    activeModel?: string;
    modelSwitchHandler?: (newModel: string) => void;
}

export default function ModelSelector({activeModel, modelSwitchHandler}: ModelSelectorProps) {
    return (
        <div className={styles.modelSelectorContainer}>
            <select name="model" className={styles.modelSelector} value={activeModel}
                    onChange={e => modelSwitchHandler === undefined ? undefined : modelSwitchHandler(e.target.value)}>
                {modelOptions.map(model => {
                    return <option className={styles.modelSelectorOption}
                                   key={model} value={model}>{model.toUpperCase()}</option>;
                })}
            </select>
        </div>
    )
}