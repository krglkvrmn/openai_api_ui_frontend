import "./style.css";


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