import { useQuery } from "react-query";
import { getCurrentUser } from "../../services/auth";

function useUserInfo() {
    const userQuery = useQuery({
        queryKey: ['user', 'general'],
        queryFn: getCurrentUser
    });
    return userQuery;
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
                    <p>Email: {userInfoQuery.data.email}</p>
                    <p>Verified: {userInfoQuery.data.is_verified}</p>
                    <p>Superuser: {userInfoQuery.data.is_superuser}</p>
                </>
                : null
            }
        </div>
    );
}