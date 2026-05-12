"use client";

type SecondaryTitleProps = {
  title: string;
  className?: string;
  lastShapeClassName?: string;
};

export default function SecondaryTitle({
  title,
  className = "",
  lastShapeClassName = "bg-black",
}: SecondaryTitleProps) {
  return (
    <p className={`inline-flex items-center gap-2 font-semibold text-brand-600 ${className}`}>
      <span className="inline-flex items-center gap-0">
        <span
          className="inline-block h-[13px] w-4 bg-brand-500"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
        />
        <span
          className="inline-block h-[13px] w-[10px] bg-brand-500"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
        />
        <span
          className="inline-block h-[13px] w-[10px] bg-brand-500"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
        />
        <span
          className={`inline-block h-[13px] w-[10px] ${lastShapeClassName}`}
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
        />
      </span>
      {title}
    </p>
  );
}
