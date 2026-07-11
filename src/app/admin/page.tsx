import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminLogin, adminLogout, approveSubmission, rejectSubmission } from "./actions";
import { describeSubmission } from "./describe";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-2xl font-semibold text-stone-900">Admin Review</h1>
        {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-red-800">{error}</p>}
        <form action={adminLogin} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Admin password</span>
            <input
              type="password"
              name="password"
              required
              className="rounded-md border border-stone-300 px-4 py-3 text-lg"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-amber-700 px-4 py-3 text-lg font-medium text-white hover:bg-amber-800"
          >
            Log in
          </button>
        </form>
      </div>
    );
  }

  const admin = createAdminClient();
  const [{ data: pending }, { data: history }] = await Promise.all([
    admin.from("submissions").select("*").eq("status", "pending").order("created_at", { ascending: true }),
    admin
      .from("submissions")
      .select("*")
      .in("status", ["approved", "rejected"])
      .order("reviewed_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-stone-900">Admin Review</h1>
        <form action={adminLogout}>
          <button type="submit" className="text-stone-600 underline">
            Log out of admin
          </button>
        </form>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-red-800">{error}</p>}

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Pending ({pending?.length ?? 0})</h2>
      <ul className="mt-4 space-y-4">
        {(pending ?? []).map((sub) => (
          <li key={sub.id} className="rounded-md border border-stone-300 bg-white p-4">
            <div className="text-sm uppercase tracking-wide text-stone-500">
              {sub.event_type.replace("_", " ")}
            </div>
            <p className="mt-1 text-lg text-stone-900">{describeSubmission(sub)}</p>
            <p className="mt-2 text-stone-600">
              Submitted by {sub.submitter_name}
              {sub.submitter_contact && ` (${sub.submitter_contact})`}
            </p>
            {sub.notes && <p className="mt-1 italic text-stone-600">Notes: {sub.notes}</p>}
            <div className="mt-3 flex gap-3">
              <form action={approveSubmission}>
                <input type="hidden" name="id" value={sub.id} />
                <button
                  type="submit"
                  className="rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800"
                >
                  Approve
                </button>
              </form>
              <form action={rejectSubmission}>
                <input type="hidden" name="id" value={sub.id} />
                <button type="submit" className="rounded-md bg-red-700 px-4 py-2 text-white hover:bg-red-800">
                  Reject
                </button>
              </form>
            </div>
          </li>
        ))}
        {(pending ?? []).length === 0 && <p className="text-stone-500">Nothing pending.</p>}
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-stone-900">History</h2>
      <ul className="mt-4 space-y-2">
        {(history ?? []).map((sub) => (
          <li key={sub.id} className="rounded-md border border-stone-200 bg-stone-50 p-3 text-stone-700">
            <span className={`font-medium ${sub.status === "approved" ? "text-green-700" : "text-red-700"}`}>
              {sub.status}
            </span>{" "}
            — {describeSubmission(sub)}
          </li>
        ))}
        {(history ?? []).length === 0 && <p className="text-stone-500">No history yet.</p>}
      </ul>
    </div>
  );
}
