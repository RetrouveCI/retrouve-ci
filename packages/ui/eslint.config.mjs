import { config } from "@retrouve-ci/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    rules: {
      // TypeScript already enforces prop types — PropTypes are redundant in this package
      "react/prop-types": "off",
    },
  },
];
