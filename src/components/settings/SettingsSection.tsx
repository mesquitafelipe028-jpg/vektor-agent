import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type ReactNode, Children } from "react";

interface SettingsSectionProps {
  icon?: LucideIcon;
  title: string;
  children: ReactNode;
  index?: number;
}

export function SettingsSection({ icon: Icon, title, children, index = 0 }: SettingsSectionProps) {
  const childArray = Children.toArray(children);

  return (
    <Card
      className="animate-[fadeSlideIn_0.3s_ease_both]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {childArray.map((child, i) => (
          <div key={i}>
            {i > 0 && <Separator className="my-1" />}
            {child}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
