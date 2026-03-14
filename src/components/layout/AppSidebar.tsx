import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Target,
  Activity,
  CreditCard,
  Wallet,
  Search,
  Clock,
  Tag,
  Calculator,
  ClipboardList,
  Plus,
  Briefcase,
  Upload,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { LogoVektor } from "@/components/branding/LogoVektor";
import { useLocation, useNavigate } from "react-router-dom";
import { memo, useCallback, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const quickActions = [
  { title: "Nova Receita", url: "/receitas/nova", icon: TrendingUp },
  { title: "Nova Despesa", url: "/despesas/nova", icon: TrendingDown },
  { title: "Novo Cliente", url: "/clientes/novo", icon: Users },
];

const menuGroups = [
  {
    label: "Visão Geral",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Fluxo de Caixa", url: "/fluxo-de-caixa", icon: ArrowLeftRight },
      { title: "Timeline", url: "/timeline", icon: Clock },
    ],
  },
  {
    label: "Finanças",
    items: [
      { title: "Receitas", url: "/receitas", icon: TrendingUp },
      { title: "Despesas", url: "/despesas", icon: TrendingDown },
      { title: "Contas", url: "/contas", icon: Wallet },
      { title: "Cartões", url: "/cartoes", icon: CreditCard },
      { title: "Clientes", url: "/clientes", icon: Users },
      { title: "Cobranças", url: "/contas-a-receber", icon: ClipboardList },
    ],
  },
  {
    label: "Investimentos",
    items: [
      { title: "Simulador", url: "/calculadora-investimentos", icon: Calculator },
    ],
  },
  {
    label: "Planejamento",
    items: [
      { title: "Metas", url: "/metas", icon: Target },
      { title: "Projetos", url: "/projetos", icon: Briefcase },
      { title: "Análise Financeira", url: "/analise-financeira", icon: Activity },
      { title: "Assinaturas", url: "/assinaturas", icon: Receipt },
      { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
    ],
  },
  {
    label: "Fiscal",
    items: [
      { title: "Área Fiscal", url: "/impostos", icon: Receipt },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "Importar Extrato", url: "/importar-extrato", icon: Upload },
      { title: "Categorias", url: "/categorias", icon: Tag },
      { title: "Configurações", url: "/configuracoes", icon: Settings },
    ],
  },
];

// Flatten all items for search
const allItems = [
  ...quickActions.map((a) => ({ ...a, group: "Ações Rápidas" })),
  ...menuGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label }))),
];

interface SidebarNavItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
}

const SidebarNavItem = memo(({ title, url, icon: Icon, isActive }: SidebarNavItemProps) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild isActive={isActive}>
      <NavLink to={url} end activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
        <Icon className="mr-2 h-4 w-4" />
        <span className="group-data-[collapsible=icon]:hidden">{title}</span>
      </NavLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
));
SidebarNavItem.displayName = "SidebarNavItem";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [search, setSearch] = useState("");

  const isActive = useCallback(
    (path: string) => location.pathname === path.split("?")[0],
    [location.pathname]
  );

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate("/login");
  }, [signOut, navigate]);

  // Filter items based on search
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase().trim();
    return allItems.filter((item) => item.title.toLowerCase().includes(q));
  }, [search]);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="gap-0">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-sidebar-border">
          <LogoVektor size={collapsed ? "sm" : "md"} showText={!collapsed} textClassName="text-sidebar-primary-foreground" />
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-sidebar-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-foreground/50" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus-visible:ring-sidebar-ring"
              />
            </div>
          </div>
        )}

        {/* Search results */}
        {searchResults ? (
          <SidebarGroup>
            <SidebarGroupLabel>Resultados</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {searchResults.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-sidebar-foreground/50">Nenhum resultado</p>
                ) : (
                  searchResults.map((item) => (
                    <SidebarNavItem
                      key={item.url}
                      title={item.title}
                      url={item.url}
                      icon={item.icon}
                      isActive={isActive(item.url)}
                    />
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            {/* Quick Actions */}
            <SidebarGroup>
              <SidebarGroupLabel>Ações Rápidas</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {quickActions.map((action) => (
                    <SidebarMenuItem key={action.url}>
                      <SidebarMenuButton
                        onClick={() => navigate(action.url)}
                        className="text-sidebar-primary hover:bg-sidebar-primary/10 hover:text-sidebar-primary"
                      >
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        <span className="group-data-[collapsible=icon]:hidden text-xs font-medium">
                          {action.title}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Menu Groups */}
            {menuGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarNavItem
                        key={item.url}
                        title={item.title}
                        url={item.url}
                        icon={item.icon}
                        isActive={isActive(item.url)}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}

            {/* Conta */}
            <SidebarGroup>
              <SidebarGroupLabel>Conta</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Sair</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
