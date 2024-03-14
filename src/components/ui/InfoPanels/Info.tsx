export function FormInfo({infoMessage}: {infoMessage: string | null | undefined}) {
    return (
        infoMessage && (
            <div className="form-info-container info-panel-container">
                <p className="form-info info-panel">
                    {infoMessage}
                </p>
            </div>
        )
    );
}