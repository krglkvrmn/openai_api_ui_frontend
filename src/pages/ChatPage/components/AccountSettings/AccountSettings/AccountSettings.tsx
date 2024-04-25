import styles from "./style.module.css";
import {lazyLoad} from "../../../../../utils/lazyLoading.ts";
import {ComponentLoadSuspense} from "../../../../../components/hoc/ComponentLoadSuspense.tsx";


const UserInfo = lazyLoad(import('../UserInfo/UserInfo.tsx'), 'UserInfo');
const APIKeysController = lazyLoad(import('../APIKeys/APIKeysController.tsx'), 'APIKeysController');

export function AccountSettings() {
    return (
        <div className={styles.accountSettingsContainer}>
            <h3>Account information</h3>
            <ComponentLoadSuspense width="100%" height="100%">
                <UserInfo/>
            </ComponentLoadSuspense>
            <h3>Your API keys</h3>
            <ComponentLoadSuspense width="100%" height="100%">
                <APIKeysController/>
            </ComponentLoadSuspense>
        </div>
    );
}