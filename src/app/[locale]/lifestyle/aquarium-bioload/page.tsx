'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import NavigationActions from '@/app/components/NavigationActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Trash2, Plus, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

// Fish Database
interface Fish {
  id: string;
  name: string;
  nameEn: string;
  bioloadPerFish: number; // Liters needed per fish
  minTankSize: number; // Minimum tank size in liters
  tempRange: [number, number]; // Temperature range
  temperament: 'peaceful' | 'aggressive' | 'semi-aggressive';
  minSchooling: number; // Minimum number for schooling fish
  imageEmoji: string;
}

const FISH_DATABASE: Fish[] = [
  {
    id: 'guppy',
    name: '구피',
    nameEn: 'Guppy',
    bioloadPerFish: 4,
    minTankSize: 20,
    tempRange: [22, 28],
    temperament: 'peaceful',
    minSchooling: 1,
    imageEmoji: '🐠'
  },
  {
    id: 'neon-tetra',
    name: '네온테트라',
    nameEn: 'Neon Tetra',
    bioloadPerFish: 2,
    minTankSize: 40,
    tempRange: [20, 26],
    temperament: 'peaceful',
    minSchooling: 6,
    imageEmoji: '🐟'
  },
  {
    id: 'corydoras',
    name: '코리도라스',
    nameEn: 'Corydoras',
    bioloadPerFish: 5,
    minTankSize: 40,
    tempRange: [22, 26],
    temperament: 'peaceful',
    minSchooling: 3,
    imageEmoji: '🐡'
  },
  {
    id: 'ancistrus',
    name: '안시',
    nameEn: 'Ancistrus (Bristlenose Pleco)',
    bioloadPerFish: 20,
    minTankSize: 80,
    tempRange: [20, 28],
    temperament: 'peaceful',
    minSchooling: 1,
    imageEmoji: '🐟'
  },
  {
    id: 'betta',
    name: '베타',
    nameEn: 'Betta',
    bioloadPerFish: 8,
    minTankSize: 20,
    tempRange: [24, 28],
    temperament: 'aggressive',
    minSchooling: 1,
    imageEmoji: '🐠'
  },
  {
    id: 'tiger-barb',
    name: '수마트라',
    nameEn: 'Tiger Barb',
    bioloadPerFish: 6,
    minTankSize: 60,
    tempRange: [23, 27],
    temperament: 'semi-aggressive',
    minSchooling: 6,
    imageEmoji: '🐟'
  },
  {
    id: 'angelfish',
    name: '엔젤피시',
    nameEn: 'Angelfish',
    bioloadPerFish: 15,
    minTankSize: 150,
    tempRange: [24, 28],
    temperament: 'semi-aggressive',
    minSchooling: 1,
    imageEmoji: '🐠'
  },
  {
    id: 'molly',
    name: '몰리',
    nameEn: 'Molly',
    bioloadPerFish: 8,
    minTankSize: 40,
    tempRange: [24, 28],
    temperament: 'peaceful',
    minSchooling: 1,
    imageEmoji: '🐟'
  },
  {
    id: 'platy',
    name: '플래티',
    nameEn: 'Platy',
    bioloadPerFish: 6,
    minTankSize: 40,
    tempRange: [20, 26],
    temperament: 'peaceful',
    minSchooling: 1,
    imageEmoji: '🐠'
  },
  {
    id: 'goldfish',
    name: '금붕어',
    nameEn: 'Goldfish',
    bioloadPerFish: 40,
    minTankSize: 150,
    tempRange: [18, 24],
    temperament: 'peaceful',
    minSchooling: 1,
    imageEmoji: '🐡'
  },
  {
    id: 'zebra-danio',
    name: '제브라 다니오',
    nameEn: 'Zebra Danio',
    bioloadPerFish: 3,
    minTankSize: 40,
    tempRange: [18, 24],
    temperament: 'peaceful',
    minSchooling: 6,
    imageEmoji: '🐟'
  },
  {
    id: 'cherry-shrimp',
    name: '체리새우',
    nameEn: 'Cherry Shrimp',
    bioloadPerFish: 0.5,
    minTankSize: 10,
    tempRange: [20, 26],
    temperament: 'peaceful',
    minSchooling: 5,
    imageEmoji: '🦐'
  },
  {
    id: 'rasbora',
    name: '라스보라',
    nameEn: 'Rasbora',
    bioloadPerFish: 2,
    minTankSize: 40,
    tempRange: [22, 26],
    temperament: 'peaceful',
    minSchooling: 8,
    imageEmoji: '🐠'
  },
  {
    id: 'discus',
    name: '디스커스',
    nameEn: 'Discus',
    bioloadPerFish: 40,
    minTankSize: 200,
    tempRange: [26, 30],
    temperament: 'peaceful',
    minSchooling: 4,
    imageEmoji: '🐟'
  },
  {
    id: 'cichlid',
    name: '시클리드',
    nameEn: 'Cichlid',
    bioloadPerFish: 30,
    minTankSize: 150,
    tempRange: [24, 28],
    temperament: 'aggressive',
    minSchooling: 1,
    imageEmoji: '🐠'
  }
];

