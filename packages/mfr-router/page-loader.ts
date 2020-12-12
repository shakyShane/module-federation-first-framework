import { MatchData, Resolver } from "./router";
import { loadFromRemote } from "./loader/load-from-remote";
import matchPath from "./match-path";

export const pageLoader: Resolver = async function pageLoader({
    location,
    depth,
    parents,
    segs,
}) {
    await new Promise((res) => setTimeout(res, 500));
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
    let nextUrl = "" + matchingSeg.key;
    if (!nextUrl.endsWith("index")) {
        const segs = nextUrl.split("/");
        const lastSeg = segs[segs.length - 1];
        if (lastSeg[0] !== "$") {
            nextUrl += "/index";
        }
    }
    let slugPrefix = "app_pages_";
    let nextSlug = slugPrefix + nextUrl.replace(/\//g, "_");
    const o = await loadFromRemote({
        remote: {
            url: `/pages/${nextUrl}.js`,
            name: nextSlug,
        },
    });
    return {
        component: (await o()).default,
        query: {},
        params: matchingData.params,
    };
};
