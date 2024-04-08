import {useAuth} from "../../../hooks/contextHooks.ts";

export function LoginInfo() {
    const {authState} = useAuth();
    return (
        <div>
            <p>
                {
                    authState?.user?.username &&
                    `You are logged in as ${authState?.user?.username}`

                }
            </p>
        </div>
    );
}