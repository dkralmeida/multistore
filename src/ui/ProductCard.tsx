"use client";
import Image from "next/image";

export default function ProductCard({
  title,
  image,
  excerpt,
  affiliateUrl,
  networkLabel,
}: {
  title: string;
  image: string;
  excerpt?: string;
  affiliateUrl: string;
  networkLabel: string;
}) {
  const onClick = () => {
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="group border rounded-xl overflow-hidden bg-white shadow-soft flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 600px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-3 flex-1 flex flex-col gap-2">
        <h3 className="font-semibold leading-tight line-clamp-2">{title}</h3>
        {excerpt && <p className="text-sm text-neutral-600 line-clamp-2">{excerpt}</p>}
        <div className="mt-auto">
          <button
            onClick={onClick}
            rel="nofollow sponsored"
            className="w-full h-10 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition"
          >
            {networkLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
