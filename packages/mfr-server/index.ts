import express from "express";
import ProcessEnv = NodeJS.ProcessEnv;
const CWD = process.cwd();
console.log(CWD);
console.log(Object.keys(express));

function init(env: ProcessEnv) {
    const app = express();
    app.listen(8080, (e, other) => {
        console.log("listening on http://localhost:8080");
    });
}

if (!require.main) {
    init(process.env);
}
