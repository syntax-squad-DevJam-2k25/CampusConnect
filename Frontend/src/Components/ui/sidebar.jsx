import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "4.5rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

const SidebarContext = React.createContext(null);

function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }
    return context;
}

const SidebarProvider = React.forwardRef(
    (
        {
            defaultOpen = true,
            open: openProp,
            onOpenChange: setOpenProp,
            className,
            style,
            children,
            ...props
        },
        ref
    ) => {
        const [openMobile, setOpenMobile] = React.useState(false);
        const [_open, _setOpen] = React.useState(defaultOpen);

        const open = openProp !== undefined ? openProp : _open;
        const setOpen = React.useCallback(
            (value) => {
                const newValue = typeof value === "function" ? value(open) : value;
                if (setOpenProp) {
                    setOpenProp(newValue);
                } else {
                    _setOpen(newValue);
                }
                document.cookie = `${SIDEBAR_COOKIE_NAME}=${newValue}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
            },
            [setOpenProp, open]
        );

        const toggleSidebar = React.useCallback(() => {
            setOpen((prev) => !prev);
        }, [setOpen]);

        React.useEffect(() => {
            const handleKeyDown = (event) => {
                if (
                    event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
                    (event.metaKey || event.ctrlKey)
                ) {
                    event.preventDefault();
                    toggleSidebar();
                }
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }, [toggleSidebar]);

        const state = open ? "expanded" : "collapsed";

        const contextValue = React.useMemo(
            () => ({
                state,
                open,
                setOpen,
                openMobile,
                setOpenMobile,
                toggleSidebar,
            }),
            [state, open, setOpen, openMobile, setOpenMobile, toggleSidebar]
        );

        return (
            <SidebarContext.Provider value={contextValue}>
                <TooltipProvider delayDuration={0}>
                    <div
                        ref={ref}
                        style={{
                            "--sidebar-width": SIDEBAR_WIDTH,
                            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                            ...style,
                        }}
                        className={cn(
                            "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
                            className
                        )}
                        {...props}
                    >
                        {children}
                    </div>
                </TooltipProvider>
            </SidebarContext.Provider>
        );
    }
);
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef(
    (
        {
            side = "left",
            variant = "sidebar",
            collapsible = "offcanvas",
            className,
            children,
            ...props
        },
        ref
    ) => {
        const { state, openMobile, setOpenMobile } = useSidebar();

        if (collapsible === "none") {
            return (
                <div
                    className={cn(
                        "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            );
        }

        return (
            <>
                {/* Mobile overlay */}
                {openMobile && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 md:hidden"
                        onClick={() => setOpenMobile(false)}
                    />
                )}

                {/* Mobile sidebar */}
                <div
                    className={cn(
                        "fixed inset-y-0 z-50 flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 md:hidden",
                        side === "left" ? "left-0" : "right-0",
                        openMobile
                            ? "translate-x-0"
                            : side === "left"
                                ? "-translate-x-full"
                                : "translate-x-full"
                    )}
                    style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE }}
                >
                    {children}
                </div>

                {/* Desktop sidebar */}
                <div
                    ref={ref}
                    className="group hidden md:block peer"
                    data-state={state}
                    data-collapsible={state === "collapsed" ? collapsible : ""}
                    data-variant={variant}
                    data-side={side}
                >
                    <div
                        className={cn(
                            "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
                            "group-data-[collapsible=offcanvas]:w-0",
                            "group-data-[side=right]:rotate-180",
                            state === "collapsed" &&
                            collapsible === "icon" &&
                            "w-[--sidebar-width-icon]"
                        )}
                    />
                    <div
                        className={cn(
                            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
                            side === "left"
                                ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
                                : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                            state === "collapsed" &&
                            collapsible === "icon" &&
                            "w-[--sidebar-width-icon]",
                            className
                        )}
                        {...props}
                    >
                        <div
                            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
                            data-sidebar="sidebar"
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </>
        );
    }
);
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef(({ className, onClick, ...props }, ref) => {
    const { toggleSidebar, setOpenMobile, openMobile } = useSidebar();

    return (
        <Button
            ref={ref}
            data-sidebar="trigger"
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", className)}
            onClick={(event) => {
                onClick?.(event);
                // Toggle mobile on small screens, desktop on larger
                if (window.innerWidth < 768) {
                    setOpenMobile(!openMobile);
                } else {
                    toggleSidebar();
                }
            }}
            {...props}
        >
            <PanelLeft />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    );
});
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarInset = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <main
            ref={ref}
            className={cn(
                "relative flex min-h-svh flex-1 flex-col bg-background",
                "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
                className
            )}
            {...props}
        />
    );
});
SidebarInset.displayName = "SidebarInset";

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="header"
            className={cn("flex flex-col gap-2 p-2", className)}
            {...props}
        />
    );
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="footer"
            className={cn("flex flex-col gap-2 p-2", className)}
            {...props}
        />
    );
});
SidebarFooter.displayName = "SidebarFooter";

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="content"
            className={cn(
                "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
                className
            )}
            {...props}
        />
    );
});
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="group"
            className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
            {...props}
        />
    );
});
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef(
    ({ className, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "div";

        return (
            <Comp
                ref={ref}
                data-sidebar="group-label"
                className={cn(
                    "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                    "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
                    className
                )}
                {...props}
            />
        );
    }
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="group-content"
        className={cn("w-full text-sm", className)}
        {...props}
    />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        data-sidebar="menu"
        className={cn("flex w-full min-w-0 flex-col gap-1", className)}
        {...props}
    />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
    <li
        ref={ref}
        data-sidebar="menu-item"
        className={cn("group/menu-item relative", className)}
        {...props}
    />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = {
    default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    outline:
        "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
};

const SidebarMenuButton = React.forwardRef(
    (
        {
            asChild = false,
            isActive = false,
            variant = "default",
            size = "default",
            tooltip,
            className,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        const { state } = useSidebar();

        const button = (
            <Comp
                ref={ref}
                data-sidebar="menu-button"
                data-size={size}
                data-active={isActive}
                className={cn(
                    "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
                    size === "sm" && "text-xs",
                    size === "lg" && "text-base  group-data-[collapsible=icon]:!p-0",
                    "group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2",
                    sidebarMenuButtonVariants[variant],
                    className
                )}
                {...props}
            />
        );

        if (!tooltip) {
            return button;
        }

        if (typeof tooltip === "string") {
            tooltip = { children: tooltip };
        }

        return (
            <Tooltip>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent
                    side="right"
                    align="center"
                    hidden={state !== "collapsed"}
                    {...tooltip}
                />
            </Tooltip>
        );
    }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuBadge = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="menu-badge"
        className={cn(
            "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
            "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
            "group-data-[collapsible=icon]:hidden",
            className
        )}
        {...props}
    />
));
SidebarMenuBadge.displayName = "SidebarMenuBadge";

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
};
