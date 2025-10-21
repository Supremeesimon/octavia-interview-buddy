import React, { useEffect, useState } from 'react';
import { PlatformSettingsService } from '@/services/platform-settings.service';

const CheckPricingSettings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const pricingSettings = await PlatformSettingsService.getAllSettings();
        setSettings(pricingSettings);
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
      <h2>Platform Pricing Settings</h2>
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
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Margin Alert Settings</h3>
        <div style={{ marginBottom: '10px' }}>
          <strong>Low Margin Threshold:</strong> {settings.lowMarginThreshold}%
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>High VAPI Cost Threshold:</strong> ${settings.highVapiCostThreshold.toFixed(4)}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Auto Price Adjustment:</strong> {settings.autoPriceAdjustment ? 'Enabled' : 'Disabled'}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Email Notifications:</strong> {settings.emailNotifications ? 'Enabled' : 'Disabled'}
        </div>
      </div>
    </div>
  );
};

export default CheckPricingSettings;