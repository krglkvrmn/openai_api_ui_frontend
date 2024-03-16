import {useAuth} from "../../../hooks/contextHooks.ts";
import {Link} from "react-router-dom";
import {LogoutButton} from "../../ui/Buttons/LogoutButton.tsx";
import styles from "./style.module.css";
import globalStyles from "../../../styles/global-styles.module.css";

export function NavBar() {
    const {authDispatchers} = useAuth();
    const {logOut} = authDispatchers;
    return (
        <div className={styles.navBar}>
            <ul>
                <li><Link className={globalStyles.navLink} to="/">Home</Link></li>
                <li><Link className={globalStyles.navLink} to="/chat">ChatGPT</Link></li>
                <li><Link className={globalStyles.navLink} to="/profile">Profile</Link></li>
                <li>
                    <LogoutButton onClick={logOut}/>
                </li>
            </ul>
        </div>
    );
}