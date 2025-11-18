"use client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const router = useRouter();

	return (
		<main className="min-h-screen flex items-center justify-center bg-base-200">
			<div className="card w-full max-w-md bg-base-100 shadow-xl">
				<div className="card-body">
					<h1 className="text-2xl font-bold text-center">Logga in</h1>

					<p className="text-sm text-center mb-4">Välkommen tillbaka 👋</p>

					<form className="space-y-4">
						<div className="form-control">
							<label className="label">
								<span className="label-text">E-post</span>
							</label>
							<input
								type="email"
								placeholder="du@exempel.se"
								className="input input-bordered w-full"
								required
							/>
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text">Lösenord</span>
							</label>
							<input
								type="password"
								placeholder="••••••••"
								className="input input-bordered w-full"
								required
							/>
							<label className="label">
								<a href="#" className="label-text-alt link link-hover">
									Glömt lösenord?
								</a>
							</label>
						</div>

						<div className="form-control mt-2">
							<button type="submit" className="btn btn-primary w-full" onClick={() => router.push("/dashboard")}>
								Logga in
							</button>
						</div>
					</form>

					<div className="divider">eller</div>

					<button className="btn bg-white text-black border-[#e5e5e5]">
						<svg
							aria-label="Google logo"
							width="16"
							height="16"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 512 512"
						>
							<g>
								<path d="m0 0H512V512H0" fill="#fff"></path>
								<path
									fill="#34a853"
									d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
								></path>
								<path
									fill="#4285f4"
									d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
								></path>
								<path
									fill="#fbbc02"
									d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
								></path>
								<path
									fill="#ea4335"
									d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
								></path>
							</g>
						</svg>
						Logga in med Google
					</button>

					<p className="text-center text-sm mt-4">
						Har du inget konto?{" "}
						<a href="#" className="link link-primary">
							Skapa ett konto
						</a>
					</p>
				</div>
			</div>
		</main>
	);
}
