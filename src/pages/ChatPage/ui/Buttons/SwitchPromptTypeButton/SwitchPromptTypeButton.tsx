import styles from "./style.module.css";
import {PromptType} from "../../../../../types/types.ts";
import {IconButton} from "../../../../../components/ui/Buttons/Icons/IconButton/IconButton.tsx";
import {GoGear} from "react-icons/go";
import {funcClosureOrUndefined} from "../../../../../utils/functional.ts";
import {MdOutlineModeEditOutline} from "react-icons/md";


export function SwitchPromptTypeButton(
    {activePromptType, activePromptTypeSetter}:
    {activePromptType: PromptType, activePromptTypeSetter?: (promptType: PromptType) => void})
{
    let tooltip: string;
    switch (activePromptType) {
        case "user":
            tooltip = "Switch to writing a chat context"; break;
        case "system":
            tooltip = "Switch to writing normal prompts"; break;
        default:
            throw new Error("Unknown prompt type")
    }
    return (
        <div className={styles.switchPromptButtonContainer}
             data-prompt-type={activePromptType}
             data-tooltip={tooltip}
             data-tooltip-direction="top" >
            {
                activePromptType === "user" &&
                <IconButton Icon={MdOutlineModeEditOutline} onClick={funcClosureOrUndefined(activePromptTypeSetter, "system")}/>
            }
            {
                activePromptType === "system" &&
                <IconButton Icon={GoGear} onClick={funcClosureOrUndefined(activePromptTypeSetter,"user")}/>
            }
        </div>
    );
}
