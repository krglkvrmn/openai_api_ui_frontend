import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../../hooks/contextHooks.ts";
import {useEffect, useState} from "react";
import {GenericButton} from "../../../../components/ui/Buttons/Generic/GenericButton/GenericButton.tsx";
import {Spinner} from "../../../../components/ui/Loaders/Spinner/Spinner.tsx";
import styles from "./style.module.css";

export function TokenController({verificationToken}: { verificationToken: string }) {
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
                    <p className={styles.verificationConfirmation}>Verification successful, you can close this
                        page</p> :
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