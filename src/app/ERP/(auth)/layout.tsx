export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* abstract pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\' fill=\'%23ffffff\' fill-opacity=\'1\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 flex items-center gap-2">
          <img src="/logo-full.png" alt="NewBiz Systems" className="h-9 w-auto min-w-[120px] brightness-0 invert" />
        </div>
        
        <div className="relative z-10 max-w-lg">
          <blockquote className="space-y-4">
            <p className="text-3xl font-medium text-white/90 leading-snug">
              "The most intuitive ERP for Indian SMEs — manage leads, HR, GST invoicing, and payments all from one dashboard."
            </p>
            <footer className="text-base font-medium text-zinc-400">
              — NewBiz Systems Team
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right side - the form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[380px]">
          {/* Mobile branding */}
          <div className="flex lg:hidden items-center gap-2 mb-10 justify-center">
            <img src="/logo-full.png" alt="NewBiz Systems" className="h-8 w-auto min-w-[120px]" />
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
