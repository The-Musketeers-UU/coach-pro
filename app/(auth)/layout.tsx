// app/(auth)/login/layout.tsx
import "./auth.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
		<div className="flex min-h-screen flex-col">
		  <main className="flex-1">
			{children}
		  </main>
		</div>
  );;
}
