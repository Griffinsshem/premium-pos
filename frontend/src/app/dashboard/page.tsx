export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Premium POS Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome back. Here’s an overview of your system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-xl p-6 border">
          <h2 className="text-lg font-semibold text-gray-700">Total Products</h2>
          <p className="text-3xl font-bold mt-4 text-gray-900">--</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border">
          <h2 className="text-lg font-semibold text-gray-700">Low Stock Items</h2>
          <p className="text-3xl font-bold mt-4 text-gray-900">--</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border">
          <h2 className="text-lg font-semibold text-gray-700">Total Sales</h2>
          <p className="text-3xl font-bold mt-4 text-gray-900">--</p>
        </div>
      </div>

    </div>
  );
}