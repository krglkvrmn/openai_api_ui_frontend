import { useQuery } from "react-query";
import { APIKeysBackendResponse, getAPIKeys } from "../../services/backend_api";
import { funcClosureOrUndefined } from "../../utils/functional";



type APIKeyRecordPropsType = {
    token: string,
    keyDeleteHandler?: () => void
}

type APIKeysListPropsType = {
    apiKeys: APIKeysBackendResponse[],
    keyDeleteHandler?: (keyId: string) => void
}

function APIKeyRecord({ token, keyDeleteHandler }: APIKeyRecordPropsType) {
    return (
        <div>
            <b>{token}</b>
            <div>
                <button onClick={keyDeleteHandler}>Delete</button>
            </div>
        </div>
    );
}

export function APIKeysList({ apiKeys, keyDeleteHandler }: APIKeysListPropsType) {
    return (
        <div>
            {
                apiKeys.map((keyInfo) => {
                    return <APIKeyRecord key={keyInfo.id} token={keyInfo.key}
                                         keyDeleteHandler={funcClosureOrUndefined(keyDeleteHandler, keyInfo.id)}/>
                })
            }
        </div>
    );
}