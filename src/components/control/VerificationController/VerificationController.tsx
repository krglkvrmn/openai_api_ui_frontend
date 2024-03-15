import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import {useCountdown} from "../../../hooks/useCountdown.ts";
import {useEffect, useState} from "react";
import {useAuth} from "../../../hooks/contextHooks.ts";
import {Link, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {RequireAuth} from "../RequireAuth.tsx";
import {RequireNoVerification} from "../RequireVerification.tsx";
import styles from "./style.module.css";

import {GenericButton} from "../../ui/Buttons/GenericButton.tsx";
import {Spinner} from "../../ui/Indicators/Spinner.tsx";


function VerificationRequestAction(
    {requestVerificationHandler}:
        { requestVerificationHandler: () => Promise<void> }
) {
    const [nextRequestTime, setNextRequestTime] = useLocalStorage('__nrt', 0);
    const {count, startCountdown, resetCountdown, isFinished} = useCountdown();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function onRequestVerification(): Promise<void> {
        setIsLoading(true)
        await requestVerificationHandler();
        setNextRequestTime(new Date().getTime() + 60000);
        setIsLoading(false)
    }

    useEffect(() => {
        const diff = Math.floor((nextRequestTime - new Date().getTime()) / 1000);
        startCountdown(diff, 1);
        return resetCountdown;
    }, [nextRequestTime]);

    return (
        isFinished.value ?
            <GenericButton onClick={onRequestVerification} replaceWithLoader={isLoading}>Continue</GenericButton> :
            <>
                <p>An email with verification instructions was sent to this email</p>
                <p>Wait for <b>{count}</b> seconds until next request</p>
            </>
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
                    <>
                        <h2>You were successfully registered</h2>
                        <p>Now, you need to verify your email address</p>
                    </> :
                    <h2>You must verify your email to see this page</h2>
            }
            {
                isAuthenticated && authState.user !== undefined && authState.user.email ?
                    (
                        <>
                            <p><b>Your email:</b> {authState.user.email}</p>
                            <VerificationRequestAction requestVerificationHandler={requestVerification}/>
                            {
                                verificationError && <p className={styles.verificationError}>{verificationError}</p>
                            }
                        </>
                    ) :
                    <p>You are not logged in. <Link to='/login'>Log in</Link> to validate your email</p>
            }
        </>
    );
}

function VerificationTokenController({verificationToken}: { verificationToken: string }) {
    const navigate = useNavigate();
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
                    <p className={styles.verificationConfirmation}>Verification successful, you can close this page</p> :
                    <>
                        <p className={styles.verificationError}>{verificationError}</p>
                        <GenericButton onClick={() => navigate('/verification')}>Continue</GenericButton>
                    </>
            ) :
            <div className={styles.verificationInfoBlock}>
                <p>Verifying your email...</p>
                <Spinner/>
            </div>
)
    ;
}

export function VerificationController() {
    const [searchParams] = useSearchParams();
    const verificationToken = searchParams.get('vt');

    return (
        <div className={styles.verificationContainer}>
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