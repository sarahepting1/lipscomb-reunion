import { signUp } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; confirm?: string }>;
}) {
  const { error, confirm } = await searchParams;

  if (confirm) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-2xl font-semibold text-stone-900">Check your email</h1>
        <p className="mt-4 text-lg text-stone-600">
          We sent you a confirmation link. Click it to finish creating your account and pick
          yourself in the family tree.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-stone-900">Create an Account</h1>
      <p className="mt-2 text-lg text-stone-600">
        You&apos;ll need the family code Sarah shared at the reunion.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-red-800">{error}</p>
      )}

      <form action={signUp} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">Family code</span>
          <input
            type="text"
            name="family_code"
            required
            className="rounded-md border border-stone-300 px-4 py-3 text-lg"
          />
        </label>
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
            minLength={8}
            autoComplete="new-password"
            className="rounded-md border border-stone-300 px-4 py-3 text-lg"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">Confirm password</span>
          <input
            type="password"
            name="confirm_password"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-md border border-stone-300 px-4 py-3 text-lg"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-md bg-amber-700 px-4 py-3 text-lg font-medium text-white hover:bg-amber-800"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
