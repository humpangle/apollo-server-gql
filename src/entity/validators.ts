import { ValidationError } from "class-validator";

export function formatValidationErrors(errors: ValidationError[]) {
  return errors.reduce(
    (acc, { property, constraints }) => {
      acc[property] = Object.values(constraints)[0];
      return acc;
    },
    {} as { [k: string]: string }
  );
}
