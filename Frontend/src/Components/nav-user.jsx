import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ChevronsUpDown, LogOut, User } from "lucide-react";
import { logout } from "@/redux/userSlice";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/Components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";

export function NavUser() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useSidebar();
    const user = useSelector((state) => state.user.currentUser);
    const isCollapsed = state === "collapsed";

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const handleProfile = () => {
        navigate("/profile");
    };

    // Get user initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const userName = user?.name || user?.email || "User";
    const userEmail = user?.email || "";

    return (
        <SidebarMenu className={isCollapsed ? "flex justify-center" : ""}>
            <SidebarMenuItem className={isCollapsed ? "flex justify-center w-full" : ""}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${isCollapsed ? "justify-center px-0 w-auto" : ""
                                }`}
                            tooltip={userName}
                        >
                            <Avatar className="h-8 w-8 rounded-lg flex-shrink-0">
                                <AvatarImage src={user?.picture} alt={userName} />
                                <AvatarFallback className="rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                    {getInitials(userName)}
                                </AvatarFallback>
                            </Avatar>
                            {!isCollapsed && (
                                <>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold text-white">{userName}</span>
                                        <span className="truncate text-xs text-slate-400">{userEmail}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
                                </>
                            )}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-slate-800 border-slate-600"
                        side={isCollapsed ? "right" : "top"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user?.picture} alt={userName} />
                                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                        {getInitials(userName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-white">{userName}</span>
                                    <span className="truncate text-xs text-slate-400">{userEmail}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-600" />
                        <DropdownMenuItem onClick={handleProfile} className="text-white hover:bg-slate-700 cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-600" />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-slate-700 hover:text-red-300 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
