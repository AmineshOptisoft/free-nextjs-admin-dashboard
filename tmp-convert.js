const fs = require("fs");
const path = require("path");
const HTMLtoJSX = require("htmltojsx");

const htmlPath = path.join(process.cwd(), "public", "takci-source.html");
const raw = fs.readFileSync(htmlPath, "utf8");
const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
const body = bodyMatch ? bodyMatch[1] : "";

let cleaned = body
  .replace(/<div class="color-scheme-wrap active">[\s\S]*?<\/div>/i, "")
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/\.\/Takci - Online Taxi Service HTML Template - Home One-new_files\//g, "/takci-files/")
  .replace(/(["'(])assets\/img\//g, "$1https://html.themehour.net/takci/demo/assets/img/");

const converter = new HTMLtoJSX({ createClass: false });
let jsx = converter.convert(`<div>${cleaned}</div>`);
jsx = jsx.replace(/^<div>/, "<>").replace(/<\/div>$/, "</>");

const out = `import React from "react";
import Script from "next/script";

export default function RootLandingPage() {
  return (
    <>
      <link rel="stylesheet" href="https://html.themehour.net/takci/demo/assets/css/app.min.css" />
      <link rel="stylesheet" href="https://html.themehour.net/takci/demo/assets/css/fontawesome.min.css" />
      <link rel="stylesheet" href="https://html.themehour.net/takci/demo/assets/css/style.css" />
      <link rel="stylesheet" href="/takci-theme-override.css" />

      ${jsx}

      <Script src="https://html.themehour.net/takci/demo/assets/js/vendor/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <Script src="https://html.themehour.net/takci/demo/assets/js/app.min.js" strategy="afterInteractive" />
      <Script src="https://html.themehour.net/takci/demo/assets/js/main.js" strategy="afterInteractive" />
    </>
  );
}
`;

fs.writeFileSync(path.join(process.cwd(), "src", "app", "page.tsx"), out, "utf8");
