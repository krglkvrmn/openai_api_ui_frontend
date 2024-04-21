import styles from "./style.module.css";
import {useDialog} from "../../../../hooks/useDialog.ts";


const modelOptions = ['gpt-3.5-turbo', 'gpt-4'];
const modelOptionsDisplayMap = new Map([
    ['gpt-3.5-turbo', 'GPT-3.5'],
    ['gpt-4', 'GPT-4'],
])


type ModelSelectorProps = {
    activeModel?: string;
    modelSwitchHandler?: (newModel: string) => void;
}

export default function ModelSelector({activeModel, modelSwitchHandler}: ModelSelectorProps) {
    const { isOpened, dialogRef, openDialog, closeDialog } = useDialog("popup");
    return (
        <div className={styles.modelSelectorContainer}>
            <div className={styles.modelSelectorPopupTriggerButtonContainer}>
                <button onClick={isOpened ? closeDialog : openDialog}
                        className={styles.modelSelectorPopupTriggerButton}>
                    { activeModel && modelOptionsDisplayMap.get(activeModel)}

                </button>
            </div>
            <dialog ref={dialogRef} className={styles.modelSelectorPopup}>
                {
                    modelOptions.map((model, index) => (
                        <button key={index} className={styles.modelSelectionButton}
                                onClick={() => {
                                    modelSwitchHandler && modelSwitchHandler(model);
                                    closeDialog();
                                }}>
                            {modelOptionsDisplayMap.get(model)}
                        </button>
                    ))
                }
            </dialog>
        </div>

    );
}
