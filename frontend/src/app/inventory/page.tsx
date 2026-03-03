export default function InventoryPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-gray-500 mt-2">
          Manage your products, stock levels, and pricing.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-xl p-6 border">
        <p className="text-gray-900">
          Product table will appear here.
        </p>
      </div>
    </div>
  );
}