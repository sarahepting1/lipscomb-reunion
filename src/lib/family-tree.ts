import type { SupabaseClient } from "@supabase/supabase-js";

export type TreeNode = {
  id: string | null;
  name: string;
  relationship: string | null;
  next: TreeNode[];
};

export async function getAncestorTree(
  supabase: SupabaseClient,
  personId: string | null,
  personName: string,
  depth: number
): Promise<TreeNode> {
  if (depth <= 0 || !personId) {
    return { id: personId, name: personName, relationship: null, next: [] };
  }
  const { data } = await supabase
    .from("parent_child")
    .select("parent_id,parent_name,relationship")
    .eq("child_id", personId);

  const parents = await Promise.all(
    (data ?? []).map(async (p) => {
      const sub = await getAncestorTree(supabase, p.parent_id, p.parent_name, depth - 1);
      return { ...sub, relationship: p.relationship };
    })
  );

  return { id: personId, name: personName, relationship: null, next: parents };
}

export async function getDescendantTree(
  supabase: SupabaseClient,
  personId: string | null,
  personName: string,
  depth: number
): Promise<TreeNode> {
  if (depth <= 0 || !personId) {
    return { id: personId, name: personName, relationship: null, next: [] };
  }
  const { data } = await supabase
    .from("parent_child")
    .select("child_id,child_name,relationship")
    .eq("parent_id", personId);

  const children = await Promise.all(
    (data ?? []).map(async (c) => {
      const sub = await getDescendantTree(supabase, c.child_id, c.child_name, depth - 1);
      return { ...sub, relationship: c.relationship };
    })
  );

  return { id: personId, name: personName, relationship: null, next: children };
}
