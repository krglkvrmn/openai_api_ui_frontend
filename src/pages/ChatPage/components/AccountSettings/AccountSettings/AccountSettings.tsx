import {UserInfo} from "../UserInfo/UserInfo.tsx";
import {APIKeysController} from "../APIKeys/APIKeysController.tsx";
import styles from "./style.module.css";

export function AccountSettings() {
    return (
        <div className={styles.accountSettingsContainer}>
            <h3>Account information</h3>
            <UserInfo/>
            <h3>Your API keys</h3>
            <APIKeysController/>
        </div>
    );
}