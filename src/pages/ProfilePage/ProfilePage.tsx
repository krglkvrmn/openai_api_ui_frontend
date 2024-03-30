import { APIKeysController } from "../../components/profile/APIKeys/APIKeysController.tsx";
import { UserInfo } from "../../components/profile/UserInfo";
import styles from "./style.module.css";
import {ResetPasswordForm} from "../../components/forms/ResetPasswordForm/ResetPasswordForm.tsx";


export function ProfilePage() {
    return (
        <div className={styles.profilePageWrapper}>
            <div className={styles.profilePageContent}>
                <h2>Account information</h2>
                <UserInfo/>
                <button>Reset password</button>
                <ResetPasswordForm token="" ></ResetPasswordForm>
                <h2>Your API keys</h2>
                <APIKeysController/>
            </div>
        </div>
    );
}