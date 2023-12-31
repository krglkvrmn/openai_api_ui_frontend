import { generate } from "generate-password-browser";
import {v4 as uuidv4} from 'uuid';
import { LoginFormDataType, SignupFormDataType } from "../services/auth";
import { useAuth } from "./contextHooks";
import { UserErrors } from "../types";
import { useState } from "react";


type TuseGuestLoginReturn = {
    error: string | null;
    loginAsGuest: () => Promise<void>
}

export function useGuestLogin(): TuseGuestLoginReturn {
    const { authDispatchers, logInError, signUpError } = useAuth();
    const { signUp, logIn } = authDispatchers;

    function createGuestUserData(): [string, string] {
        const username = `Guest@${uuidv4()}.private`;
        const password = generate({length: 30, numbers: true, symbols: true, uppercase: true, lowercase: true});
        return [username, password];
    }

    async function loginAsGuest() {
        const [username, password] = createGuestUserData();
        await signUp({email: username, password: password, is_guest: true});
        await logIn({username, password});
    }

    const error = logInError || signUpError ? "Error occured while logging as a guest" : null;
    return {error, loginAsGuest};
}