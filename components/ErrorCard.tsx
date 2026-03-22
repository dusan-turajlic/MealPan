import Link from "next/link";

interface Props {
  title: string;
  message: string;
  backLabel: string;
  backHref?: string;
}

export default function ErrorCard({ title, message, backLabel, backHref = "/" }: Props) {
  return (
    <div className="bg-surface border border-rule rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
      <div className="text-4xl">🍽️</div>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="text-dim text-sm">{message}</p>
      <Link
        href={backHref}
        className="inline-block mt-2 text-accent hover:text-accent/80 text-sm underline"
      >
        {backLabel}
      </Link>
    </div>
  );
}
