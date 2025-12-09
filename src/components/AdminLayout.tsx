"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ArrowBack, Category, Dashboard, Description, Logout, People } from "@mui/icons-material";
import { AppBar, Box, CircularProgress, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const drawerWidth = 240;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <Dashboard />,
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      key: "/admin/templates",
      icon: <Description />,
      label: "Templates",
      href: "/admin/templates",
    },
    {
      key: "/admin/categories",
      icon: <Category />,
      label: "Categorias",
      href: "/admin/categories",
    },
    {
      key: "/admin/users",
      icon: <People />,
      label: "Usuários",
      href: "/admin/users",
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.key} disablePadding>
                <Link href={item.href} passHref style={{ width: '100%', textDecoration: 'none', color: 'inherit' }}>
                  <ListItemButton selected={pathname === item.href}>
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <Link href="/" passHref style={{ width: '100%', textDecoration: 'none', color: 'inherit' }}>
                <ListItemButton>
                  <ListItemIcon>
                    <ArrowBack />
                  </ListItemIcon>
                  <ListItemText primary="Voltar ao Site" />
                </ListItemButton>
              </Link>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={signOut}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Sair" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
