import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Filter, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PriceChangeService } from '@/services/price-change.service';
import { ScheduledPriceChange } from '@/types';

interface PriceChangeScheduleTableProps {
  scheduledPriceChanges: ScheduledPriceChange[];
  onRefresh: () => void;
}

const PriceChangeScheduleTable: React.FC<PriceChangeScheduleTableProps> = ({ 
  scheduledPriceChanges, 
  onRefresh 
}) => {
  const { toast } = useToast();
  const [changeTypeFilter, setChangeTypeFilter] = useState<'all' | 'vapiCost' | 'markupPercentage' | 'licenseCost'>('all');
  const [statusPriceChangeFilter, setStatusPriceChangeFilter] = useState<'all' | 'scheduled' | 'applied' | 'cancelled'>('all');
  const [editingPriceChange, setEditingPriceChange] = useState<ScheduledPriceChange | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter scheduled price changes based on filters
  const getFilteredPriceChanges = () => {
    return scheduledPriceChanges.filter(change => {
      // Apply change type filter
      if (changeTypeFilter !== 'all' && change.changeType !== changeTypeFilter) {
        return false;
      }
      
      // Apply status filter
      if (statusPriceChangeFilter !== 'all' && change.status !== statusPriceChangeFilter) {
        return false;
      }
      
      return true;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await PriceChangeService.deletePriceChange(id);
      toast({
        title: "Price change deleted",
        description: "The scheduled price change has been successfully deleted.",
      });
      
      // Give a small delay to ensure the deletion is processed before refreshing
      // Increase the delay to ensure Firebase has time to process the deletion
      setTimeout(() => {
        onRefresh();
      }, 1000);
    } catch (error) {
      console.error('Failed to delete price change:', error);
      toast({
        title: "Error",
        description: "Failed to delete the scheduled price change. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (editingPriceChange) {
      try {
        await PriceChangeService.updatePriceChange(editingPriceChange.id, editingPriceChange);
        setIsEditDialogOpen(false);
        toast({
          title: "Price change updated",
          description: "The scheduled price change has been successfully updated.",
        });
        
        // Give a small delay to ensure the update is processed before refreshing
        // Increase the delay to ensure Firebase has time to process the update
        setTimeout(() => {
          onRefresh();
        }, 1000);
      } catch (error) {
        console.error('Failed to update price change:', error);
        toast({
          title: "Error",
          description: "Failed to update the scheduled price change. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Price Change Schedule
          </CardTitle>
          <CardDescription>
            View and manage upcoming price changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4 gap-2">
            <div className="flex gap-2">
              <Select value={changeTypeFilter} onValueChange={(value: 'all' | 'vapiCost' | 'markupPercentage' | 'licenseCost') => setChangeTypeFilter(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Change Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vapiCost">VAPI Cost</SelectItem>
                  <SelectItem value="markupPercentage">Markup %</SelectItem>
                  <SelectItem value="licenseCost">License Cost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusPriceChangeFilter} onValueChange={(value: 'all' | 'scheduled' | 'applied' | 'cancelled') => setStatusPriceChangeFilter(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => {
                setChangeTypeFilter('all');
                setStatusPriceChangeFilter('all');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Change Date</TableHead>
                <TableHead>Change Type</TableHead>
                <TableHead>Affected</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>New Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredPriceChanges().length > 0 ? (
                getFilteredPriceChanges().map((change) => (
                  <TableRow key={change.id}>
                    <TableCell>{change.changeDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                      {change.changeType === 'vapiCost' && 'VAPI Cost'}
                      {change.changeType === 'markupPercentage' && 'Markup Percentage'}
                      {change.changeType === 'licenseCost' && 'License Cost'}
                    </TableCell>
                    <TableCell>
                      {change.affected === 'all' ? 'All Institutions' : change.affected}
                    </TableCell>
                    <TableCell>
                      {change.changeType === 'vapiCost' && '$' + change.currentValue.toFixed(2) + '/min'}
                      {change.changeType === 'markupPercentage' && change.currentValue.toFixed(1) + '%'}
                      {change.changeType === 'licenseCost' && '$' + change.currentValue.toFixed(2) + '/year'}
                    </TableCell>
                    <TableCell>
                      {change.changeType === 'vapiCost' && '$' + change.newValue.toFixed(2) + '/min'}
                      {change.changeType === 'markupPercentage' && change.newValue.toFixed(1) + '%'}
                      {change.changeType === 'licenseCost' && '$' + change.newValue.toFixed(2) + '/year'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700">
                        {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingPriceChange(change);
                        setIsEditDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(change.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No scheduled price changes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Price Change Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Scheduled Price Change</DialogTitle>
            <DialogDescription>
              Modify the details of this scheduled price change
            </DialogDescription>
          </DialogHeader>
          
          {editingPriceChange && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-change-date">Change Date</Label>
                  <Input
                    id="edit-change-date"
                    type="date"
                    value={editingPriceChange.changeDate.toISOString().split('T')[0]}
                    onChange={(e) => setEditingPriceChange({
                      ...editingPriceChange,
                      changeDate: new Date(e.target.value)
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-change-type">Change Type</Label>
                  <Select 
                    value={editingPriceChange.changeType}
                    onValueChange={(value: 'vapiCost' | 'markupPercentage' | 'licenseCost') => 
                      setEditingPriceChange({
                        ...editingPriceChange,
                        changeType: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Change Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vapiCost">VAPI Cost</SelectItem>
                      <SelectItem value="markupPercentage">Markup Percentage</SelectItem>
                      <SelectItem value="licenseCost">License Cost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-affected">Affected</Label>
                <Input
                  id="edit-affected"
                  value={editingPriceChange.affected}
                  onChange={(e) => setEditingPriceChange({
                    ...editingPriceChange,
                    affected: e.target.value
                  })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-current-value">Current Value</Label>
                  <Input
                    id="edit-current-value"
                    type="number"
                    step="0.01"
                    value={editingPriceChange.currentValue}
                    onChange={(e) => setEditingPriceChange({
                      ...editingPriceChange,
                      currentValue: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-new-value">New Value</Label>
                  <Input
                    id="edit-new-value"
                    type="number"
                    step="0.01"
                    value={editingPriceChange.newValue}
                    onChange={(e) => setEditingPriceChange({
                      ...editingPriceChange,
                      newValue: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingPriceChange.status}
                  onValueChange={(value: 'scheduled' | 'applied' | 'cancelled') => 
                    setEditingPriceChange({
                      ...editingPriceChange,
                      status: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PriceChangeScheduleTable;