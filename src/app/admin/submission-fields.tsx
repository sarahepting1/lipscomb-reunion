type Submission = {
  event_type: string;
  payload: Record<string, unknown>;
};

function s(payload: Record<string, unknown>, key: string): string {
  const v = payload[key];
  return typeof v === "string" ? v : "";
}

const inputClass = "rounded-md border border-stone-300 px-3 py-2";
const labelClass = "flex flex-col gap-1 text-sm text-stone-600";

export function SubmissionFields({ sub, currentName }: { sub: Submission; currentName?: string }) {
  const p = sub.payload ?? {};

  switch (sub.event_type) {
    case "birth": {
      const parents = Array.isArray(p.parents)
        ? (p.parents as Array<{ name?: string }>).map((x) => x.name).filter(Boolean).join(" & ")
        : "";
      return (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Child&apos;s name
            <input name="child_name" defaultValue={s(p, "child_name")} className={inputClass} />
          </label>
          <label className={labelClass}>
            Birth date
            <input type="date" name="event_date" defaultValue={s(p, "birth_date")} className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Location
            <input name="location" defaultValue={s(p, "location")} className={inputClass} />
          </label>
          <p className="text-sm text-stone-500 sm:col-span-2">
            Parents: {parents || "none listed"} (not editable here — reject and ask for a
            resubmission to change who the parents are)
          </p>
        </div>
      );
    }
    case "death":
      return (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <p className="text-sm text-stone-500 sm:col-span-2">
            Person: {s(p, "person_name")}
            {p.person_id ? "" : " (unmatched — cannot approve until they're linked to a record)"}
          </p>
          <label className={labelClass}>
            Date of death
            <input type="date" name="event_date" defaultValue={s(p, "death_date")} className={inputClass} />
          </label>
          <label className={labelClass}>
            Location
            <input name="location" defaultValue={s(p, "location")} className={inputClass} />
          </label>
        </div>
      );
    case "marriage":
      return (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <p className="text-sm text-stone-500 sm:col-span-2">
            {s(p, "person1_name")} &amp; {s(p, "person2_name")} (not editable here)
          </p>
          <label className={labelClass}>
            Marriage date
            <input type="date" name="event_date" defaultValue={s(p, "marriage_date")} className={inputClass} />
          </label>
        </div>
      );
    case "address_update":
      return (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <p className="text-sm text-stone-500 sm:col-span-2">
            Person: {s(p, "person_name")}
            {p.person_id ? "" : " (unmatched — cannot approve until they're linked to a record)"}
          </p>
          <label className={`${labelClass} sm:col-span-2`}>
            Street
            <input name="street" defaultValue={s(p, "street")} className={inputClass} />
          </label>
          <label className={labelClass}>
            City
            <input name="city" defaultValue={s(p, "city")} className={inputClass} />
          </label>
          <label className={labelClass}>
            State
            <input name="state" defaultValue={s(p, "state")} className={inputClass} />
          </label>
          <label className={labelClass}>
            Zip
            <input name="zip" defaultValue={s(p, "zip")} className={inputClass} />
          </label>
        </div>
      );
    case "correction":
      return (
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-sm text-stone-500">
            Person: {s(p, "person_name")}
            {p.person_id ? "" : " (unmatched — can't apply a name fix without a matched record)"}
          </p>
          {p.person_id ? (
            <label className={labelClass}>
              Full name (editing this updates the directory record)
              <input
                name="corrected_name"
                defaultValue={currentName ?? s(p, "person_name")}
                className={inputClass}
              />
            </label>
          ) : (
            <input type="hidden" name="corrected_name" value="" />
          )}
          <label className={labelClass}>
            Description (submitter&apos;s note — for anything beyond the name, fix it yourself in
            Supabase&apos;s Table Editor)
            <textarea name="description" defaultValue={s(p, "description")} rows={3} className={inputClass} />
          </label>
        </div>
      );
    case "recipe_correction":
      return (
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-sm text-stone-500">Recipe: {s(p, "recipe_title")}</p>
          <label className={labelClass}>
            Description
            <textarea name="description" defaultValue={s(p, "description")} rows={3} className={inputClass} />
          </label>
        </div>
      );
    default:
      return null;
  }
}
