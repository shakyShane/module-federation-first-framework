import { MatchData, Resolver } from "./router";
import { loadFromRemote } from "./loader/load-from-remote";
import matchPath from "./match-path";

export const pageLoader: Resolver = async function pageLoader({
    location,
    depth,
    parents,
    segs,
}) {
    const psegs = ["/", ...location.pathname.slice(1).split("/")].filter(
        Boolean
    );
    const curr = location.pathname === "/" ? "/" : psegs[depth + 1];
    let matchingSeg: any;
    let matchingData: MatchData | null = null;

    let earlyMatch = segs.find((seg) => {
        return seg.as === curr;
    });

    if (earlyMatch) {
        matchingSeg = earlyMatch;
        matchingData = matchPath(location.pathname, {
            path: location.pathname,
        });
    }

    const prefix = "app_pages_";

    if (!matchingSeg) {
        segs.forEach((seg, i) => {
            if (matchingSeg) return;

            if (seg.as === "/" && location.pathname === "/") {
                matchingSeg = seg;
                matchingData = matchPath(location.pathname, {
                    path: "/",
                    exact: true,
                });
            }
            const asPath = "/" + parents.concat(seg.as).join("/");
            const match = matchPath(location.pathname, {
                path: asPath,
                exact: true,
            });
            if (match) {
                matchingSeg = seg;
                matchingData = match;
            }
        });
    }

    if (!matchingSeg || !matchingData) {
        return {
            component: null,
            query: {},
            params: {},
        };
    }
    const next = prefix + matchingSeg.key;
    const o = await loadFromRemote({
        remote: {
            url: `/pages/${next}.js`,
            name: next,
        },
    });
    return {
        component: (await o()).default,
        query: {},
        params: matchingData.params,
    };
};
