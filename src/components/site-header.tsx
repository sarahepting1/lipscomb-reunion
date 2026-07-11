import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export async function SiteHeader() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-stone-900">
          Lipscomb Family Reunion
        </Link>
        <nav className="flex items-center gap-6 text-lg">
          <Link href="/directory" className="text-stone-700 hover:text-stone-900">
            Directory
          </Link>
          <Link href="/recipes" className="text-stone-700 hover:text-stone-900">
            Recipes
          </Link>
          {user && (
            <Link href="/submit" className="text-stone-700 hover:text-stone-900">
              Submit an Update
            </Link>
          )}
          {user && (
            <Link href="/link-person" className="text-stone-700 hover:text-stone-900">
              Link My Profile
            </Link>
          )}
          {user ? (
            <form action={signOut}>
              <button type="submit" className="text-stone-700 hover:text-stone-900">
                Log out
              </button>
            </form>
          ) : (
            <>
              <Link href="/login" className="text-stone-700 hover:text-stone-900">
                Log in
              </Link>
              <Link href="/signup" className="text-stone-700 hover:text-stone-900">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
