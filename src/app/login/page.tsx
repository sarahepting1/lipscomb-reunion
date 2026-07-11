import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-stone-900">Family Login</h1>
      <p className="mt-2 text-lg text-stone-600">
        Use the shared email and password from the reunion handout.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-red-800">{error}</p>
      )}

      <form action={signIn} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded-md border border-stone-300 px-4 py-3 text-lg"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="rounded-md border border-stone-300 px-4 py-3 text-lg"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-md bg-amber-700 px-4 py-3 text-lg font-medium text-white hover:bg-amber-800"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
