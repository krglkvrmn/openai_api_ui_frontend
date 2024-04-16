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
    return (
        <div className={styles.switchPromptButtonContainer}>
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
