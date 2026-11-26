import { Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { useAccount } from "./account";
import { secureSignOut } from "./IdleTimeout";

/** The portal's main nav items, auth-aware. Used by the site header and the landing page navbar. */
export function NavLinks({
  linkClass,
  activeClass,
  applyClass,
  onNavigate,
}: {
  linkClass: string;
  activeClass: string;
  applyClass: string;
  onNavigate?: () => void;
}) {
  const { session } = useSession();
  const { data: account } = useAccount(session?.user.id);
  const isStaff = (account?.staff.length ?? 0) > 0;
  const p = { className: linkClass, activeProps: { className: activeClass }, onClick: onNavigate };

  return (
    <>
      <Link to="/programs/joat" {...p}>
        JOAT Global
      </Link>
      <Link to="/programs/amare" {...p}>
        Amare's Big Planet
      </Link>
      <Link to="/faq" {...p}>
        FAQ
      </Link>
      <Link to="/resources" {...p}>
        Resources
      </Link>
      {session ? (
        <>
          <Link to="/dashboard" {...p}>
            Dashboard
          </Link>
          {isStaff && (
            <Link to="/admin" {...p}>
              Admin
            </Link>
          )}
          <button type="button" className={linkClass} onClick={() => void secureSignOut()}>
            Sign out
          </button>
        </>
      ) : (
        <>
          <Link to="/login" {...p}>
            Sign in
          </Link>
          <Link to="/apply" className={applyClass} onClick={onNavigate}>
            Apply
          </Link>
        </>
      )}
    </>
  );
}
