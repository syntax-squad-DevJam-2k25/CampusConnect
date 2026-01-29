import * as React from "react";
import { Sparkles } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/Components/ui/sidebar";
import { NavMain } from "@/Components/nav-main";
import { NavConnection } from "@/Components/nav-connection";
import { NavUser } from "@/Components/nav-user";
import logo from "@/Assests/Photos/Logo.jpeg";

export function AppSidebar({ ...props }) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-slate-700/50 bg-slate-900">
            <SidebarHeader className={`border-b border-slate-700/50 p-3 ${isCollapsed ? 'flex items-center justify-center' : ''}`}>
                <SidebarMenu>
                    <SidebarMenuItem className={isCollapsed ? 'flex justify-center' : ''}>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className={`hover:bg-white/5 ${isCollapsed ? 'justify-center px-0' : ''}`}
                            tooltip="CampusConnect"
                        >
                            <a href="/home" className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                                <div className="flex-shrink-0 h-10 w-10 rounded-xl overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                {!isCollapsed && (
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-xl text-white truncate">
                                            CampusConnect
                                        </span>
                                        <span className="text-xs text-cyan-400 flex items-center gap-1 truncate">

                                        </span>
                                    </div>
                                )}
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="px-2 py-2">
                <SidebarGroup>
                    {!isCollapsed && (
                        <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-500 px-3 py-2">
                            Navigation
                        </SidebarGroupLabel>
                    )}
                    <SidebarGroupContent>
                        <NavMain />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    {!isCollapsed && (
                        <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-500 px-3 py-2">
                            Connection
                        </SidebarGroupLabel>
                    )}
                    <SidebarGroupContent>
                        <NavConnection />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className={`border-t border-slate-700/50 p-2 ${isCollapsed ? 'flex items-center justify-center' : ''}`}>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
