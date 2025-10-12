# Scheduled Price Changes Setup and Usage

## Overview
This document describes the setup and usage of the scheduled_price_changes Firestore collection and its integration with the Platform Admin Control Panel.

## Setup Completed

1. **Created the scheduled_price_changes collection** in Firestore
2. **Configured Firebase Admin SDK** with service account credentials for backend operations
3. **Verified PriceChangeService** integration with the new collection
4. **Tested all CRUD operations** on the collection

## Implementation Details

### Collection Structure
The scheduled_price_changes collection stores documents with the following structure:
- `changeDate`: Date - When the price change should take effect
- `changeType`: 'vapiCost' | 'markupPercentage' | 'licenseCost' - Which pricing parameter to change
- `affected`: 'all' | string - Which institutions are affected ('all' for global changes)
- `currentValue`: number - Current value of the parameter
- `newValue`: number - New value of the parameter
- `status`: 'scheduled' | 'applied' | 'cancelled' - Status of the change
- `createdAt`: Date - When the scheduled change was created
- `updatedAt`: Date - When the scheduled change was last updated

### Integration with Admin Control Panel
The FinancialManagement component in the Admin Control Panel is already integrated with the PriceChangeService, which communicates with the scheduled_price_changes collection.

## Usage Instructions

### Creating Scheduled Price Changes
1. Navigate to the Admin Control Panel
2. Go to the Financial tab
3. In the Pricing Control section, modify any pricing parameter
4. Enable scheduling and select a future date
5. Click "Schedule Changes"
6. The scheduled change will appear in the Price Change Schedule section

### Managing Scheduled Changes
- View upcoming changes in the Price Change Schedule table
- Changes with status 'scheduled' will be applied automatically on their changeDate
- Administrators can manually apply or cancel scheduled changes

## Testing Verification

### Backend Tests
Ran comprehensive tests to verify:
- Collection creation and access
- Document creation, reading, updating, and deletion
- Query filtering by status
- All tests passed successfully

### Frontend Integration
Verified that the PriceChangeService can communicate with the collection and that the FinancialManagement component can display scheduled changes.

## Files Created

1. `functions/service-account-key.json` - Firebase service account credentials
2. `functions/test-scheduled-changes.js` - Backend test script
3. `src/scripts/verify-frontend-integration.ts` - Frontend integration verification
4. `src/scripts/browser-test-scheduled-changes.js` - Browser console test script

## Security Note
The service account key file (`service-account-key.json`) contains sensitive credentials and should:
1. Never be committed to version control
2. Be added to `.gitignore` immediately
3. Have restricted file permissions (readable only by necessary processes)
4. Be rotated regularly for security

## Troubleshooting

If you encounter issues with the scheduled price changes:

1. **Verify Firebase initialization**: Ensure the service account key is valid and has proper permissions
2. **Check collection existence**: Run the test script to verify the collection is accessible
3. **Verify PriceChangeService**: Ensure the service can communicate with Firestore
4. **Check Admin Control Panel**: Verify the FinancialManagement component is properly fetching data

## Next Steps

1. Add automatic processing of scheduled changes on their changeDate
2. Implement notifications for upcoming price changes
3. Add audit logging for all price change operations
4. Create administrative tools for bulk price change management