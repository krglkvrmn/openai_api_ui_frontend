import styles from "./style.module.css";
import {useDialog} from "../../../../hooks/useDialog.ts";
import {InfoButton} from "../../../../components/ui/Buttons/Icons/InfoButton/InfoButton.tsx";
import React from "react";


const availableModels = new Map([
    ["gpt-3.5-turbo", {modelName: "GPT-3.5-TURBO", priceTag: "💰", contextSize: "16K", speed: "⚡⚡⚡", quality: "Medium"}],
    ["gpt-4-turbo", {modelName: "GPT-4-TURBO", priceTag: "💰💰", contextSize: "128K", speed: "⚡⚡", quality: "Very good"}],
    ["gpt-4", {modelName: "GPT-4", priceTag: "💰💰💰", contextSize: "8K", speed: "⚡", quality: "Best"}],
    ["gpt-4o", {modelName: "GPT-4o", priceTag: "💰", contextSize: "128K", speed: "⚡⚡⚡", quality: "Very good"}],
]);


type ModelSelectorProps = {
    activeModel?: string;
    modelSwitchHandler?: (newModel: string) => void;
}

export default function ModelSelector({activeModel, modelSwitchHandler}: ModelSelectorProps) {
    const { isOpened, dialogRef, openDialog, closeDialog } = useDialog("popup");
    const [tableVisible, setTableVisible] = React.useState<boolean>(false);

    return (
        <div className={styles.modelSelectorContainer}>
            <div className={styles.modelSelectorPopupTriggerButtonContainer}>
                <button onClick={isOpened ? closeDialog : openDialog}
                        className={styles.modelSelectorPopupTriggerButton}>
                    { activeModel && availableModels.get(activeModel)?.modelName}

                </button>
            </div>
            <dialog ref={dialogRef} className={styles.modelSelectorPopup}>
                <table className={styles.modelInfoTable}>
                    {
                        tableVisible &&
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Price</th>
                                    <th>Speed</th>
                                    <th>Context size</th>
                                    <th>Quality</th>
                                </tr>
                            </thead>
                    }
                    <tbody>
                    {
                        Array(...availableModels.keys()).map((model, index) => (
                            <tr key={index}>
                                <th>
                                    <button key={index} className={styles.modelSelectionButton}
                                            onClick={() => {
                                                modelSwitchHandler && modelSwitchHandler(model);
                                                closeDialog();
                                            }}>
                                        {availableModels.get(model)?.modelName}
                                    </button>
                                </th>
                                {
                                    tableVisible &&
                                        <>
                                            <td className={styles.priceCell}>
                                                {availableModels.get(model)?.priceTag}
                                            </td>
                                            <td className={styles.speedCell}>
                                                {availableModels.get(model)?.speed}
                                            </td>
                                            <td className={styles.contextCell}>
                                                {availableModels.get(model)?.contextSize}
                                            </td>
                                            <td className={styles.qualityCell}>
                                                {availableModels.get(model)?.quality}
                                            </td>
                                        </>
                                }
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
                <InfoButton onClick={() =>
                    setTimeout(() => setTableVisible(prev => !prev), 0) // Avoid popup collapsing
                }/>
            </dialog>
        </div>

    );
}
