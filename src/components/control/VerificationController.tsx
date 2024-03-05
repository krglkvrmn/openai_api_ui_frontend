import {useLocalStorage} from "../../hooks/useLocalStorage.ts";
import {useCountdown} from "../../hooks/useCountdown.ts";
import {useEffect, useState} from "react";
import {useAuth} from "../../hooks/contextHooks.ts";
import {Link, useLocation, useSearchParams} from "react-router-dom";
import {RequireAuth} from "./RequireAuth.tsx";
import {RequireNoVerification} from "./RequireVerification.tsx";

function VerificationRequestAction(
    {requestVerificationHandler}:
        { requestVerificationHandler: () => Promise<void> }
) {
    const [nextRequestTime, setNextRequestTime] = useLocalStorage('__nrt', 0);
    const {count, startCountdown, resetCountdown, isFinished} = useCountdown();

    async function onRequestVerification(): Promise<void> {
        await requestVerificationHandler();
        setNextRequestTime(new Date().getTime() + 60000);
    }

    useEffect(() => {
        const diff = Math.floor((nextRequestTime - new Date().getTime()) / 1000);
        startCountdown(diff, 1);
        return resetCountdown;
    }, [nextRequestTime]);

    return (
        isFinished.value ?
            <button onClick={onRequestVerification}>Click here to send verification link to this email</button> :
            <p>Wait for {count} seconds until next request</p>
    );
}

function VerificationRequestController() {
    const {isAuthenticated, authState, authDispatchers, verificationError} = useAuth();
    const {requestVerification} = authDispatchers;
    const location = useLocation();

    return (
        <>
            {
                location.state === 'just_registered' ?
                    <p>You were successfully registered, please verify your email address</p> :
                    <p>You must verify your email to see this page</p>
            }
            {
                isAuthenticated && authState.user !== undefined && authState.user.email ?
                    (
                        <>
                            <p>Your email: {authState.user.email}</p>
                            <VerificationRequestAction requestVerificationHandler={requestVerification}/>
                            {verificationError}
                        </>
                    ) :
                    <p>You are not logged in. <Link to='/login'>Log in</Link> to validate your email</p>
            }
        </>
    );
}

function VerificationTokenController({verificationToken}: { verificationToken: string }) {
    const {authDispatchers, verificationError} = useAuth();
    const {verify} = authDispatchers;
    const [verificationFinished, setVerificationFinished] = useState<boolean>(false);

    useEffect(() => {
        if (verificationToken !== null && !verificationFinished) {
            verify(verificationToken).finally(() => setVerificationFinished(true));
        }
    }, []);

    return (
        verificationFinished ?
            (
                verificationError === null ?
                    <p>Verification successful, you can close this page</p> :
                    verificationError
            ) :
            <p>Verifying...</p>
    );
}

export function VerificationController() {
    const [searchParams] = useSearchParams();
    const verificationToken = searchParams.get('vt');

    return (
        <div>
            {
                verificationToken === null ?
                    <RequireAuth>
                        <RequireNoVerification>
                            <VerificationRequestController/>
                        </RequireNoVerification>
                    </RequireAuth> :
                    <VerificationTokenController verificationToken={verificationToken}/>
            }
        </div>
    );
}