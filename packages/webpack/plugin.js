module.exports = function (babel) {
    const t = babel.types;
    function transformImportDeclaration(path) {
        const importSpecifierPaths = path.get("specifiers");
        for (const importSpecifierPath of importSpecifierPaths) {
            const node = importSpecifierPath.node;
            if (
                node &&
                node.imported &&
                node.imported.name === "RouterProvider"
            ) {
                // importSpecifierPath.replaceWith(
                //     t.importSpecifier(
                //         path.scope.generateUidIdentifier(node.imported.name),
                //         t.clone(node.imported)
                //     )
                // );
            }
        }
    }
    return {
        visitor: {
            Program(programPath) {
                const declarations = programPath.get("body").filter((path) => {
                    return t.isImportDeclaration(path);
                });
                declarations.forEach(transformImportDeclaration);
            },
        },
    };
};
