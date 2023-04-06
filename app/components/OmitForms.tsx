import { Form } from "@remix-run/react";

import { omitFieldNames, actionType } from "~/routes/annotate/omit";

type Props = {
  noteId: string;
  propertyName: string;
  /** Show the button to annotate that the note doesn't contain the required info. Defaults to true */
  showUnavailableInfo?: boolean;
  /** Show the button to annotate that the note  is not available. Defaults to true */
  showUnavailableNote?: boolean;
};

const OmitForms = ({
  noteId,
  propertyName,
  showUnavailableInfo = true,
  showUnavailableNote = true,
}: Props) => (
  <>
    {showUnavailableInfo && (
      <Form replace reloadDocument method="post" action="/annotate/omit">
        <input
          value={noteId}
          name={omitFieldNames.noteId}
          type="hidden"
          required
        />
        <input
          value={propertyName}
          name={omitFieldNames.propertyName}
          type="hidden"
          required
        />
        <button
          type="submit"
          name={omitFieldNames.actionType}
          value={actionType.unavailableProperty}
          className="ml-2 rounded border  border-blue-500 py-1 px-3 hover:bg-blue-600 hover:text-white focus:bg-blue-400"
        >
          No dice
        </button>
      </Form>
    )}
    {showUnavailableNote && (
      <Form replace reloadDocument method="post" action="/annotate/omit">
        <input
          value={noteId}
          name={omitFieldNames.noteId}
          type="hidden"
          required
        />
        <input
          value={propertyName}
          name={omitFieldNames.propertyName}
          type="hidden"
          required
        />
        <button
          type="submit"
          name={omitFieldNames.actionType}
          value={actionType.unavailableNote}
          className="ml-2 rounded border  border-blue-500 py-1 px-3 hover:bg-blue-600 hover:text-white focus:bg-blue-400"
        >
          Nota no disponible
        </button>
      </Form>
    )}
  </>
);

export default OmitForms;
