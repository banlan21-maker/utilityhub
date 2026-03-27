'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import SeoSection from '@/app/components/SeoSection';

// Fish Database
interface Fish {
  id: string;
  name: string;
  nameEn: string;
  bioloadPerFish: number;
  minTankSize: number;
  tempRange: [number, number];
  temperament: 'peaceful' | 'aggressive' | 'semi-aggressive';
  minSchooling: number;
  imageEmoji: string;
}

const FISH_DATABASE: Fish[] = [
  { id: 'guppy', name: '구피', nameEn: 'Guppy', bioloadPerFish: 4, minTankSize: 20, tempRange: [22, 28], temperament: 'peaceful', minSchooling: 1, imageEmoji: '🐠' },
  { id: 'neon-tetra', name: '네온테트라', nameEn: 'Neon Tetra', bioloadPerFish: 2, minTankSize: 40, tempRange: [20, 26], temperament: 'peaceful', minSchooling: 6, imageEmoji: '🐟' },
  { id: 'corydoras', name: '코리도라스', nameEn: 'Corydoras', bioloadPerFish: 5, minTankSize: 40, tempRange: [22, 26], temperament: 'peaceful', minSchooling: 3, imageEmoji: '🐡' },
  { id: 'ancistrus', name: '안시', nameEn: 'Ancistrus', bioloadPerFish: 20, minTankSize: 80, tempRange: [20, 28], temperament: 'peaceful', minSchooling: 1, imageEmoji: '🐟' },
  { id: 'betta', name: '베타', nameEn: 'Betta', bioloadPerFish: 8, minTankSize: 20, tempRange: [24, 28], temperament: 'aggressive', minSchooling: 1, imageEmoji: '🐠' },
  { id: 'tiger-barb', name: '수마트라', nameEn: 'Tiger Barb', bioloadPerFish: 6, minTankSize: 60, tempRange: [23, 27], temperament: 'semi-aggressive', minSchooling: 6, imageEmoji: '🐟' },
  { id: 'angelfish', name: '엔젤피시', nameEn: 'Angelfish', bioloadPerFish: 15, minTankSize: 150, tempRange: [24, 28], temperament: 'semi-aggressive', minSchooling: 1, imageEmoji: '🐠' },
  { id: 'molly', name: '몰리', nameEn: 'Molly', bioloadPerFish: 8, minTankSize: 40, tempRange: [24, 28], temperament: 'peaceful', minSchooling: 1, imageEmoji: '🐟' },
  { id: 'platy', name: '플래티', nameEn: 'Platy', bioloadPerFish: 6, minTankSize: 40, tempRange: [20, 26], temperament: 'peaceful', minSchooling: 1, imageEmoji: '🐠' },
  { id: 'goldfish', name: '금붕어', nameEn: 'Goldfish', bioloadPerFish: 40, minTankSize: 150, tempRange: [18, 24], temperament: 'peaceful', minSchooling: 1, imageEmoji: '🐡' },
  { id: 'zebra-danio', name: '제브라 다니오', nameEn: 'Zebra Danio', bioloadPerFish: 3, minTankSize: 40, tempRange: [18, 24], temperament: 'peaceful', minSchooling: 6, imageEmoji: '🐟' },
  { id: 'cherry-shrimp', name: '체리새우', nameEn: 'Cherry Shrimp', bioloadPerFish: 0.5, minTankSize: 10, tempRange: [20, 26], temperament: 'peaceful', minSchooling: 5, imageEmoji: '🦐' },
  { id: 'rasbora', name: '라스보라', nameEn: 'Rasbora', bioloadPerFish: 2, minTankSize: 40, tempRange: [22, 26], temperament: 'peaceful', minSchooling: 8, imageEmoji: '🐠' },
  { id: 'discus', name: '디스커스', nameEn: 'Discus', bioloadPerFish: 40, minTankSize: 200, tempRange: [26, 30], temperament: 'peaceful', minSchooling: 4, imageEmoji: '🐟' },
  { id: 'cichlid', name: '시클리드', nameEn: 'Cichlid', bioloadPerFish: 30, minTankSize: 150, tempRange: [24, 28], temperament: 'aggressive', minSchooling: 1, imageEmoji: '🐠' },
];

