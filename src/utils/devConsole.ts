export const devConsole = {
    info: (message?: any, ...optionalParams: any[]) => import.meta.env.DEV && console.info(message, ...optionalParams),
    error: (message?: any, ...optionalParams: any[]) => import.meta.env.DEV && console.error(message, ...optionalParams),
    debug: (message?: any, ...optionalParams: any[]) => import.meta.env.DEV && console.debug(message, ...optionalParams),
    warn: (message?: any, ...optionalParams: any[]) => import.meta.env.DEV && console.warn(message, ...optionalParams),
    log: (message?: any, ...optionalParams: any[]) => import.meta.env.DEV && console.log(message, ...optionalParams),
}