export default function UserNotRegisteredError({ message = "The Odoo engine is not configured on the server yet." }) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
      <p className="font-semibold">Configuration required</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
