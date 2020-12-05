import { Resolver } from "./router";
import { loadFromRemote } from "./loader/load-from-remote";

export const pageLoader: Resolver = async function pageLoader(
    location,
    depth,
    parents,
    segs
) {
    // console.log('HERE!');
    const psegs = ["/", ...location.pathname.slice(1).split("/")].filter(
        Boolean
    );
    const curr = location.pathname === "/" ? "/" : psegs[depth + 1];
    // const pathname = location.pathname;
    const prefix = "app_pages_";
    const match = segs.find((seg) => {
        return seg.as === curr;
    });
    if (!match) {
        return {
            component: null,
            query: {},
            params: {},
        };
    }
    const next = prefix + match.key;
    const o = await loadFromRemote({
        remote: {
            url: `/pages/${next}.js`,
            name: next,
        },
    });
    return {
        component: (await o()).default,
        query: {},
        params: {},
    };
};
