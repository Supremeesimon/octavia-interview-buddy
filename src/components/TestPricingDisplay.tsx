import React, { useEffect, useState } from 'react';
import { PlatformSettingsService } from '@/services/platform-settings.service';

const TestPricingDisplay = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const pricingSettings = await PlatformSettingsService.getAllSettings();
        console.log('Raw pricing settings:', pricingSettings);
        setSettings(pricingSettings);
        
        if (pricingSettings) {
          const sessionPrice = pricingSettings.vapiCostPerMinute * (1 + pricingSettings.markupPercentage / 100);
          console.log('Calculated session price:', sessionPrice);
          console.log('Session price formatted:', sessionPrice.toFixed(2));
        }
      } catch (err) {
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
      <h2>Test Pricing Display</h2>
      <div style={{ marginBottom: '10px' }}>
        <strong>VAPI Cost Per Minute:</strong> ${settings.vapiCostPerMinute.toFixed(4)}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Markup Percentage:</strong> {settings.markupPercentage.toFixed(2)}%
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Annual License Cost:</strong> ${settings.annualLicenseCost.toFixed(2)}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Calculated Session Price Per Minute:</strong> ${sessionPrice.toFixed(4)}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Formatted Session Price Per Minute:</strong> ${sessionPrice.toFixed(2)}
      </div>
    </div>
  );
};

export default TestPricingDisplay;