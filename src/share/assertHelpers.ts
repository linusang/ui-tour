export function assertIsDefined<T>(
  val: T,
  message?: string
): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(
      message ?? `Expected 'val' to be defined, but received ${val}`
    );
  }
}
