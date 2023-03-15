import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { createNote } from "~/models/notes2.server";
import { requireUserId } from "~/session.server";
import { validateUrl } from "~/utils";

const urlFieldName = "url";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const validUrls = formData
    .getAll(urlFieldName)
    .filter(
      (urlStringItem) =>
        typeof urlStringItem === "string" && validateUrl(urlStringItem)
    )
    .map((urlStringItem) => encodeURI(urlStringItem.toString().trim()));

  if (validUrls.length === 0) {
    return json({ errors: { urls: "Urls is required" } }, { status: 400 });
  }

  const validUrlsSet = new Set(validUrls); // prevent duplicates

  await createNote({ urls: [...validUrlsSet], userId });

  return redirect(`/notes2/new`);
}

export default function NewNotePage() {
  const actionData = useActionData<typeof action>();

  return (
    <Form
      replace
      reloadDocument
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <fieldset>
          <legend>Urls</legend>
          <div className="flex flex-col gap-1">
            <input
              name={urlFieldName}
              type="url"
              placeholder="http://algunacosa.com"
              className="rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            />
            <input
              name={urlFieldName}
              type="url"
              placeholder="http://algunacosa.com"
              className="rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            />

            <input
              name={urlFieldName}
              type="url"
              placeholder="http://algunacosa.com"
              className="rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            />
          </div>
          {actionData?.errors?.urls && (
            <div className="pt-1 text-red-700" id="url-error">
              {actionData.errors.urls}
            </div>
          )}
        </fieldset>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
