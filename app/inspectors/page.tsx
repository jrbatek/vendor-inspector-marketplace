import { redirect } from "next/navigation";
import InspectorFilterPage from "@/components/InspectorFilterPage";

/**
 * The public demo always uses local fictional records. The legacy
 * /inspectors?demo=1 URL previously enabled a "Synthetic data" banner while
 * the underlying search component still queried live Supabase inspector data.
 * Redirect before mounting that component so a demo reviewer cannot mistake
 * production-backed search results for fictional fixtures.
 *
 * Plain /inspectors remains the existing live workflow, unchanged.
 */
export default function InspectorsPage({searchParams}:{searchParams?:{demo?:string|string[]}}){
  const demoFlag=searchParams?.demo;
  if(demoFlag==="1" || (Array.isArray(demoFlag) && demoFlag.includes("1"))){
    redirect("/demo/client#structured-selection");
  }
  return <InspectorFilterPage/>;
}
