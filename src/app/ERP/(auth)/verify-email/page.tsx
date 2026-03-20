import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Check your inbox</h2>
          <p className="text-muted-foreground text-sm mb-6">
            We sent you a verification link. Click it to activate your account and get started.
          </p>
          <Link href="/ERP/login" className="text-sm text-primary hover:underline">
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