interface CartItem {
  fish: Fish;
  quantity: number;
}

export default function AquariumBioloadPage() {
  const t = useTranslations('AquariumBioload');

  // Tank specifications
  const [tankLength, setTankLength] = useState<number>(60);
  const [tankWidth, setTankWidth] = useState<number>(30);
  const [tankHeight, setTankHeight] = useState<number>(36);
  const [tankLiters, setTankLiters] = useState<number>(64.8);
  const [useCustomLiters, setUseCustomLiters] = useState<boolean>(false);

  // Fish selection
  const [selectedFishId, setSelectedFishId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Calculate tank liters from dimensions
  const calculateLiters = (l: number, w: number, h: number) => {
    return (l * w * h) / 1000; // Convert cm³ to liters
  };

  // Update tank liters when dimensions change
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

  // Add fish to cart
  const handleAddFish = () => {
    if (!selectedFishId || quantity <= 0) return;

    const fish = FISH_DATABASE.find(f => f.id === selectedFishId);
    if (!fish) return;

    const existingItem = cart.find(item => item.fish.id === fish.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.fish.id === fish.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { fish, quantity }]);
    }

    setQuantity(1);
    setSelectedFishId('');
  };

  // Remove fish from cart
  const handleRemoveFish = (fishId: string) => {
    setCart(cart.filter(item => item.fish.id !== fishId));
  };

  // Update quantity
  const handleUpdateQuantity = (fishId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFish(fishId);
    } else {
      setCart(cart.map(item =>
        item.fish.id === fishId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Calculate bioload metrics
  const bioloadMetrics = useMemo(() => {
    const totalBioload = cart.reduce((sum, item) => sum + (item.fish.bioloadPerFish * item.quantity), 0);
    const usagePercent = tankLiters > 0 ? (totalBioload / tankLiters) * 100 : 0;

    return {
      totalBioload,
      usagePercent,
      remainingCapacity: Math.max(0, tankLiters - totalBioload)
    };
  }, [cart, tankLiters]);

  // Get bioload status
  const getBioloadStatus = (percent: number) => {
    if (percent > 100) return { color: 'bg-red-500', status: 'danger', label: t('statusOvercrowded') };
    if (percent > 90) return { color: 'bg-yellow-500', status: 'warning', label: t('statusMax') };
    if (percent > 70) return { color: 'bg-blue-500', status: 'good', label: t('statusOptimal') };
    return { color: 'bg-green-500', status: 'safe', label: t('statusSafe') };
  };

  // Smart alerts
  const alerts = useMemo(() => {
    const warnings: Array<{ type: 'warning' | 'error' | 'info'; message: string }> = [];

    cart.forEach(item => {
      // Check minimum tank size
      if (tankLiters < item.fish.minTankSize) {
        warnings.push({
          type: 'error',
          message: t('alertTankTooSmall', { fishName: item.fish.name, minSize: item.fish.minTankSize })
        });
      }

      // Check schooling requirements
      if (item.quantity < item.fish.minSchooling) {
        warnings.push({
          type: 'warning',
          message: t('alertSchooling', { fishName: item.fish.name, minCount: item.fish.minSchooling })
        });
      }
    });

    // Check temperament compatibility
    const hasAggressive = cart.some(item => item.fish.temperament === 'aggressive');
    const hasPeaceful = cart.some(item => item.fish.temperament === 'peaceful');

    if (hasAggressive && hasPeaceful) {
      warnings.push({
        type: 'warning',
        message: t('alertCompatibility')
      });
    }

    return warnings;
  }, [cart, tankLiters, t]);

  const status = getBioloadStatus(bioloadMetrics.usagePercent);

  return (
    <div>
      <NavigationActions />

      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 'var(--section-gap)' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('subtitle')}
        </p>
      </header>

      <div style={{ display: 'grid', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Step 1: Tank Specifications */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🐠</span> {t('step1Title')}
            </CardTitle>
            <CardDescription>{t('step1Desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <Label htmlFor="length">{t('tankLength')} (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={tankLength}
                    onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="width">{t('tankWidth')} (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={tankWidth}
                    onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="height">{t('tankHeight')} (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={tankHeight}
                    onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="liters">{t('tankLiters')} (L)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseCustomLiters(!useCustomLiters)}
                  >
                    {useCustomLiters ? t('useCalculated') : t('useCustom')}
                  </Button>
                </div>
                <Input
                  id="liters"
                  type="number"
                  value={tankLiters}
                  onChange={(e) => {
                    setUseCustomLiters(true);
                    setTankLiters(parseFloat(e.target.value) || 0);
                  }}
                  min={0}
                  step={0.1}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Add Fish */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔍</span> {t('step2Title')}
            </CardTitle>
            <CardDescription>{t('step2Desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <Label htmlFor="fish">{t('selectFish')}</Label>
                  <Select value={selectedFishId} onValueChange={setSelectedFishId}>
                    <SelectTrigger id="fish">
                      <SelectValue placeholder={t('selectFishPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {FISH_DATABASE.map(fish => (
                        <SelectItem key={fish.id} value={fish.id}>
                          <span className="flex items-center gap-2">
                            <span>{fish.imageEmoji}</span>
                            <span>{fish.name} ({fish.nameEn})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">{t('quantity')}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>

                <Button
                  onClick={handleAddFish}
                  disabled={!selectedFishId}
                  className="flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}
                >
                  <Plus size={16} /> {t('addToTank')}
                </Button>
              </div>

              {/* Fish details */}
              {selectedFishId && (
                <Card style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  <CardContent className="pt-4">
                    {(() => {
                      const fish = FISH_DATABASE.find(f => f.id === selectedFishId);
                      if (!fish) return null;
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem' }}>
                          <div><strong>{t('bioloadPerFish')}:</strong> {fish.bioloadPerFish}L</div>
                          <div><strong>{t('minTankSize')}:</strong> {fish.minTankSize}L</div>
                          <div><strong>{t('tempRange')}:</strong> {fish.tempRange[0]}-{fish.tempRange[1]}°C</div>
                          <div><strong>{t('temperament')}:</strong> {t(`temperament_${fish.temperament}`)}</div>
                          <div><strong>{t('minSchooling')}:</strong> {fish.minSchooling}{t('fish')}</div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Current Tank (Cart) */}
        {cart.length > 0 && (
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🎣</span> {t('currentTank')}
              </CardTitle>
              <CardDescription>{t('currentTankDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {cart.map(item => (
                  <div
                    key={item.fish.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto auto auto',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{item.fish.imageEmoji}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.fish.name} ({item.fish.nameEn})</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {item.fish.bioloadPerFish}L × {item.quantity} = {item.fish.bioloadPerFish * item.quantity}L
                      </div>
                    </div>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.fish.id, parseInt(e.target.value) || 0)}
                      min={1}
                      style={{ width: '80px' }}
                    />
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {item.fish.bioloadPerFish * item.quantity}L
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFish(item.fish.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Bioload Dashboard */}
        <Card className="glass-panel" style={{ border: '2px solid rgba(6, 182, 212, 0.3)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span> {t('dashboard')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: '2rem' }}>
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontWeight: 600 }}>{t('bioloadUsage')}</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: status.status === 'danger' ? '#ef4444' : status.status === 'warning' ? '#eab308' : status.status === 'good' ? '#3b82f6' : '#22c55e' }}>
                    {bioloadMetrics.usagePercent.toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.min(bioloadMetrics.usagePercent, 100)} className="h-8" />
                <div className="flex justify-between items-center mt-2">
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {bioloadMetrics.totalBioload.toFixed(1)}L / {tankLiters}L
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <Card style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  <CardContent className="pt-4">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {t('totalFish')}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  <CardContent className="pt-4">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {t('totalBioload')}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      {bioloadMetrics.totalBioload.toFixed(1)}L
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  <CardContent className="pt-4">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {t('remainingCapacity')}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      {bioloadMetrics.remainingCapacity.toFixed(1)}L
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              {alerts.length > 0 && (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {alerts.map((alert, index) => (
                    <Alert
                      key={index}
                      variant={alert.type === 'error' ? 'destructive' : 'default'}
                      style={alert.type === 'warning' ? { background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)' } : {}}
                    >
                      {alert.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : alert.type === 'info' ? <Info className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      <AlertDescription>{alert.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {bioloadMetrics.usagePercent <= 70 && cart.length > 0 && alerts.length === 0 && (
                <Alert style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>{t('alertSafeTitle')}</AlertTitle>
                  <AlertDescription>{t('alertSafeDesc')}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SEO Content Sections */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>{t('section1Title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: '1rem', lineHeight: 1.8 }}>
              <p>{t('section1Para1')}</p>
              <p>{t('section1Para2')}</p>
              <p>{t('section1Para3')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>{t('section2Title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {['useCase1', 'useCase2', 'useCase3', 'useCase4'].map((useCase, index) => (
                <div key={index}>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    {index + 1}. {t(`${useCase}Title`)}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{t(`${useCase}Desc`)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>{t('section3Title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {['step1', 'step2', 'step3', 'step4'].map((step, index) => (
                <div key={index}>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    {t(`${step}HowTitle`)}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{t(`${step}HowDesc`)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>{t('faqTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {['faq1', 'faq2', 'faq3', 'faq4', 'faq5'].map((faq, index) => (
                <div key={index}>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    Q{index + 1}. {t(`${faq}Q`)}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{t(`${faq}A`)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert variant="default" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('disclaimerTitle')}</AlertTitle>
          <AlertDescription>{t('disclaimerText')}</AlertDescription>
        </Alert>

        {/* Recommended Tools */}
        <Card className="glass-panel" style={{ background: 'rgba(6, 182, 212, 0.05)' }}>
          <CardHeader>
            <CardTitle>{t('recommendedTools')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <p>• {t('recommendedTool1')}</p>
              <p>• {t('recommendedTool2')}</p>
              <p>• {t('recommendedTool3')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Ad Placeholder */}
        <Card className="glass-panel" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.2)' }}>
          <CardContent className="pt-6">
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              {t('adPlaceholder')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
