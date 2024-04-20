import React from "react";

export function lazyLoad(imp: Promise<any>, name?: string) {
    return React.lazy(async () => {
        if (name === undefined) {
            return imp;
        }
        return imp.then(module => ({default: module[name]}));
    });
}