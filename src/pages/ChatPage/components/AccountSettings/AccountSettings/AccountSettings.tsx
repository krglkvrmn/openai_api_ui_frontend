import {UserInfo} from "../UserInfo/UserInfo.tsx";
import {APIKeysController} from "../APIKeys/APIKeysController.tsx";

export function AccountSettings() {
    return (
        <div>
            <h2>Account information</h2>
            <UserInfo/>
            <h2>Your API keys</h2>
            <APIKeysController/>
        </div>
    );
}