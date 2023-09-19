export function funcClosureOrUndefined(func: CallableFunction | undefined, ...args: any[]) {
    return func === undefined ? undefined : () => func(...args);
}