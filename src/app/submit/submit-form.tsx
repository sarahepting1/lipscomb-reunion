"use client";

import { useState } from "react";
import { PersonPicker } from "./person-picker";
import { submitEvent } from "./actions";

type EventType = "birth" | "death" | "marriage" | "address_update" | "correction";

const LABELS: Record<EventType, string> = {
  birth: "Birth",
  death: "Death",
  marriage: "Marriage",
  address_update: "Address update",
  correction: "Correction to existing info",
};

export function SubmitForm() {
  const [eventType, setEventType] = useState<EventType>("birth");

  return (
    <form action={submitEvent} className="mt-8 flex flex-col gap-6">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-stone-700">What are you submitting?</span>
        <select
          name="event_type"
          value={eventType}
          onChange={(e) => setEventType(e.target.value as EventType)}
          className="rounded-md border border-stone-300 px-4 py-3 text-lg"
        >
          {Object.entries(LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {eventType === "birth" && (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Child&apos;s full name</span>
            <input
              type="text"
              name="child_name"
              required
              className="rounded-md border border-stone-300 px-4 py-3 text-lg"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Birthdate</span>
            <input
              type="date"
              name="event_date"
              className="rounded-md border border-stone-300 px-4 py-3 text-lg"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Birth location</span>
            <input
              type="text"
              name="location"
              className="rounded-md border border-stone-300 px-4 py-3 text-lg"
            />
          </label>
          <PersonPicker fieldName="parent1" label="Parent 1" />
          <PersonPicker fieldName="parent2" label="Parent 2" />
        </>
      )}

      {eventType === "death" && (
        <>
          <PersonPicker fieldName="person" label="Who passed away?" required />
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Date of death</span>
            <input
              type="date"
              name="event_date"
              className="rounded-md border border-stone-300 px-4 py-3 text-lg"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Location</span>
            <input
              type="text"
              name="location"
              className="rounded-md border border-stone-300 px-4 py-3 text-lg"
            />
          </label>
        </>
      )}

      {eventType === "marriage" && (
        <>
          <PersonPicker fieldName="person1" label="First spouse" required />
          <PersonPicker fieldName="person2" label="Second spouse" required />
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Marriage date</span>
            <input
              type="date"
              name="event_date"
              className="rounded-md border border-stone-300 px-4 py-3 text-lg"
            />
          </label>
        </>
      )}

      {eventType === "address_update" && (
        <>
          <PersonPicker fieldName="person" label="Whose address is this?" required />
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Street</span>
            <input
              type="text"
              name="street"
              className="rounded-md border border-stone-300 px-4 py-3 text-lg"
            />
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-sm font-medium text-stone-700">City</span>
              <input
                type="text"
                name="city"
                className="rounded-md border border-stone-300 px-4 py-3 text-lg"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-stone-700">State</span>
              <input
                type="text"
                name="state"
                className="rounded-md border border-stone-300 px-4 py-3 text-lg"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Zip</span>
            <input
              type="text"
              name="zip"
              className="rounded-md border border-stone-300 px-4 py-3 text-lg"
            />
          </label>
        </>
      )}

      {eventType === "correction" && (
        <>
          <PersonPicker fieldName="person" label="Which person is this about?" required />
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">What needs to be corrected?</span>
            <textarea
              name="description"
              required
              rows={4}
              className="rounded-md border border-stone-300 px-4 py-3 text-lg"
            />
          </label>
        </>
      )}

      <hr className="border-stone-200" />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-stone-700">Your name</span>
        <input
          type="text"
          name="submitter_name"
          required
          className="rounded-md border border-stone-300 px-4 py-3 text-lg"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-stone-700">Your email or phone (optional)</span>
        <input
          type="text"
          name="submitter_contact"
          className="rounded-md border border-stone-300 px-4 py-3 text-lg"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-stone-700">Notes (optional)</span>
        <textarea
          name="notes"
          rows={3}
          className="rounded-md border border-stone-300 px-4 py-3 text-lg"
        />
      </label>

      <button
        type="submit"
        className="mt-2 rounded-md bg-amber-700 px-4 py-3 text-lg font-medium text-white hover:bg-amber-800"
      >
        Submit for review
      </button>
    </form>
  );
}
