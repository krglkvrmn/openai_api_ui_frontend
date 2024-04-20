import {useQuery, UseQueryResult} from "react-query";
import {getCurrentUser, UserSchema} from "../../../../../services/auth.ts";
import {ElementOrLoader} from "../../../../../components/ui/Loaders/ElementOrLoader/ElementOrLoader.tsx";
import styles from "./style.module.css";


function useUserInfo(): {userInfoQuery: UseQueryResult<UserSchema>, guestAccountExpirationDate: Date | null } {
    const userInfoQuery = useQuery({
        queryKey: ['user', 'general'],
        queryFn: getCurrentUser
    });
    const guestAccountExpirationDate = userInfoQuery.data ? (
        userInfoQuery.data.is_guest && userInfoQuery.data.lifetime ?
            new Date(userInfoQuery.data.datetime_registered.getTime() + userInfoQuery.data.lifetime * 1000) : null
        ) : null;
    return { userInfoQuery, guestAccountExpirationDate }
}


export function UserInfo() {
    const { userInfoQuery, guestAccountExpirationDate } = useUserInfo();
    return (
        <div className={styles.userInfoContainer}>
            {
                userInfoQuery.isError ? "Error while loading user data" :
                    <ElementOrLoader isLoading={userInfoQuery.isLoading} >
                        {
                            userInfoQuery.isSuccess && userInfoQuery.data !== undefined ? (
                                userInfoQuery.data.is_guest ?
                                    <div className={styles.guestInfoContainer}>
                                        <b className={styles.guestLoginHeader}>You are logged in with a guest account</b>
                                        <p>
                                        This account with all associated chats
                                        and API keys will be automatically deleted at
                                            <b className={styles.guestExpiryDate}>
                                               &nbsp;{guestAccountExpirationDate?.toLocaleString('en-GB')}
                                            </b> or when logging out.
                                        </p>
                                        <p>
                                            If you want to persist your chats and API keys, consider other login options.
                                        </p>
                                    </div> :
                                    <p><b>Email: </b>{userInfoQuery.data.email}</p>
                            ): null
                        }
                    </ElementOrLoader>
            }
        </div>
    );
}