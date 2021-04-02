// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Class<T> = { new (...args: any[]): T } | { new (): T };
