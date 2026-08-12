import raw from '@/data/menu.json';

export type MenuDay = {
  date: string;
  main: string;
  vegetarian: string;
  sides?: string[];
};

export type MenuData = {
  school: string;
  source: {
    pdfUrl: string;
    listPageUrl: string;
    updatedAt: string;
  };
  days: MenuDay[];
};

export const menuData: MenuData = raw as MenuData;

export function findDay(iso: string): MenuDay | null {
  return menuData.days.find((d) => d.date === iso) ?? null;
}
