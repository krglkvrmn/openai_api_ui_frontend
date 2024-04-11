import {useSearchParams} from "react-router-dom";
import {RequireAuth} from "../../components/hoc/RequireAuth.tsx";
import {RequireNoVerification} from "../../components/hoc/RequireVerification.tsx";
import {TokenController} from "./components/TokenController/TokenController.tsx";
import {RequestController} from "./components/RequestController/RequestController.tsx";
import styles from "./style.module.css";

export function VerificationController() {
    const [searchParams] = useSearchParams();
    const verificationToken = searchParams.get('vt');

    return (
        <div className={styles.verificationContainer}>
            {
                verificationToken === null ?
                    <RequireAuth>
                        <RequireNoVerification>
                            <RequestController/>
                        </RequireNoVerification>
                    </RequireAuth> :
                    <TokenController verificationToken={verificationToken}/>
            }
        </div>
    );
}