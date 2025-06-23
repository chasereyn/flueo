import { AppSidebar } from "@/app/app-sidebar"
import { DataTable } from "@/app/dashboard/data-table"
import { SectionCards } from "@/app/dashboard/section-cards"
import { SiteHeader } from "@/app/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function Page() {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Optionally redirect or show a message
    return <div>Please log in.</div>;
  }

  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return <div>Error loading cards: {error.message}</div>;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <DataTable cards={cards} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
