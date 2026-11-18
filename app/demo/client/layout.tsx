import type { ReactNode } from "react";

// The inline listener intentionally precedes the hydration scripts. It only
// observes a validated, fictional inspection hash; it never touches live routes.
export default function ClientContinuousDemoLayout({children}:{children:ReactNode}){
  return <>
    <script id="inspectsource-early-inspection-hash" dangerouslySetInnerHTML={{__html:"(function(){\n  // This script runs with the HTML, before Next.js hydration can replace a\n  // rapid hash-only navigation with the route's pre-hydration canonical URL.\n  var path=\"/demo/client\";\n  var key=\"__inspectSourceEarlyInspectionHash\";\n  var good=/^#inspection-DEMO-ACT-[1-7]$/;\n  function capture(hash){\n    if(location.pathname!==path)return;\n    window[key]=good.test(hash)?{value:hash,at:Date.now()}:null;\n    if(window[key])window.dispatchEvent(new Event(\"inspectsource:early-inspection-hash\"));\n  }\n  window.addEventListener(\"hashchange\",function(event){\n    // Read event.newURL, not location.hash: Next may already have called\n    // history.replaceState by the time this queued event executes.\n    try{capture(new URL(event.newURL).hash)}catch(_){capture(location.hash)}\n  });\n  capture(location.hash);\n})();"}} />
    {children}
  </>;
}
