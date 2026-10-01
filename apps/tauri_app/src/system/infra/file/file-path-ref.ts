namespace FilePathRef {
    export type Value =
        | {
            kind: "home";
            relativePath: string;
        }
        | {
            kind: "external";
            path: string;
        };

    const normalize = (path: string) => {
        return path.replaceAll("\\", "/").replace(/\/+$/, "");
    };

    const isWindowsPath = (path: string) => {
        return /^[a-zA-Z]:[\\/]/.test(path) || path.includes("\\");
    };

    const joinPath = (base: string, relativePath: string) => {
        const separator = isWindowsPath(base) ? "\\" : "/";
        const normalizedBase = base.replace(/[\\/]+$/, "");
        const normalizedRelative = relativePath.replaceAll(/[\\/]+/g, separator);
        return `${normalizedBase}${separator}${normalizedRelative}`;
    };

    export const createPathRef = (
        filePath: string,
        homeDir: string,
    ): Value => {
        if (homeDir === "") {
            return {
                kind: "external",
                path: filePath,
            };
        }

        const normalizedHome = normalize(homeDir);
        const normalizedFile = normalize(filePath);
        const compareHome = normalizedHome.toLowerCase();
        const compareFile = normalizedFile.toLowerCase();

        if (compareFile.startsWith(`${compareHome}/`)) {
            return {
                kind: "home",
                relativePath: normalizedFile.slice(normalizedHome.length + 1),
            };
        }

        return {
            kind: "external",
            path: filePath,
        };
    };

    export const resolvePath = (
        pathRef: Value,
        homeDir: string,
    ) => {
        switch (pathRef.kind) {
            case "home": {
                if (homeDir === "") return "";
                return joinPath(homeDir, pathRef.relativePath);
            }
            case "external": return pathRef.path;
        }
    };

    export const formatPathRef = (pathRef: Value) => {
        switch (pathRef.kind) {
            case "home": return `%HOME_DIR%\\${pathRef.relativePath.replaceAll("/", "\\")}`;
            case "external": return pathRef.path;
        }
    };
}

export default FilePathRef;
