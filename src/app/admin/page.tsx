export default function AdminPage() {
  return (
    <div className="container py-24 min-h-screen">
      <div className="glass-panel p-8 md:p-12 animate-fade-up">
        <h1 className="text-3xl font-bold mb-4 uppercase tracking-tighter">Dealer Command Center</h1>
        <p className="text-platinum-dim mb-8">Executive oversight and inventory management.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-tertiary-bg rounded-xl border border-glass-border">
            <h4 className="font-bold mb-2">Inventory Audit</h4>
            <p className="text-sm text-platinum-dim">Review and approve pending listings.</p>
          </div>
          <div className="p-6 bg-tertiary-bg rounded-xl border border-glass-border">
            <h4 className="font-bold mb-2">Lead Analytics</h4>
            <p className="text-sm text-platinum-dim">Monitor conversion rates and buyer interest.</p>
          </div>
          <div className="p-6 bg-tertiary-bg rounded-xl border border-glass-border">
            <h4 className="font-bold mb-2">Member Verification</h4>
            <p className="text-sm text-platinum-dim">Authenticate new high-value collectors.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
