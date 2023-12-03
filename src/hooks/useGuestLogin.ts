import { generate } from "generate-password-browser";
import {v4 as uuidv4} from 'uuid';
import { LoginFormDataType, SignupFormDataType } from "../services/auth";
import { useAuth } from "./useAuth";
import { UserErrors } from "../types";
import { useState } from "react";


type TuseGuestLoginReturn = {
    errors: UserErrors,
    loginAsGuest: () => Promise<void>
}

export function useGuestLogin(): TuseGuestLoginReturn {
    const [errors, setErrors] = useState<string[]>([]);
    const { authDispatchers } = useAuth();
    const { signUp, signIn } = authDispatchers;

    function createGuestUserData(): [string, string] {
        const username = `Guest@${uuidv4()}.private`;
        const password = generate({length: 30, numbers: true, symbols: true, uppercase: true, lowercase: true});
        return [username, password];
    }

    async function loginAsGuest() {
        const [username, password] = createGuestUserData();
        const signUpErrors = await signUp({email: username, password: password, is_guest: true});
        if (signUpErrors.length > 0) {
            setErrors(signUpErrors)
            return;
        }
        const signinErrors = await signIn({username, password});
        setErrors(signinErrors)
    }

    return {errors, loginAsGuest};
}