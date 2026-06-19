// @ts-nocheck
import {
  loader,
  type MetaData,
  type PageData,
  type StaticSource,
} from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { server } from "fumadocs-mdx/runtime/server";
import type {
  DocData,
  DocMethods,
  MetaMethods,
} from "fumadocs-mdx/runtime/types";
import * as backendArchitecture from "../../content/docs/backend-architecture.mdx?collection=docs";
import * as deployment from "../../content/docs/deployment.mdx?collection=docs";
import * as frontendArchitecture from "../../content/docs/frontend-architecture.mdx?collection=docs";
import * as indexDoc from "../../content/docs/index.mdx?collection=docs";
import { default as docsMeta } from "../../content/docs/meta.json?collection=docs";
import * as projectStructure from "../../content/docs/project-structure.mdx?collection=docs";
import * as routesAndFlows from "../../content/docs/routes-and-flows.mdx?collection=docs";
import * as uiPackage from "../../content/docs/ui-package.mdx?collection=docs";
import { docsContentRoute, docsImageRoute, docsRoute } from "./shared";

type DocsPageData = PageData &
  DocData &
  DocMethods & {
    full?: boolean;
  };
type DocsMetaData = MetaData & MetaMethods;

const create = server({
  doc: {
    passthroughs: ["extractedReferences"],
  },
});

const docs = await create.docs(
  "docs",
  "content/docs",
  {
    "meta.json": docsMeta,
  },
  {
    "backend-architecture.mdx": backendArchitecture,
    "deployment.mdx": deployment,
    "frontend-architecture.mdx": frontendArchitecture,
    "index.mdx": indexDoc,
    "project-structure.mdx": projectStructure,
    "routes-and-flows.mdx": routesAndFlows,
    "ui-package.mdx": uiPackage,
  },
);

const docsSource = docs.toFumadocsSource() as StaticSource<{
  pageData: DocsPageData;
  metaData: DocsMetaData;
}>;

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docsSource,
  plugins: [lucideIconsPlugin()],
});

export function getPageImage(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join("/")}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join("/")}`,
  };
}

export async function getLLMText(page: (typeof source)["$inferPage"]) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title} (${page.url})

${processed}`;
}
