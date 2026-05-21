"use client";

import { createContext, useContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface SidebarContextType {
    isSidebarCollapsed: boolean;
    setSidebarCollapsed: (val: boolean) => void;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a Providers component");
    }
    return context;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                refetchOnWindowFocus: false,
            },
        },
    }));

    const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

    return (
        <QueryClientProvider client={queryClient}>
            <SidebarContext.Provider value={{ isSidebarCollapsed, setSidebarCollapsed, toggleSidebar }}>
                {children}
            </SidebarContext.Provider>
        </QueryClientProvider>
    );
}
