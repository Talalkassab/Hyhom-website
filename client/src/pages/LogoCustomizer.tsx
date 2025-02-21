import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/layout/Logo';

interface LogoSettings {
  primaryColor: string;
  secondaryColor: string;
  arabicScale: number;
  englishScale: number;
  spacing: number;
}

export default function LogoCustomizer() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<LogoSettings>({
    primaryColor: '#2a577e',
    secondaryColor: '#6fbeb8',
    arabicScale: 1,
    englishScale: 1,
    spacing: 1,
  });

  const handleColorChange = (key: keyof Pick<LogoSettings, 'primaryColor' | 'secondaryColor'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSliderChange = (key: keyof Omit<LogoSettings, 'primaryColor' | 'secondaryColor'>) => (value: number[]) => {
    setSettings(prev => ({ ...prev, [key]: value[0] }));
  };

  return (
    <div className="py-16 min-h-screen bg-pattern">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#2a577e] mb-8 text-center">
          Logo Customizer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="preview">
                <TabsList className="mb-4">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="arabic">Arabic</TabsTrigger>
                  <TabsTrigger value="english">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="p-4 border rounded-lg">
                  <Logo 
                    className="mb-4"
                    customization={settings}
                  />
                </TabsContent>
                
                <TabsContent value="arabic" className="p-4 border rounded-lg">
                  <Logo 
                    className="mb-4"
                    customization={{
                      ...settings,
                      englishScale: 0,
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="english" className="p-4 border rounded-lg">
                  <Logo 
                    className="mb-4"
                    customization={{
                      ...settings,
                      arabicScale: 0,
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Controls Section */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label>Primary Color (Arabic)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={settings.primaryColor}
                    onChange={handleColorChange('primaryColor')}
                    className="w-16 h-10"
                  />
                  <Input 
                    type="text" 
                    value={settings.primaryColor}
                    onChange={handleColorChange('primaryColor')}
                  />
                </div>
              </div>

              <div>
                <Label>Secondary Color (English)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={settings.secondaryColor}
                    onChange={handleColorChange('secondaryColor')}
                    className="w-16 h-10"
                  />
                  <Input 
                    type="text" 
                    value={settings.secondaryColor}
                    onChange={handleColorChange('secondaryColor')}
                  />
                </div>
              </div>

              <div>
                <Label>Arabic Scale</Label>
                <Slider
                  value={[settings.arabicScale]}
                  onValueChange={handleSliderChange('arabicScale')}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  className="my-4"
                />
              </div>

              <div>
                <Label>English Scale</Label>
                <Slider
                  value={[settings.englishScale]}
                  onValueChange={handleSliderChange('englishScale')}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  className="my-4"
                />
              </div>

              <div>
                <Label>Spacing</Label>
                <Slider
                  value={[settings.spacing]}
                  onValueChange={handleSliderChange('spacing')}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="my-4"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
