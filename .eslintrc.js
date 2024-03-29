module.exports = {
    extends: [require.resolve("@vertigis/workflow-sdk/config/.eslintrc")],
    parserOptions: {
        tsconfigRootDir: __dirname,
    },
    plugins: ["prettier"],
    rules: {
        "@typescript-eslint/no-restricted-imports": [
            "error",
            {
                paths: [
                    {
                        name: "@vertigis/workflow",
                        message:
                            "This project should only reference types from @vertigis/workflow.",
                        allowTypeImports: true,
                    },
                ],
            },
        ],
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
            },
        ],
        "no-restricted-imports": "off",
        "no-unused-vars": "off",
        "prettier/prettier": "warn",
    },
};
