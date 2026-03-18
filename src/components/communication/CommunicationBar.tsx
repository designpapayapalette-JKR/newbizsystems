"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { encodeWhatsAppMessage, encodeEmailLink, encodeSmsLink } from "@/lib/utils";
import { Phone, Mail, MessageCircle, MessageSquare } from "lucide-react";

interface CommunicationBarProps {
  name: string;
  phone?: string | null;
  email?: string | null;
  compact?: boolean;
}

export function CommunicationBar({ name, phone, email, compact = false }: CommunicationBarProps) {
  const defaultMsg = `Hi ${name}, `;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {phone && (
          <>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Call">
              <a href={`tel:${phone}`}>
                <Phone className="h-4 w-4 text-blue-600" />
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="WhatsApp">
              <a href={encodeWhatsAppMessage(phone, defaultMsg)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 text-green-600" />
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="SMS">
              <a href={encodeSmsLink(phone, defaultMsg)}>
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </a>
            </Button>
          </>
        )}
        {email && (
          <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Email">
            <a href={encodeEmailLink(email, `Following up - ${name}`)}>
              <Mail className="h-4 w-4 text-orange-600" />
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Mobile: large primary buttons */}
      {phone && (
        <div className="grid grid-cols-2 gap-2 md:hidden">
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
            <a href={encodeWhatsAppMessage(phone, defaultMsg)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" />
              WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
            <a href={`tel:${phone}`}>
              <Phone className="h-5 w-5 mr-2" />
              Call
            </a>
          </Button>
        </div>
      )}

      {/* All buttons row (desktop always, mobile secondary) */}
      <div className="flex flex-wrap gap-2">
        {phone && (
          <>
            <Button asChild variant="outline" className="hidden md:inline-flex gap-2">
              <a href={`tel:${phone}`}>
                <Phone className="h-4 w-4 text-blue-600" />
                Call
              </a>
            </Button>
            <Button asChild variant="outline" className="hidden md:inline-flex gap-2">
              <a href={encodeWhatsAppMessage(phone, defaultMsg)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 text-green-600" />
                WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <a href={encodeSmsLink(phone, defaultMsg)}>
                <MessageSquare className="h-4 w-4 text-purple-600" />
                SMS
              </a>
            </Button>
          </>
        )}
        {email && (
          <Button asChild variant="outline" className="gap-2">
            <a href={encodeEmailLink(email, `Following up - ${name}`, `Hi ${name},\n\n`)}>
              <Mail className="h-4 w-4 text-orange-600" />
              Email
            </a>
          </Button>
        )}
        {!phone && !email && (
          <p className="text-sm text-muted-foreground">No contact info — add phone or email to this lead.</p>
        )}
      </div>
    </div>
  );
}
