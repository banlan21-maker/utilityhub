export default function AdvertisementSlot({ type = 'display' }: { type?: 'display' | 'in-feed' | 'subscription' }) {
  return (
    <div 
      className="glass-panel" 
      style={{ 
        width: '100%', 
        minHeight: type === 'display' ? '90px' : '250px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        margin: '2rem 0',
        border: '1px dashed var(--border)',
        backgroundColor: 'rgba(0,0,0,0.02)'
      }}
    >
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {type === 'subscription' 
          ? '[Premium Feature - Stripe Integration Placeholder]' 
          : '[AdSense Slot Placeholder]'}
      </span>
    </div>
  );
}
