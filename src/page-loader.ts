import {Resolver} from "./router";
import {loadFromRemote} from "./loader/load-from-remote";
import matchPath from "./match-path";

export const pageLoader: Resolver = async function pageLoader(location, depth, parents, segs) {
    console.log(JSON.stringify({location, depth, parents, segs}, null, 2));
    const psegs = ['/', ...location.pathname.slice(1).split('/')].filter(Boolean);
    const curr = location.pathname === "/" ? "/" : psegs[depth+1];
    console.log(psegs, curr);
    // const pathname = location.pathname;
    const prefix = "app_pages_";
    const match = segs.find(seg => {
        console.log("??", seg, curr)
        return seg.seg === curr;
    });
    console.log(match);
    if (!match) {
        return {component: null, query: {}, params: {}}
    }
    const next = prefix + match.key;
    const o = await loadFromRemote({
        remote: {
            url: `/pages/${next}.js`,
            name: next
        }
    });
    return {
        component: (await o()).default,
        query:{},
        params: {}
    }
}

function asPath(seg: string): string {
    if (seg === "/") return "index_tsx";
    return seg + "_index_tsx";
}

function toSlug(pathname: string) {
    return pathname.slice(1).replace(/[./]/g, "_")
}
