# Types

Cross-cutting TypeScript types shared across more than one feature
(e.g. the API pagination envelope `{ count, next, previous, results }`,
shared enums that mirror the backend).

Feature-local types stay inside their feature folder (`features/<x>/types.ts`).
Put something here only when two or more features genuinely share it.
