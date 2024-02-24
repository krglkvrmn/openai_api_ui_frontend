import React from "react";

export default function PromptFooter({children}: {children: React.ReactNode}) {
    return (
        <div id="prompt-footer">
            {children}
        </div>
    )
}