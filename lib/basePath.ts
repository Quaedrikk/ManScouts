// Base path the app is served under (e.g. "/manscouts" on quadmds.com).
// Set NEXT_PUBLIC_BASE_PATH at build time; leave unset to serve at the domain root.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
