import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const classNameFn = useCallback(
      ({ isActive, isPending }: { isActive: boolean; isPending: boolean }) =>
        cn(className, isActive && activeClassName, isPending && pendingClassName),
      [className, activeClassName, pendingClassName]
    );

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={classNameFn}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
