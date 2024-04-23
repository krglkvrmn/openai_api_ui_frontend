import {ModalCard} from "../../components/layout/ModalCard/ModalCard.tsx";
import {VerificationController} from "./VerificationController.tsx";
import {AuthFormNavigator} from "../../components/layout/AuthFormNavigator/AuthFormNavigator.tsx";
import styles from "./style.module.css";
import globalStyles from "../../styles/global-styles.module.css";
import {useAuth} from "../../hooks/contextHooks.ts";
import {ElementOrLoader} from "../../components/ui/Loaders/ElementOrLoader/ElementOrLoader.tsx";


export function VerificationPage() {
    const {dispatchersStatuses, authDispatchers} = useAuth();
    const isLoggingOut = dispatchersStatuses.logOut === "loading";
    return (
        <ModalCard showBorder>
            <VerificationController />
            {isLoggingOut && <div className={styles.spacer}></div>}
            <ElementOrLoader isLoading={isLoggingOut}>
                    <AuthFormNavigator>
                        <span className={`${styles.logoutLink} ${globalStyles.navLink}`}
                              onClick={authDispatchers.logOut}>Log out</span>
                    </AuthFormNavigator>
                </ElementOrLoader>
        </ModalCard>
    );
}