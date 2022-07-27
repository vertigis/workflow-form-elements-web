module.exports = {
    extends: [require.resolve("@vertigis/workflow-sdk/config/.eslintrc")],
    parserOptions: {
        tsconfigRootDir: __dirname,
    },
    plugins: ["prettier"],
    rules: {
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
            },
        ],
        "no-unused-vars": "off",
        "prettier/prettier": "warn",
    },
};
