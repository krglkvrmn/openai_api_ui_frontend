import {useAuth} from "../../../../hooks/contextHooks.ts";
import {Link, useLocation} from "react-router-dom";
import {useLocalStorage} from "../../../../hooks/useLocalStorage.ts";
import {useCountdown} from "../../../../hooks/useCountdown.ts";
import {useEffect, useState} from "react";
import {ElementOrLoader} from "../../../../components/ui/Loaders/ElementOrLoader/ElementOrLoader.tsx";
import {GenericButton} from "../../../../components/ui/Buttons/Generic/GenericButton/GenericButton.tsx";
import {FormInfo} from "../../../../components/ui/InfoDisplay/Info/Info.tsx";
import styles from "./style.module.css";
import {parseVerificationRequestError} from "../../../../utils/errorsParsers.ts";
import FormError from "../../../../components/ui/InfoDisplay/Errors/Errors.tsx";
import {AuthFormNavigator} from "../../../../components/layout/AuthFormNavigator/AuthFormNavigator.tsx";
import globalStyles from "../../../../styles/global-styles.module.css";


function VerificationRequestAction(
    { requestVerification }:
    { requestVerification: () => Promise<void> }
) {
    const [verificationRequestError, setVerificationRequestError] = useState<string | null>(null);
    const [nextRequestTime, setNextRequestTime] = useLocalStorage('__nrt', 0);
    const {count, startCountdown, resetCountdown, isFinished} = useCountdown();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function onRequestVerification(): Promise<void> {
        setIsLoading(true);
        setVerificationRequestError(null);
        try {
            await requestVerification();
            setNextRequestTime(new Date().getTime() + 60000);
        } catch (error) {
            setVerificationRequestError(parseVerificationRequestError(error));
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const diff = Math.floor((nextRequestTime - new Date().getTime()) / 1000);
        if (diff > 0) {
            startCountdown(diff, 1);
        }
        return resetCountdown;
    }, [nextRequestTime]);

    return (
        isFinished.value ?
            <ElementOrLoader isLoading={isLoading}>
                <GenericButton onClick={onRequestVerification}>Continue</GenericButton>
                <FormError error={verificationRequestError} />
            </ElementOrLoader> :
            <>
                <FormInfo infoMessage="An email with verification instructions was sent to this email"/>
                <p className={styles.counterText}>Wait for <b>{count}</b> seconds until next request</p>
            </>
    );
}


export function RequestController() {
    const {isAuthenticated, authState, authDispatchers, verificationError, dispatchersStatuses} = useAuth();
    const {requestVerification, logOut} = authDispatchers;
    const isLoggingOut = dispatchersStatuses.logOut === "loading";
    const location = useLocation();

    return (
        <div className={styles.verificationRequestControllerContainer}>
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
                            <br />
                            <VerificationRequestAction requestVerification={requestVerification}/>
                            {
                                verificationError && <p className={styles.verificationError}>{verificationError}</p>
                            }
                        </>
                    ) :
                    <p>You are not logged in. <Link to='/login'>Log in</Link> to validate your email</p>
            }
            {isLoggingOut && <div className={styles.spacer}></div>}
            <ElementOrLoader isLoading={isLoggingOut}>
                <AuthFormNavigator>
                    <span className={`${styles.logoutLink} ${globalStyles.navLink}`}
                          onClick={logOut}>Log out</span>
                </AuthFormNavigator>
            </ElementOrLoader>
        </div>
    );
}
