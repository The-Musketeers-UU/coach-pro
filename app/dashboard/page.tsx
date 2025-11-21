// app/login/page.tsx

export default function MainPage() {
	return (
		<main className="min-h-screen flex items-center justify-center bg-base-200">
			<button className = "btn">Testing</button>
		</main>
	);
import { redirect } from "next/navigation";

export default function TrainingDashboardPage() {
  redirect("/dashboard/groups/Group%201");
}
