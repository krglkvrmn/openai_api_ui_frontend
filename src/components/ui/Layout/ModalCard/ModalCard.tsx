import React from "react";
import "./style.css";

export function ModalCard({children}: {children: React.ReactNode}) {
    return (
        <div className="modal-card-wrapper">
            <div className="modal-card">
                {children}
            </div>
        </div>
    );
}