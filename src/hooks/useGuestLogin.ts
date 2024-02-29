import { generate } from "generate-password-browser";
import {v4 as uuidv4} from 'uuid';
import { useAuth } from "./contextHooks";
import {useState} from "react";


type TuseGuestLoginReturn = {
    error: string | null;
    loginAsGuest: () => Promise<void>
}

export function useGuestLogin(): TuseGuestLoginReturn {
    const [guestLoginError, setGuestLoginError] = useState<string | null>(null);
    const { authDispatchers } = useAuth();
    const { signUp, logIn } = authDispatchers;

    function createGuestUserData(): [string, string] {
        const username = `Guest@${uuidv4()}.guest`;
        const password = generate({length: 30, numbers: true, symbols: true, uppercase: true, lowercase: true});
        return [username, password];
    }

    async function loginAsGuest(): Promise<void> {
        const [username, password] = createGuestUserData();
        try {
            await signUp({email: username, password: password, is_guest: true});
            await logIn({username, password});
        } catch (error) {
            setGuestLoginError("An error occurred while logging as a guest");
        }
    }

    return {error: guestLoginError, loginAsGuest};
}