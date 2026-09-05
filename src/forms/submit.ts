import { useEffect, useRef, useState } from "react";
import { API_BASE, HONEYPOT_FIELD, type FormKind } from "../../shared/forms";

type Token = { ts: number; sig: string };

export type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent" }
  | { status: "error"; message: string };

const GENERIC_ERROR = "We could not send that. Please try again, or email contact@kerniva.app.";

/**
 * Fetches a signed token when the form mounts. The server rejects a submission
 * presented sooner than a person could plausibly fill the form in, so a bot has
 * to make two requests with a real gap between them.
 */
export function useFormToken(): Token | null {
  const [token, setToken] = useState<Token | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`${API_BASE}/token`, { headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((t: Token | null) => {
        if (live && t && typeof t.ts === "number" && typeof t.sig === "string") setToken(t);
      })
      .catch(() => {
        /* Leave the token null; submitting then reports a normal failure. */
      });
    return () => {
      live = false;
    };
  }, []);

  return token;
}

/** Reads a form's declared fields; anything not named here is never sent. */
export function readFields(
  form: HTMLFormElement,
  names: readonly string[],
): Record<string, string> {
  const data = new FormData(form);
  const out: Record<string, string> = {};
  for (const name of [...names, HONEYPOT_FIELD]) {
    const value = data.get(name);
    if (typeof value === "string" && value !== "") out[name] = value;
  }
  return out;
}

export async function submitForm(
  kind: FormKind,
  fields: Record<string, string>,
  token: Token | null,
): Promise<SubmitState> {
  if (token === null) return { status: "error", message: GENERIC_ERROR };

  try {
    const res = await fetch(`${API_BASE}/${kind}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...fields, token }),
    });
    if (res.ok) return { status: "sent" };

    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { status: "error", message: body?.error ? capitalize(body.error) : GENERIC_ERROR };
  } catch {
    return { status: "error", message: GENERIC_ERROR };
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Wires the shared submit behaviour: token, honeypot, in-flight state, and a
 * real error path so a failed send is never shown as success.
 */
export function useFormSubmit(kind: FormKind, names: readonly string[]) {
  const token = useFormToken();
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const busy = useRef(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setState({ status: "sending" });
    const next = await submitForm(kind, readFields(e.currentTarget, names), token);
    setState(next);
    busy.current = false;
  }

  return { state, onSubmit };
}
