import React, { useEffect, useState } from 'react';
import { PlatformSettingsService } from '@/services/platform-settings.service';

const TestPlatformSettings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        console.log('Fetching platform settings...');
        const allSettings = await PlatformSettingsService.getAllSettings();
        console.log('All settings:', allSettings);
        setSettings(allSettings);
        
        const pricingSettings = await PlatformSettingsService.getPricingSettings();
        console.log('Pricing settings:', pricingSettings);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!settings) return <div>No settings found</div>;

  const sessionPrice = settings.vapiCostPerMinute * (1 + settings.markupPercentage / 100);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Platform Settings Test</h2>
      <div style={{ marginBottom: '10px' }}>
        <strong>VAPI Cost Per Minute:</strong> ${settings.vapiCostPerMinute}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Markup Percentage:</strong> {settings.markupPercentage}%
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Annual License Cost:</strong> ${settings.annualLicenseCost}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Calculated Session Price Per Minute:</strong> ${sessionPrice.toFixed(2)}
      </div>
    </div>
  );
};

export default TestPlatformSettings;