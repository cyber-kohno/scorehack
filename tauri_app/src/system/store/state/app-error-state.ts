namespace AppErrorState {
    export type Value = {
        message: string;
        stack?: string;
        source: "error" | "unhandledrejection";
        occurredAt: string;
    };

    const getErrorMessage = (error: unknown) => {
        if (error instanceof Error) return error.message;
        if (typeof error === "string") return error;
        return "Unknown application error.";
    };

    const getErrorStack = (error: unknown) => {
        if (error instanceof Error) return error.stack;
        return undefined;
    };

    export const fromErrorEvent = (event: ErrorEvent): Value => {
        const error = event.error;
        return {
            message: event.message || getErrorMessage(error),
            stack: getErrorStack(error),
            source: "error",
            occurredAt: new Date().toISOString(),
        };
    };

    export const fromUnhandledRejection = (event: PromiseRejectionEvent): Value => {
        const reason = event.reason;
        return {
            message: getErrorMessage(reason),
            stack: getErrorStack(reason),
            source: "unhandledrejection",
            occurredAt: new Date().toISOString(),
        };
    };

    export const format = (error: Value) => {
        return [
            `source: ${error.source}`,
            `time: ${error.occurredAt}`,
            `message: ${error.message}`,
            error.stack == undefined ? "" : `stack:\n${error.stack}`,
        ].filter((line) => line.length > 0).join("\n");
    };
}

export default AppErrorState;
