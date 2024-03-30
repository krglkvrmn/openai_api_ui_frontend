import { funcClosureOrUndefined } from "../../../utils/functional.ts";
import {APIKeyRead} from "../../../types/dataTypes.ts";
import styles from "./style.module.css";
import {DeleteButton} from "../../ui/Buttons/DeleteButton.tsx";


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
        <div className={styles.apiKeyRecordContainer}>
            <b className={styles.apiLeyRecordRepr}>{token}</b>
            <DeleteButton onClick={keyDeleteHandler} mode="dark" />
        </div>
    );
}

export function APIKeysList({ apiKeys, keyDeleteHandler }: APIKeysListPropsType) {
    return (
        <div className={styles.apiKeysList}>
            {
                apiKeys.map((keyInfo) => {
                    return <APIKeyRecord key={keyInfo.id} token={keyInfo.key}
                                         keyDeleteHandler={funcClosureOrUndefined(keyDeleteHandler, keyInfo.id)}/>
                })
            }
        </div>
    );
}