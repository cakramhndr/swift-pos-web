import fs from "fs";

const pages = ["Transactions.jsx", "Inventory.jsx", "Customers.jsx", "Reports.jsx"];

pages.forEach((f) => {
  let c = fs.readFileSync("src/pages/" + f, "utf8");
  const before = c;

  // Fix table row hover: hover:bg-violet-50 -> hover:bg-gray-100
  c = c.replace(
    /hover:bg-violet-50 dark:hover:bg-gray-700\/50/g,
    "hover:bg-gray-100 dark:hover:bg-gray-700/50"
  );

  // Fix inputs/search with border-border dark:border-gray-700 -> add dark:bg-gray-700 etc
  c = c.replace(
    /border border-\[#ececf2\] dark:border-gray-700 py-2\.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100/g,
    "border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:text-white dark:placeholder-gray-400"
  );

  c = c.replace(
    /border border-\[#ececf2\] dark:border-gray-700 px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100(?! cursor-pointer)/g,
    "border border-[#ececf2] dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
  );

  c = c.replace(
    /border border-\[#ececf2\] dark:border-gray-700 px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer/g,
    "border border-[#ececf2] dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer dark:bg-gray-700 dark:text-white"
  );

  c = c.replace(
    /border border-\[#ececf2\] dark:border-gray-700 px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer/g,
    "border border-[#ececf2] dark:border-gray-600 px-4 py-3 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer dark:bg-gray-700 dark:text-white"
  );

  // Fix selects in InventoryLogs (bg-white table)
  c = c.replace(
    /rounded-2xl border border-\[#ececf2\] px-4 py-2\.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer bg-white dark:bg-gray-700/g,
    "rounded-2xl border border-[#ececf2] dark:border-gray-600 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer bg-white dark:bg-gray-700 dark:text-white"
  );

  if (c !== before) {
    fs.writeFileSync("src/pages/" + f, c);
    console.log("Fixed:", f);
  }
});

// Fix InventoryLogs (not in the 5 but has issue)
try {
  let il = fs.readFileSync("src/pages/InventoryLogs.jsx", "utf8");
  const ilb = il;
  il = il.replace(
    /border border-\[#ececf2\] dark:border-gray-700 py-2\.5 pl-10 pr-4 text-sm outline-none/,
    "border border-[#ececf2] dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 pl-10 pr-4 text-sm outline-none dark:text-white dark:placeholder-gray-400"
  );
  if (il !== ilb) {
    fs.writeFileSync("src/pages/InventoryLogs.jsx", il);
    console.log("Fixed: InventoryLogs.jsx");
  }
} catch (e) {
  console.log("Error with InventoryLogs:", e.message);
}

console.log("Done!");