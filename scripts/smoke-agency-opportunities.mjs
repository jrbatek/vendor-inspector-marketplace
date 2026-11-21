import {spawn} from "node:child_process";
import {chromium} from "playwright";
const port=3127, base=process.env.AGENCY_OPPORTUNITY_BASE_URL||"http://127.0.0.1:"+port;
const server=process.env.AGENCY_OPPORTUNITY_BASE_URL?null:spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p",String(port)],{
 env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL||"https://ci-placeholder.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"ci-placeholder-anon-key"},stdio:["ignore","pipe","pipe"]
});
let output="",browser;
server?.stdout.on("data",x=>output+=String(x));server?.stderr.on("data",x=>output+=String(x));
function assert(condition,message){if(!condition)throw Error(message)}
async function ready(){for(let i=0;i<40;i++){try{if((await fetch(base+"/demo/agency-opportunities")).ok)return}catch{}await new Promise(r=>setTimeout(r,1000))}throw Error("Agency opportunities unavailable: "+output.slice(-2000))}
try{
 await ready();browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on("pageerror",e=>errors.push(e.stack||String(e)));
 await page.goto(base+"/demo/agency-opportunities",{waitUntil:"networkidle"});
 assert(await page.getByRole("heading",{name:"Search all synthetic opportunities"}).isVisible(),"Opportunity heading missing");
 assert(!(await page.getByText("Log in to view the client workspace").count()),"Agency Demo displayed live login shell");
 assert(await page.locator("article.opportunity").count()===24,"Expected 24 fictional opportunities");
 const first=page.locator("article.opportunity").first();
 const preview=first.getByRole("button",{name:"Preview Opportunity"});
 assert(await preview.getAttribute("aria-controls")===null,"Collapsed Agency preview points to nonexistent detail");
 await preview.click();
 const detail=first.getByRole("region",{name:/Synthetic opportunity details/});
 await detail.waitFor({state:"visible"});
 const id=await detail.getAttribute("id");
 assert(!!id&&(await first.getByRole("button",{name:"Close Opportunity"}).getAttribute("aria-controls"))===id,"Expanded preview target missing");
 await first.getByRole("button",{name:"Preview agency interest (demo only)"}).click();
 assert(await first.locator(".interest").isVisible(),"Fictional interest confirmation missing");
 await first.getByRole("button",{name:"Close Opportunity"}).click();
 await first.getByRole("button",{name:"Preview Opportunity"}).click();
 assert(await first.locator(".interest").count()===0,"Agency opportunity confirmation leaked after closing and reopening preview");
 await page.getByRole("combobox",{name:"Opportunity region"}).selectOption("Europe");
 const remaining=await page.locator("article.opportunity").count();
 assert(remaining>0&&remaining<24,"Region selection did not filter fictional opportunities");
 assert((await page.locator(".details").count())===0&&(await page.locator(".interest").count())===0,"Changing Agency filters left stale details or confirmation");
 await page.getByRole("searchbox",{name:"Search synthetic opportunities"}).fill("no-matching-fictional-project-xyz");
 assert(await page.locator("article.opportunity").count()===0,"Unsupported query did not produce empty state");
 await page.getByRole("button",{name:"Show all fictional opportunities"}).click();
 assert(await page.locator("article.opportunity").count()===24,"Reset did not restore all fictional opportunities");
 await page.setViewportSize({width:390,height:844});
 const sizes=await page.locator("main.wrap input, main.wrap select, main.wrap button, main.wrap header a").evaluateAll(nodes=>nodes.map(node=>({label:node.getAttribute("aria-label")||node.textContent?.trim().slice(0,28),height:node.getBoundingClientRect().height})));
 assert(sizes.length>5&&sizes.every(x=>x.height>=43.5),"Agency mobile control targets below 44px: "+JSON.stringify(sizes.filter(x=>x.height<43.5)));
 assert(errors.length===0,"Agency opportunities browser page errors: "+errors.join("\n"));
 console.log("Agency opportunities PASS: fictional search, detail, reset, status isolation, mobile controls");
}catch(error){console.error(error);process.exitCode=1}finally{await browser?.close();if(server){server.kill("SIGTERM");setTimeout(()=>server.kill("SIGKILL"),2000).unref()}}
