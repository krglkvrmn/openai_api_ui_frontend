import { APIKeysController } from "../../components/profile/APIKeysController";
import { UserInfo } from "../../components/profile/UserInfo"

export function ProfilePage() {
    return (
        <div>
            <h2>Main info</h2>
            <UserInfo />
            <h2>API keys</h2>
            <APIKeysController />
        </div>
    );
}