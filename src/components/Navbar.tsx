"use client";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { AccountCircle, AdminPanelSettings, ExpandMore, Logout } from "@mui/icons-material";
import { AppBar, Box, Button, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { signOut, user, isAdmin } = useAuth();
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const [categoryAnchors, setCategoryAnchors] = useState<Record<string, HTMLElement | null>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      const { data: subcategoriesData } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');
      
      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
    };
    
    fetchCategories();
  }, []);

  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserClose = () => {
    setUserAnchorEl(null);
  };

  const handleCategoryClick = (event: React.MouseEvent<HTMLElement>, categoryId: string) => {
    setCategoryAnchors({ ...categoryAnchors, [categoryId]: event.currentTarget });
  };

  const handleCategoryClose = (categoryId: string) => {
    setCategoryAnchors({ ...categoryAnchors, [categoryId]: null });
  };

  const handleLogout = () => {
    handleUserClose();
    signOut();
  };

  const getGreeting = () => {
    if (user?.user_metadata?.full_name) {
      const firstName = user.user_metadata.full_name.split(' ')[0];
      return `Olá, ${firstName}`;
    }
    return `Olá, ${user?.email}`;
  };

  const getCategorySubcategories = (categoryId: string) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#0A2540' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ mr: 4 }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
            Gerador de Documentos
          </Link>
        </Typography>
        
        {/* Categories Navigation */}
        {user && categories.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {categories.map((category) => {
              const categorySubcategories = getCategorySubcategories(category.id);
              
              return (
                <Box key={category.id}>
                  <Button
                    color="inherit"
                    endIcon={categorySubcategories.length > 0 ? <ExpandMore /> : null}
                    onClick={(e) => {
                      if (categorySubcategories.length > 0) {
                        handleCategoryClick(e, category.id);
                      } else {
                        window.location.href = `/dashboard?category=${category.id}`;
                      }
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    {category.name}
                  </Button>
                  
                  {categorySubcategories.length > 0 && (
                    <Menu
                      anchorEl={categoryAnchors[category.id]}
                      open={Boolean(categoryAnchors[category.id])}
                      onClose={() => handleCategoryClose(category.id)}
                    >
                      <Link 
                        href={`/dashboard?category=${category.id}`} 
                        passHref 
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <MenuItem onClick={() => handleCategoryClose(category.id)}>
                          Todos de {category.name}
                        </MenuItem>
                      </Link>
                      {categorySubcategories.map((subcategory) => (
                        <Link 
                          key={subcategory.id}
                          href={`/dashboard?category=${category.id}&subcategory=${subcategory.id}`} 
                          passHref 
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <MenuItem onClick={() => handleCategoryClose(category.id)}>
                            {subcategory.name}
                          </MenuItem>
                        </Link>
                      ))}
                    </Menu>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box display="flex" alignItems="center" gap={2}>
          {user ? (
            <>
              <Button
                onClick={handleUserMenu}
                color="inherit"
                startIcon={<AccountCircle />}
                sx={{ textTransform: 'none', fontSize: '1rem' }}
              >
                {getGreeting()}
              </Button>
              <Menu
                id="menu-appbar"
                anchorEl={userAnchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(userAnchorEl)}
                onClose={handleUserClose}
              >
                {isAdmin && (
                  <Link href="/admin/dashboard" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem onClick={handleUserClose}>
                      <AdminPanelSettings sx={{ mr: 1, color: 'text.secondary' }} />
                      Admin
                    </MenuItem>
                  </Link>
                )}
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1, color: 'text.secondary' }} />
                  Sair
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Link href="/login" passHref>
              <Button variant="contained" color="primary">
                Entrar
              </Button>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
