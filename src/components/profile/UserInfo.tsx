import {useQuery, UseQueryResult} from "react-query";
import {getCurrentUser, UserSchema} from "../../services/auth";
import {ElementOrLoader} from "../ui/Buttons/ElementOrLoader.tsx";

function useUserInfo(): UseQueryResult<UserSchema> {
    return useQuery({
        queryKey: ['user', 'general'],
        queryFn: getCurrentUser
    });
}

export function UserInfo() {
    const userInfoQuery = useUserInfo();
    return (
        <div>
            {
                userInfoQuery.isError ? "Error while loading user data" :
                    <ElementOrLoader isLoading={userInfoQuery.isLoading} >
                        {
                            userInfoQuery.isSuccess && userInfoQuery.data !== undefined ?
                            <>
                                {
                                    userInfoQuery.data.is_guest ?
                                        <p>You are logged in as a guest</p> :
                                        <p><b>Email: </b>{userInfoQuery.data.email}</p>
                                }
                            </>
                            : null
                        }
                    </ElementOrLoader>
            }
        </div>
    );
}