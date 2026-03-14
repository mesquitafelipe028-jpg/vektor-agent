import { getExpenseCategoryIcon, getRevenueCategoryIcon, expenseCategories, revenueCategories, type TransactionType } from "@/lib/categories";
import { useCategories, toCategoryMeta, type CategoriaDB } from "@/hooks/useCategories";
import { useMemo } from "react";

interface CategoryIconProps {
  category: string | null;
  type: TransactionType;
  size?: number;
}

export function CategoryIcon({ category, type, size = 36 }: CategoryIconProps) {
  const { categories } = useCategories();

  // Flatten hierarchy: parents + all subcategorias
  const allCats = useMemo(() => {
    const flat: CategoriaDB[] = [];
    categories.forEach((cat) => {
      flat.push(cat);
      cat.subcategorias?.forEach((sub) => flat.push(sub));
    });
    return flat;
  }, [categories]);

  // Try to find in DB first
  const dbCat = useMemo(
    () => allCats.find((c) => c.nome === category),
    [allCats, category]
  );

  let Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  let bg: string;
  let text: string;

  if (dbCat) {
    const meta = toCategoryMeta(dbCat);
    Icon = meta.icon;
    bg = meta.bg;
    text = meta.color;
  } else {
    // Fallback to hardcoded arrays
    Icon = type === "receita"
      ? getRevenueCategoryIcon(category)
      : getExpenseCategoryIcon(category);

    const catList = type === "receita" ? revenueCategories : expenseCategories;
    const meta = catList.find((c) => c.name === category);
    bg = meta?.bg ?? (type === "receita" ? "bg-emerald-500/20" : "bg-red-500/20");
    text = meta?.color ?? (type === "receita" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400");
  }

  const iconSize = size * 0.44;

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${bg}`}
      style={{ width: size, height: size }}
    >
      <Icon className={text} style={{ width: iconSize, height: iconSize }} />
    </div>
  );
}