interface CartItem {
  fish: Fish;
  quantity: number;
}

export default function AquariumBioloadPage() {
  const t = useTranslations('AquariumBioload');

  const [tankLength, setTankLength] = useState<number>(60);
  const [tankWidth, setTankWidth] = useState<number>(30);
  const [tankHeight, setTankHeight] = useState<number>(36);
  const [tankLiters, setTankLiters] = useState<number>(64.8);
  const [useCustomLiters, setUseCustomLiters] = useState<boolean>(false);
  const [selectedFishId, setSelectedFishId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<CartItem[]>([]);

  const calculateLiters = (l: number, w: number, h: number) => {
    return (l * w * h) / 1000;
  };

  const handleDimensionChange = (dimension: 'length' | 'width' | 'height', value: number) => {
    if (dimension === 'length') setTankLength(value);
    if (dimension === 'width') setTankWidth(value);
    if (dimension === 'height') setTankHeight(value);

    const newLength = dimension === 'length' ? value : tankLength;
    const newWidth = dimension === 'width' ? value : tankWidth;
    const newHeight = dimension === 'height' ? value : tankHeight;

    if (!useCustomLiters) {
      setTankLiters(parseFloat(calculateLiters(newLength, newWidth, newHeight).toFixed(1)));
    }
  };

  const handleAddFish = () => {
    if (!selectedFishId || quantity <= 0) return;
    const fish = FISH_DATABASE.find(f => f.id === selectedFishId);
    if (!fish) return;

    const existingItem = cart.find(item => item.fish.id === fish.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.fish.id === fish.id ? { ...item, quantity: item.quantity + quantity } : item
      ));
    } else {
      setCart([...cart, { fish, quantity }]);
    }
    setQuantity(1);
    setSelectedFishId('');
  };

  const handleRemoveFish = (fishId: string) => {
    setCart(cart.filter(item => item.fish.id !== fishId));
  };

  const handleUpdateQuantity = (fishId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFish(fishId);
    } else {
      setCart(cart.map(item =>
        item.fish.id === fishId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const bioloadMetrics = useMemo(() => {
    const totalBioload = cart.reduce((sum, item) => sum + (item.fish.bioloadPerFish * item.quantity), 0);
    const usagePercent = tankLiters > 0 ? (totalBioload / tankLiters) * 100 : 0;
    return {
      totalBioload,
      usagePercent,
      remainingCapacity: Math.max(0, tankLiters - totalBioload),
      totalFish: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cart, tankLiters]);

  const getBioloadStatus = (percent: number) => {
    if (percent > 100) return { color: '#ef4444', status: 'danger', label: t('statusOvercrowded') };
    if (percent > 90) return { color: '#eab308', status: 'warning', label: t('statusMax') };
    if (percent > 70) return { color: '#06b6d4', status: 'good', label: t('statusOptimal') };
    return { color: '#22c55e', status: 'safe', label: t('statusSafe') };
  };

  const alerts = useMemo(() => {
    const warnings: Array<{ type: 'warning' | 'error'; message: string }> = [];
    cart.forEach(item => {
      if (tankLiters < item.fish.minTankSize) {
        warnings.push({ type: 'error', message: t('alertTankTooSmall', { fishName: item.fish.name, minSize: item.fish.minTankSize }) });
      }
      if (item.quantity < item.fish.minSchooling) {
        warnings.push({ type: 'warning', message: t('alertSchooling', { fishName: item.fish.name, minCount: item.fish.minSchooling }) });
      }
    });
    const hasAggressive = cart.some(item => item.fish.temperament === 'aggressive');
    const hasPeaceful = cart.some(item => item.fish.temperament === 'peaceful');
    if (hasAggressive && hasPeaceful) {
      warnings.push({ type: 'warning', message: t('alertCompatibility') });
    }
    return warnings;
  }, [cart, tankLiters, t]);

  const status = getBioloadStatus(bioloadMetrics.usagePercent);

  return (
    <div className="max-w-6xl mx-auto">
      <NavigationActions />

      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '2.5rem' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {t('subtitle')}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2 animate-slide-up">
        {/* Left Column - Input Section */}
        <div className="flex flex-col gap-6">
          {/* Tank Specifications */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              🐠 {t('step1Title')}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('tankLength')} (cm)
                </label>
                <input
                  type="number"
                  value={tankLength}
                  onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('tankWidth')} (cm)
                </label>
                <input
                  type="number"
                  value={tankWidth}
                  onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('tankHeight')} (cm)
                </label>
                <input
                  type="number"
                  value={tankHeight}
                  onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('tankLiters')} (L)
              </label>
              <input
                type="number"
                value={tankLiters}
                onChange={(e) => {
                  setUseCustomLiters(true);
                  setTankLiters(parseFloat(e.target.value) || 0);
                }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Add Fish */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              🔍 {t('step2Title')}
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('selectFish')}
              </label>
              <select
                value={selectedFishId}
                onChange={(e) => setSelectedFishId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}
              >
                <option value="">{t('selectFishPlaceholder')}</option>
                {FISH_DATABASE.map(fish => (
                  <option key={fish.id} value={fish.id}>
                    {fish.imageEmoji} {fish.name} ({fish.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {selectedFishId && (
              <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)', marginBottom: '1.5rem' }}>
                {(() => {
                  const fish = FISH_DATABASE.find(f => f.id === selectedFishId);
                  if (!fish) return null;
                  return (
                    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <div><strong>{t('bioloadPerFish')}:</strong> {fish.bioloadPerFish}L</div>
                      <div><strong>{t('minTankSize')}:</strong> {fish.minTankSize}L</div>
                      <div><strong>{t('tempRange')}:</strong> {fish.tempRange[0]}-{fish.tempRange[1]}°C</div>
                      <div><strong>{t('temperament')}:</strong> {t(`temperament_${fish.temperament}`)}</div>
                      <div><strong>{t('minSchooling')}:</strong> {fish.minSchooling}{t('fish')}</div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('quantity')}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min={1}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={handleAddFish}
                  disabled={!selectedFishId}
                  className="primary-button"
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  ➕ {t('addToTank')}
                </button>
              </div>
            </div>
          </div>

          {/* Current Tank */}
          {cart.length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                🎣 {t('currentTank')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cart.map(item => (
                  <div
                    key={item.fish.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto auto',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--surface-hover)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{item.fish.imageEmoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.fish.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {item.fish.bioloadPerFish}L × {item.quantity} = {item.fish.bioloadPerFish * item.quantity}L
                      </div>
                    </div>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.fish.id, parseInt(e.target.value) || 0)}
                      min={1}
                      style={{ width: '60px', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', textAlign: 'center' }}
                    />
                    <button
                      onClick={() => handleRemoveFish(item.fish.id)}
                      style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="flex flex-col gap-6">
          {cart.length > 0 ? (
            <>
              <div className="glass-panel animate-scale-in" style={{ padding: '2rem', border: `2px solid ${status.color}` }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                  📊 {t('dashboard')}
                </h2>

                {/* Progress Bar */}
                <div style={{ marginBottom: '2rem' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('bioloadUsage')}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: status.color }}>
                      {bioloadMetrics.usagePercent.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '2rem', background: 'var(--surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div
                      style={{
                        width: `${Math.min(bioloadMetrics.usagePercent, 100)}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${status.color}, ${status.color}dd)`,
                        transition: 'width 0.5s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: '0.5rem'
                      }}
                    />
                  </div>
                  <div className="flex justify-between" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {bioloadMetrics.totalBioload.toFixed(1)}L / {tankLiters}L
                    </span>
                    <span style={{ fontWeight: 600, color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {t('totalFish')}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {bioloadMetrics.totalFish}
                    </div>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {t('totalBioload')}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {bioloadMetrics.totalBioload.toFixed(1)}L
                    </div>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {t('remainingCapacity')}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {bioloadMetrics.remainingCapacity.toFixed(1)}L
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {alerts.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {alerts.map((alert, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '1rem',
                          background: alert.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                          border: `1px solid ${alert.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                          borderRadius: '12px',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                          display: 'flex',
                          gap: '0.5rem'
                        }}
                      >
                        <span>{alert.type === 'error' ? '⚠️' : '💡'}</span>
                        <span>{alert.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {bioloadMetrics.usagePercent <= 70 && alerts.length === 0 && (
                  <div style={{ padding: '1.5rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                      {t('alertSafeTitle')}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {t('alertSafeDesc')}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-panel flex items-center justify-center" style={{ padding: '4rem', opacity: 0.5, minHeight: '400px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐠</div>
                <p style={{ color: 'var(--text-secondary)' }}>수조에 물고기를 추가해보세요</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .primary-button {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%) !important;
          color: white !important;
          border: none;
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }
        .primary-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(6, 182, 212, 0.5);
        }
        .primary-button:active:not(:disabled) {
          transform: translateY(-1px);
        }
        .primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <SeoSection
        ko={{
          title: t('section1Title'),
          description: t('section1Para1') + ' ' + t('section1Para2') + ' ' + t('section1Para3'),
          useCases: [
            { icon: '🏠', title: t('useCase1Title'), desc: t('useCase1Desc') },
            { icon: '📈', title: t('useCase2Title'), desc: t('useCase2Desc') },
            { icon: '🐟', title: t('useCase3Title'), desc: t('useCase3Desc') },
            { icon: '🔧', title: t('useCase4Title'), desc: t('useCase4Desc') },
          ],
          steps: [
            { step: t('step1HowTitle'), desc: t('step1HowDesc') },
            { step: t('step2HowTitle'), desc: t('step2HowDesc') },
            { step: t('step3HowTitle'), desc: t('step3HowDesc') },
            { step: t('step4HowTitle'), desc: t('step4HowDesc') },
          ],
          faqs: [
            { q: t('faq1Q'), a: t('faq1A') },
            { q: t('faq2Q'), a: t('faq2A') },
            { q: t('faq3Q'), a: t('faq3A') },
            { q: t('faq4Q'), a: t('faq4A') },
            { q: t('faq5Q'), a: t('faq5A') },
          ],
        }}
        en={{
          title: t('section1Title'),
          description: t('section1Para1') + ' ' + t('section1Para2') + ' ' + t('section1Para3'),
          useCases: [
            { icon: '🏠', title: t('useCase1Title'), desc: t('useCase1Desc') },
            { icon: '📈', title: t('useCase2Title'), desc: t('useCase2Desc') },
            { icon: '🐟', title: t('useCase3Title'), desc: t('useCase3Desc') },
            { icon: '🔧', title: t('useCase4Title'), desc: t('useCase4Desc') },
          ],
          steps: [
            { step: t('step1HowTitle'), desc: t('step1HowDesc') },
            { step: t('step2HowTitle'), desc: t('step2HowDesc') },
            { step: t('step3HowTitle'), desc: t('step3HowDesc') },
            { step: t('step4HowTitle'), desc: t('step4HowDesc') },
          ],
          faqs: [
            { q: t('faq1Q'), a: t('faq1A') },
            { q: t('faq2Q'), a: t('faq2A') },
            { q: t('faq3Q'), a: t('faq3A') },
            { q: t('faq4Q'), a: t('faq4A') },
            { q: t('faq5Q'), a: t('faq5A') },
          ],
        }}
      />
    </div>
  );
}
