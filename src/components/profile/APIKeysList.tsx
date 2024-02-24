import { funcClosureOrUndefined } from "../../utils/functional";
import {APIKeyRead} from "../../types/dataTypes";



type APIKeyRecordPropsType = {
    token: string,
    keyDeleteHandler?: () => void
}

type APIKeysListPropsType = {
    apiKeys: APIKeyRead[],
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