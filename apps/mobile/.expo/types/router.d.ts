/* eslint-disable */
import * as Router from "expo-router";

export * from "expo-router";

declare module "expo-router" {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams:
        | { pathname: Router.RelativePathString; params?: Router.UnknownInputParams }
        | { pathname: Router.ExternalPathString; params?: Router.UnknownInputParams }
        | { pathname: `/`; params?: Router.UnknownInputParams }
        | { pathname: `/login`; params?: Router.UnknownInputParams }
        | { pathname: `/register`; params?: Router.UnknownInputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(tabs)"}/account` | `/account`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(tabs)"}/events` | `/events`; params?: Router.UnknownInputParams }
        | { pathname: `/booking/[id]`; params: Router.UnknownInputParams & { id: string | number } }
        | { pathname: `/events/[id]`; params: Router.UnknownInputParams & { id: string | number } }
        | { pathname: `/reservation/[id]`; params: Router.UnknownInputParams & { id: string | number } };
      hrefOutputParams:
        | { pathname: Router.RelativePathString; params?: Router.UnknownOutputParams }
        | { pathname: Router.ExternalPathString; params?: Router.UnknownOutputParams }
        | { pathname: `/`; params?: Router.UnknownOutputParams }
        | { pathname: `/login`; params?: Router.UnknownOutputParams }
        | { pathname: `/register`; params?: Router.UnknownOutputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams }
        | { pathname: `${"/(tabs)"}/account` | `/account`; params?: Router.UnknownOutputParams }
        | { pathname: `${"/(tabs)"}/events` | `/events`; params?: Router.UnknownOutputParams }
        | { pathname: `/booking/[id]`; params: Router.UnknownOutputParams & { id: string } }
        | { pathname: `/events/[id]`; params: Router.UnknownOutputParams & { id: string } }
        | { pathname: `/reservation/[id]`; params: Router.UnknownOutputParams & { id: string } };
      href:
        | Router.RelativePathString
        | Router.ExternalPathString
        | `/${`?${string}` | `#${string}` | ""}`
        | `/login${`?${string}` | `#${string}` | ""}`
        | `/register${`?${string}` | `#${string}` | ""}`
        | `/_sitemap${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/account${`?${string}` | `#${string}` | ""}`
        | `/account${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/events${`?${string}` | `#${string}` | ""}`
        | `/events${`?${string}` | `#${string}` | ""}`
        | { pathname: Router.RelativePathString; params?: Router.UnknownInputParams }
        | { pathname: Router.ExternalPathString; params?: Router.UnknownInputParams }
        | { pathname: `/`; params?: Router.UnknownInputParams }
        | { pathname: `/login`; params?: Router.UnknownInputParams }
        | { pathname: `/register`; params?: Router.UnknownInputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(tabs)"}/account` | `/account`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(tabs)"}/events` | `/events`; params?: Router.UnknownInputParams }
        | `/booking/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ""}`
        | `/events/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ""}`
        | `/reservation/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ""}`
        | { pathname: `/booking/[id]`; params: Router.UnknownInputParams & { id: string | number } }
        | { pathname: `/events/[id]`; params: Router.UnknownInputParams & { id: string | number } }
        | { pathname: `/reservation/[id]`; params: Router.UnknownInputParams & { id: string | number } };
    }
  }
}
