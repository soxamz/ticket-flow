interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="text-muted-foreground text-sm md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
