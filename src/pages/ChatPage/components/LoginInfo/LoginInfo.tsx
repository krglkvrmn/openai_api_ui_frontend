import {useAuth} from "../../../../hooks/contextHooks.ts";

export function LoginInfo() {
    const {authState} = useAuth();
    return (
        <div>
            <p>
                You are logged in as
                {
                    authState?.user?.username && <b> {authState?.user?.username}</b>
                }
            </p>
        </div>
    );
}