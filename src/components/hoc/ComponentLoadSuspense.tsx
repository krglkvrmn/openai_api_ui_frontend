import React, {Suspense} from "react";
import {Spinner} from "../ui/Loaders/Spinner/Spinner.tsx";

export function ComponentLoadSuspense(
    {children, width = "100dvw", height = "100dvh"}:
    { children: React.ReactNode, width?: string | number, height?: string | number }
) {
    return (
        <Suspense fallback={
            <div style={{width: width, height: height}}>
                <Spinner/>
            </div>
        }>
            {children}
        </Suspense>
    );
}