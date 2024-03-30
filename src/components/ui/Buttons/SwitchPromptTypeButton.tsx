import styles from "./style.module.css";
import {PromptType} from "../../../types/types.ts";
import {IconButton} from "./IconButton.tsx";
import {GoGear} from "react-icons/go";
import {TfiWrite} from "react-icons/tfi";
import {funcClosureOrUndefined} from "../../../utils/functional.ts";


export function SwitchPromptTypeButton(
    {activePromptType, activePromptTypeSetter}:
    {activePromptType: PromptType, activePromptTypeSetter?: (promptType: PromptType) => void})
{
    return (
        <div className={styles.switchPromptButtonContainer}>
            {
                activePromptType === "user" &&
                <IconButton Icon={TfiWrite} mode="dark" onClick={funcClosureOrUndefined(activePromptTypeSetter, "system")}/>
            }
            {
                activePromptType === "system" &&
                <IconButton Icon={GoGear} mode="dark" onClick={funcClosureOrUndefined(activePromptTypeSetter,"user")}/>
            }
        </div>
    );
}
