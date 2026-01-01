import HomePage from "../app/pages/home/page";
import { redirect } from "next/navigation";

export default function Home() {
  return redirect("pages/home");
}
