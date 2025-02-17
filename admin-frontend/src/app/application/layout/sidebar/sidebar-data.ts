import { NavItem } from './nav-item/nav-item';

// Retrieve data from session storage
const userMenus = JSON.parse(sessionStorage.getItem('userMenus') || '[]');

// Function to transform userMenus into SideBarData without tabs
const transformToNavItem = (menuData: any[]): NavItem[] => {
  return menuData.map((menu) => ({
    displayName: menu.gl_name,
    iconName: menu.gl_class,
    route: menu.gl_path,
    children: menu.pl_links.map((pl:any) => ({
      displayName: pl.pl_name,
      iconName: pl.pl_class, // Optional: No direct mapping for iconName in pl_links
      route: pl.pl_path,
    })),
  }));
};

// Add 'Dashboard' as the first item
export const SideBarData: NavItem[] = [
  {
    displayName: 'Dashboard',
    iconName: 'fa-solid fa-house-laptop',
    route: '/console/dashboard',
    children:[]
  },
  ...transformToNavItem(userMenus), // Add the transformed menu data
];

