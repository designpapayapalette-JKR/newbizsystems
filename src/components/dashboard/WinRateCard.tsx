import { Card, CardContent } from "@/components/ui/card";

interface WinRateCardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}

export function WinRateCard({ label, value, sub, color, bg }: WinRateCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}
