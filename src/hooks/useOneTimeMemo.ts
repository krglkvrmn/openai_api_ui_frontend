import { useRef } from "react";



export function useOneTimeMemo<T>(factory: () => T, deps: any[]): T {
    const cacheRef = useRef<Map<any, T>>(new Map());
    const depsKey = JSON.stringify(deps);
    if (!cacheRef.current.has(depsKey)) {
        cacheRef.current.set(depsKey, factory());
    }
    return cacheRef.current.get(depsKey) as T;
}
