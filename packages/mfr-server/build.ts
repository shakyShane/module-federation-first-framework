import { createDebug } from "./debug";
import ProcessEnv = NodeJS.ProcessEnv;

export { pageWebpack } from "./page-webpack";

const debug = createDebug("build");

/**
 * Running with current cwd/env for now
 */
build(process.cwd(), process.env);

function build(cwd: string, env: ProcessEnv) {
    debug("running in %o", process.cwd());
}
