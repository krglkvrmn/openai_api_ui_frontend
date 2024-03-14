import "./style.css";
import {UserErrors} from "../../../types/types.ts";


export default function FormError({error}: {error: string | undefined | null}) {
    return (
        error && (
            <div className="form-error-container info-panel-container">
                <p className="form-error info-panel">
                    {error}
                </p>
            </div>
        )
    );
}

export function FormErrorsList({errors}: { errors: UserErrors }) {
    return (
        errors.length !== 0 &&
        <ul className="auth-form-validation-errors-list">
            {
                errors.map((error, index) => {
                    return (
                        <li className="auth-form-validation-errors-list-item">
                            <FormError key={index} error={error}/>
                        </li>
                    );
                })
            }
        </ul>
    );
}