import { Form } from "@remix-run/react";

import { omitFieldNames, actionType } from "~/routes/annotate/omit";

type Props = {
  noteId: string;
  propertyName: string;
  /** Show the button to annotate that the note doesn't contain the required info. Defaults to true */
  showUnavailableInfoButton?: boolean;
  /** Show the button to annotate that the note  is not available. Defaults to true */
  showUnavailableNoteButton?: boolean;
  /** Show the button to annotate that the note  is not relevant or not related with vial accidents. Defaults to true */
  showInvalidNoteButton?: boolean;
};

const OmitForms = ({
  noteId,
  propertyName,
  showUnavailableInfoButton = true,
  showUnavailableNoteButton = true,
  showInvalidNoteButton = true,
}: Props) => (
  <>
    {showUnavailableInfoButton && (
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
    {showUnavailableNoteButton && (
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
          Nota borrada
        </button>
      </Form>
    )}
    {showInvalidNoteButton && (
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
          value={actionType.invalidNote}
          className="ml-2 rounded border  border-red-500 py-1 px-3 hover:bg-red-600 hover:text-white focus:bg-red-400"
        >
          Nota inválida
        </button>
      </Form>
    )}
  </>
);

export default OmitForms;
