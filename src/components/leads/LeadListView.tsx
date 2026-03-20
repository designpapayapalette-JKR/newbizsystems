"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatRelative } from "@/lib/utils";
import type { Lead } from "@/types";
import { Phone, Mail, MessageCircle, Building2, Calendar } from "lucide-react";
import { encodeWhatsAppMessage } from "@/lib/utils";

interface LeadListViewProps {
  leads: Lead[];
}

export function LeadListView({ leads }: LeadListViewProps) {
  if (leads.length === 0) return null;

  return (
    <div className="space-y-2 px-4 py-2">
      {leads.map((lead) => (
        <div key={lead.id} className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/ERP/leads/${lead.id}`} className="font-medium text-sm hover:text-primary">
                {lead.name}
              </Link>
              {lead.stage && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ background: lead.stage.color }} />
                  <span className="text-muted-foreground">{lead.stage.name}</span>
                </span>
              )}
            </div>
            {lead.company && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Building2 className="h-3 w-3" />
                {lead.company}
              </div>
            )}
            {lead.next_followup_at && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Follow-up: {formatRelative(lead.next_followup_at)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lead.deal_value && (
              <span className="text-sm font-semibold text-green-700">{formatCurrency(lead.deal_value)}</span>
            )}
            <div className="flex gap-1">
              {lead.phone && (
                <>
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <a href={`tel:${lead.phone}`} title="Call">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <a href={encodeWhatsAppMessage(lead.phone, `Hi ${lead.name}!`)} target="_blank" rel="noopener" title="WhatsApp">
                      <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                    </a>
                  </Button>
                </>
              )}
              {lead.email && (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <a href={`mailto:${lead.email}`} title="Email">
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
