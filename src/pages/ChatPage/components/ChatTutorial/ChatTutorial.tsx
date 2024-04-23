import styles from "./style.module.css";
import {MdArrowDownward, MdArrowForward, MdArrowUpward, MdKey, MdOutlineModeEditOutline, MdSend} from "react-icons/md";
import {GoGear} from "react-icons/go";


export function ChatTutorial() {
    return (
        <div className={styles.tutorialContainer}>
            <h2>How to use this app?</h2>
            <div className={styles.tutorialStepsListContainer}>
                <ul className={styles.tutorialStepsList}>
                    <li className={styles.tutorialStepsListItem}>
                        <span>Acquire an <a href="https://platform.openai.com/api-keys"
                                            target="_blank"
                                            className="href">OpenAI API key</a></span>
                    </li>
                    <li className={styles.tutorialStepsListItem}>
                    <span>
                        <MdKey/>
                        &nbsp;
                        <b className={styles.textPc}>Save the key</b>&nbsp;to your account on this site using the form on the top
                        &nbsp;
                        <MdArrowUpward className={styles.arrowUp}/>
                    </span>
                        <br/>
                        Alternatively you can <b className={styles.textPc}>just paste the key</b> and not submit it.
                        In such case your key will not be saved anywhere and the app will work as long as the key stays
                        in the form
                    </li>
                    <li className={styles.tutorialStepsListItem}>
                    <span>
                        <b className={styles.textPc}>Choose an AI model</b> for an assistant. Currently available models are:
                        <b className={styles.textPc}> GPT-3.5-turbo</b> and <b className={styles.textPc}>GPT-4</b>
                    </span>
                    </li>
                    <li className={styles.tutorialStepsListItem}>
                    <span>
                        <b className={styles.textPc}>Enter your prompt</b>&nbsp; in the form below
                        <MdArrowDownward/> and submit it &nbsp;<MdSend className={styles.textPc}/>
                    </span>
                    </li>
                    <li className={styles.tutorialStepsListItem}>
                    <span>
                        You can <span
                        className={styles.textPc}>also configure a set of rules and instructions</span>&nbsp;
                        (chat context) that an assistant should follow. This may improve quality of answers.<br/>
                        All such prompts are saved and you can re-use them from a right sidebar
                        <MdArrowForward/>
                    </span>
                        <br/>
                        <br/>
                        <span>
                        <MdOutlineModeEditOutline/>
                            &nbsp;&mdash;&nbsp;
                            The next prompt will be followed with assistant's reply
                    </span>
                        <br/>
                        <span>
                        <GoGear/>
                            &nbsp;&mdash;&nbsp;
                            The next prompt (<span className={styles.textWc}>first message only</span>)
                        will be used as chat context
                    </span>
                    </li>
                </ul>

            </div>
        </div>
    );
}
