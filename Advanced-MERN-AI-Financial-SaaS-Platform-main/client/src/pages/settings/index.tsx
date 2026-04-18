import PageLayout from "@/components/page-layout";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/authSlice";
import { useLogoutMutation } from "@/features/auth/authAPI";
import { LogOut } from "lucide-react";

interface ItemPropsType {
  items: {
    title: string;
    href: string;
  }[];
}

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApi, { isLoading }] = useLogoutMutation();

  const sidebarNavItems = [
    { title: "Account", href: PROTECTED_ROUTES.SETTINGS },
    { title: "Appearance", href: PROTECTED_ROUTES.SETTINGS_APPEARANCE },
    { title: "Billings", href: PROTECTED_ROUTES.SETTINGS_BILLING },
  ];

  const handleLogout = async () => {
    await logoutApi();
    dispatch(logout());
    navigate("/login");
  };

  return (
    <PageLayout
      title="Settings"
      subtitle="Manage your account settings and set e-mail preferences."
      addMarginTop
    >
      <Card className="border shadow-none">
        <CardContent>
          <div
            className="flex flex-col space-y-8 lg:flex-row lg:space-x-12
         lg:space-y-0 pb-10 pt-2"
          >
            <aside className="mr-4 lg:w-1/5">
              <SidebarNav items={sidebarNavItems} />
              <div className="mt-8 pt-8 border-t">
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                  disabled={isLoading}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoading ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </aside>
            {/* <Separator orientation="vertical" className=" !h-[500px] !border-gray-200" /> */}
            <div className="flex-1 lg:max-w-2xl">
              <Outlet />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

function SidebarNav({ items }: ItemPropsType) {
  const { pathname } = useLocation();
  return (
    <nav className={"flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1"}>
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

export default Settings;