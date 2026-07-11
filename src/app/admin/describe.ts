type Submission = {
  event_type: string;
  payload: Record<string, unknown>;
};

function s(payload: Record<string, unknown>, key: string): string {
  const v = payload[key];
  return typeof v === "string" && v ? v : "";
}

export function describeSubmission(sub: Submission): string {
  const p = sub.payload ?? {};

  switch (sub.event_type) {
    case "birth": {
      const parents = Array.isArray(p.parents)
        ? (p.parents as Array<{ name?: string }>)
            .map((x) => x.name)
            .filter(Boolean)
            .join(" & ")
        : "";
      return `New birth: ${s(p, "child_name")}, born ${s(p, "birth_date") || "date unknown"}${
        s(p, "location") ? ` in ${s(p, "location")}` : ""
      }.${parents ? ` Parents: ${parents}.` : ""}`;
    }
    case "death":
      return `Death: ${s(p, "person_name")}${p.person_id ? "" : " (unmatched person)"}, died ${
        s(p, "death_date") || "date unknown"
      }${s(p, "location") ? ` in ${s(p, "location")}` : ""}.`;
    case "marriage":
      return `Marriage: ${s(p, "person1_name")} & ${s(p, "person2_name")}, ${
        s(p, "marriage_date") || "date unknown"
      }.`;
    case "address_update":
      return `Address update for ${s(p, "person_name")}${p.person_id ? "" : " (unmatched person)"}: ${[
        s(p, "street"),
        s(p, "city"),
        s(p, "state"),
        s(p, "zip"),
      ]
        .filter(Boolean)
        .join(", ")}.`;
    case "correction":
      return `Correction for ${s(p, "person_name")}${p.person_id ? "" : " (unmatched person)"}: "${s(
        p,
        "description"
      )}"`;
    default:
      return JSON.stringify(p);
  }
}
