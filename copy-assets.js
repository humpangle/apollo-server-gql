const shell = require("shelljs");

/**
 * Copy .graphql files
 */
shell.cp("-R", "src/graphql", "build/graphql");
