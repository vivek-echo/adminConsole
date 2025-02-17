import { Injectable } from '@angular/core';

// Define the structure of the MenuItem interface
interface MenuItem {
  pl_links: { pl_path: string; pl_tab: any }[];
  gl_path?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TabNavigationServiceService {
  private firstTabPathCache: { [key: string]: string | undefined } = {};
  private sessionNavData: MenuItem[] = [];

  constructor() {
    // Initialize sessionNavData from session storage if available
    const navData = sessionStorage.getItem('userMenus');
    this.sessionNavData = navData ? JSON.parse(navData) : [];
    if (!navData) {
      console.log("No data found in session storage for 'userMenus'");
    }
  }

  /**
   * Retrieve tab links for a specific path
   * @param path - The path for which tab links are requested
   * @returns Array of tab links or null if not found
   */
  getTabLinks(path: string): any[] | null {
    return this.findLink(path)?.pl_tab || null;
  }

  /**
   * Retrieve primary links for a specific path
   * @param path - The path for which primary links are requested
   * @returns Primary link object or null if not found
   */
  getPrimaryLinks(path: string) {
    return this.findLink(path);
  }

  /**
   * Retrieve global menu data for a specific path
   * @param path - The path for which global menu data is requested
   * @returns MenuItem object or null if not found
   */
  getGlobalMenuData(path: string): MenuItem | null {
    return this.findGlobalLink(path);
  }

  /**
   * Helper function to find a link in sessionNavData by path
   * @param path - The path to search for in sessionNavData
   * @returns Link object if found, otherwise null
   */
  private findLink(path: string): { pl_path: string; pl_tab: any } | null {
    for (const item of this.sessionNavData) {
      const link = item.pl_links.find(link => link.pl_path === path);
      if (link) return link;
    }
    return null;
  }

  /**
   * Helper function to find global menu data in sessionNavData by path
   * @param path - The global path to search for in sessionNavData
   * @returns MenuItem object if found, otherwise null
   */
  private findGlobalLink(path: string): MenuItem | null {
    return this.sessionNavData.find(item => item.gl_path === path) || null;
  }

 
}
