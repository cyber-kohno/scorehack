// Node's built-in test runner, with the already-installed TypeScript compiler.
// Production namespaces require transpilation, not Node's strip-types mode.
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier.startsWith(".") && context.parentURL) {
            const url = new URL(specifier + ".ts", context.parentURL);
            if (existsSync(fileURLToPath(url))) return nextResolve(url.href, context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (url.endsWith(".ts")) return { format: "module", shortCircuit: true,
            source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
                compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
            }).outputText };
        return nextLoad(url, context);
    },
});
