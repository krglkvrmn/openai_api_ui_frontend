import React, {MouseEventHandler} from "react";
import "./style.css"
import {Spinner} from "../../ui/Indicators/Spinner.tsx";

export function FormSubmitButton({children, replaceWithLoader = false}: { children: React.ReactNode, replaceWithLoader?: boolean }) {
    return (
        <div className="button-container form-submit-button-container">
        {
            replaceWithLoader ?
                <Spinner /> :
                <button className="form-submit-button" type="submit">{children}</button>
        }
        </div>
    );
}

export function GuestLoginButton({onClick, replaceWithLoader = false}: { onClick: MouseEventHandler, replaceWithLoader?: boolean }) {
    return (
        <div className="button-container guest-login-button-container">
        {
            replaceWithLoader ?
                <Spinner /> :
                <button className="guest-login-button" onClick={onClick}>Continue as guest</button>

        }
        </div>
    );
}