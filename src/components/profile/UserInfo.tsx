import {useQuery, UseQueryResult} from "react-query";
import {getCurrentUser, UserSchema} from "../../services/auth";

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
                userInfoQuery.isLoading ? "Loading user data" :
                userInfoQuery.isSuccess && userInfoQuery.data !== undefined ?
                <>
                    {
                        userInfoQuery.data.is_guest ?
                            <p>You are logged in as a guest</p> :
                            <p>Email: {userInfoQuery.data.email}</p>
                    }
                </>
                : null
            }
        </div>
    );
}