import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Stable, opaque id derived from the email so the SAME account always maps to
// the SAME profile/posts — regardless of device or a changing OAuth `sub`.
// (Not the raw email, to avoid leaking it in public post payloads.)
function stableId(email: string): string {
  let h = 5381;
  const s = email.trim().toLowerCase();
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "u" + h.toString(36);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.email ? stableId(token.email) : (token.sub ?? "");
      }
      return session;
    },
  },
});
