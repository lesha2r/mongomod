module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "plugins": ["jsdoc"],
    "extends": [
        "eslint:recommended",
        "google",
        "plugin:jsdoc/recommended-typescript-flavor",
    ],
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 12
    },
    "rules": {
        "indent": ["error", 4],
        "semi": ["error", "always"]
    }
};