
import { api } from "~/utils/api";
import Link from "next/link";

export const Navbar = () => {
  const { data: categories } = api.categories.getAll.useQuery();

  return (
    <div className="flex top-10 bg-slate-700 shadow-md z-50 w-full p-3">
      <ul className="space-x-3 flex container mx-auto max-w-4xl">
        {categories?.map((category) => (
          <li className="inline"><Link href={`/category/${category.name}`}>{category.name}</Link></li>
        ))}
      </ul>
    </div>
  );
}

