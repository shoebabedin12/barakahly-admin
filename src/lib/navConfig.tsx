import {
  IconArchiveBox,
  IconArrowsPointingOut,
  IconBanknotes,
  IconBookmark,
  IconChartBar,
  IconCog6Tooth,
  IconCreditCard,
  IconCube,
  IconDocumentChartBar,
  IconEnvelope,
  IconNewspaper,
  IconPhoto,
  IconRectangleStack,
  IconShoppingBag,
  IconSparkles,
  IconShoppingCart,
  IconSwatch,
  IconTag,
  IconTicket,
  IconTruck,
  IconUserGroup,
  IconUsers,
} from "../icons";

export interface NavLeaf {
  title: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavGroup {
  title: string;
  children: NavLeaf[];
  superAdminOnly?: boolean;
}

// Mirrors config/admin.php in the Laravel app - same grouping, order, and icons.
export const navGroups: NavGroup[] = [
  {
    title: "Catalog",
    children: [
      { title: "Categories", to: "/categories", icon: IconTag },
      { title: "Landing Pages", to: "/landing-pages", icon: IconSparkles },
      { title: "Brands", to: "/brands", icon: IconBookmark },
      { title: "Products", to: "/products", icon: IconCube },
      { title: "Colors", to: "/colors", icon: IconSwatch },
      { title: "Sizes", to: "/sizes", icon: IconArrowsPointingOut },
    ],
  },
  {
    title: "Inventory",
    children: [
      { title: "Suppliers", to: "/suppliers", icon: IconTruck },
      { title: "Purchases", to: "/purchases", icon: IconShoppingCart },
      { title: "Investments", to: "/investments", icon: IconBanknotes },
    ],
  },
  {
    title: "Sales",
    children: [
      { title: "Orders", to: "/orders", icon: IconShoppingBag },
      { title: "Customers", to: "/customers", icon: IconUsers },
      { title: "Coupons", to: "/coupons", icon: IconTicket },
      { title: "Reviews", to: "/reviews", icon: IconArchiveBox },
      { title: "Newsletter", to: "/newsletter", icon: IconEnvelope },
    ],
  },
  {
    title: "Management",
    children: [
      { title: "Shipping Zones", to: "/shipping-zones", icon: IconTruck },
      { title: "Payment Methods", to: "/payment-methods", icon: IconCreditCard },
      { title: "Banners", to: "/banners", icon: IconPhoto },
      { title: "Blog Posts", to: "/blog", icon: IconNewspaper },
      { title: "Settings", to: "/settings", icon: IconCog6Tooth },
    ],
  },
  {
    title: "Reports",
    children: [{ title: "Sales Report", to: "/reports/sales", icon: IconDocumentChartBar }],
  },
  {
    title: "Administrators",
    superAdminOnly: true,
    children: [
      { title: "Staff Users", to: "/users", icon: IconUserGroup },
      { title: "Roles & Permissions", to: "/roles", icon: IconRectangleStack },
      { title: "Activity Log", to: "/activity-log", icon: IconChartBar },
    ],
  },
];

/** Every route this config points at that doesn't have a real page yet -
 * used to wire a shared "coming soon" placeholder for each. */
export const notYetBuiltRoutes = navGroups
  .flatMap((g) => g.children)
  .map((c) => c.to)
  .filter(
    (to) =>
      ![
        "/categories",
        "/brands",
        "/products",
        "/colors",
        "/sizes",
        "/orders",
        "/customers",
        "/coupons",
        "/reviews",
        "/shipping-zones",
        "/payment-methods",
        "/banners",
        "/settings",
      ].includes(to),
  );
