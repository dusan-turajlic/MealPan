import ErrorCard from "@/components/ErrorCard";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <ErrorCard
        title="Page not found"
        message="Check the address and try again."
        backLabel="Back to home"
        backHref="/en"
      />
    </div>
  );
}
