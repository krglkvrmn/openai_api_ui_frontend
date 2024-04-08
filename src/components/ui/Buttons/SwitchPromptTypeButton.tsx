import styles from "./style.module.css";
import {PromptType} from "../../../types/types.ts";
import {IconButton} from "./IconButton.tsx";
import {GoGear} from "react-icons/go";
import {funcClosureOrUndefined} from "../../../utils/functional.ts";
import {MdOutlineModeEditOutline} from "react-icons/md";


export function SwitchPromptTypeButton(
    {activePromptType, activePromptTypeSetter}:
    {activePromptType: PromptType, activePromptTypeSetter?: (promptType: PromptType) => void})
{
    return (
        <div className={styles.switchPromptButtonContainer}>
            {
                activePromptType === "user" &&
                <IconButton Icon={MdOutlineModeEditOutline} mode="dark" onClick={funcClosureOrUndefined(activePromptTypeSetter, "system")}/>
            }
            {
                activePromptType === "system" &&
                <IconButton Icon={GoGear} mode="dark" onClick={funcClosureOrUndefined(activePromptTypeSetter,"user")}/>
            }
        </div>
    );
}
