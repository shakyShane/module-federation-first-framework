import debugPkg from "debug";
export function createDebug(name: string): debugPkg.Debugger {
    return debugPkg(`mff:${name}[debug]`);
}
export function createTrace(name: string): debugPkg.Debugger {
    return debugPkg(`mff:${name}[trace]`);
}
