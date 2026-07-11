"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key)?.toString().trim();
  return value ? value : null;
}

function personFromPicker(formData: FormData, fieldName: string) {
  const id = str(formData, `${fieldName}_id`);
  const name = str(formData, `${fieldName}_name`);
  return { id, name };
}

export async function submitEvent(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const eventType = formData.get("event_type")?.toString();
  const submitterName = str(formData, "submitter_name");
  const submitterContact = str(formData, "submitter_contact");
  const notes = str(formData, "notes");

  if (!submitterName) {
    redirect(`/submit?error=${encodeURIComponent("Your name is required.")}`);
  }

  let personId: string | null = null;
  let payload: Record<string, unknown>;

  switch (eventType) {
    case "birth": {
      const childName = str(formData, "child_name");
      if (!childName) redirect(`/submit?error=${encodeURIComponent("Child's name is required.")}`);
      const parent1 = personFromPicker(formData, "parent1");
      const parent2 = personFromPicker(formData, "parent2");
      payload = {
        child_name: childName,
        birth_date: str(formData, "event_date"),
        location: str(formData, "location"),
        parents: [parent1, parent2].filter((p) => p.name),
      };
      break;
    }
    case "death": {
      const person = personFromPicker(formData, "person");
      if (!person.name) redirect(`/submit?error=${encodeURIComponent("Please specify who passed away.")}`);
      personId = person.id;
      payload = {
        person_id: person.id,
        person_name: person.name,
        death_date: str(formData, "event_date"),
        location: str(formData, "location"),
      };
      break;
    }
    case "marriage": {
      const person1 = personFromPicker(formData, "person1");
      const person2 = personFromPicker(formData, "person2");
      if (!person1.name || !person2.name) {
        redirect(`/submit?error=${encodeURIComponent("Both spouses are required.")}`);
      }
      payload = {
        person1_id: person1.id,
        person1_name: person1.name,
        person2_id: person2.id,
        person2_name: person2.name,
        marriage_date: str(formData, "event_date"),
      };
      break;
    }
    case "address_update": {
      const person = personFromPicker(formData, "person");
      if (!person.name) redirect(`/submit?error=${encodeURIComponent("Please specify whose address this is.")}`);
      personId = person.id;
      payload = {
        person_id: person.id,
        person_name: person.name,
        street: str(formData, "street"),
        city: str(formData, "city"),
        state: str(formData, "state"),
        zip: str(formData, "zip"),
      };
      break;
    }
    case "correction": {
      const person = personFromPicker(formData, "person");
      const description = str(formData, "description");
      if (!person.name) redirect(`/submit?error=${encodeURIComponent("Please specify which person this is about.")}`);
      if (!description) redirect(`/submit?error=${encodeURIComponent("Please describe the correction.")}`);
      personId = person.id;
      payload = {
        person_id: person.id,
        person_name: person.name,
        description,
      };
      break;
    }
    default:
      redirect(`/submit?error=${encodeURIComponent("Please choose what you're submitting.")}`);
  }

  const { error } = await supabase.from("submissions").insert({
    event_type: eventType,
    person_id: personId,
    payload,
    submitter_name: submitterName,
    submitter_contact: submitterContact,
    notes,
  });

  if (error) {
    redirect(`/submit?error=${encodeURIComponent("Something went wrong saving your submission. Please try again.")}`);
  }

  redirect("/submit?submitted=1");
}
