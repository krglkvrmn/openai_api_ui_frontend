import { useRef } from "react";


export function useOneTimeMemo<T>(factory: () => T, deps: unknown[]): T {
    const cacheRef = useRef<Map<unknown, T>>(new Map());
    const depsKey = JSON.stringify(deps);
    if (!cacheRef.current.has(depsKey)) {
        cacheRef.current.set(depsKey, factory());
    }
    return cacheRef.current.get(depsKey) as T;
}
