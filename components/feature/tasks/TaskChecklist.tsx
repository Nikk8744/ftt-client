import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getTaskChecklist,
  addChecklistItem, 
  updateChecklistItem, 
  removeChecklistItem 
} from '@/services/taskChecklist';
import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/Modal';
import { Edit, Trash2 } from 'lucide-react';

interface ChecklistItem {
  id: number;
  taskId: number;
  item: string;
  isCompleted: boolean | null;
  createdAt: string;
}

interface TaskChecklistProps {
  taskId: number;
  allowEditing?: boolean;
}

const TaskChecklist: React.FC<TaskChecklistProps> = ({ taskId, allowEditing = true }) => {
  const queryClient = useQueryClient();
  const [newItemText, setNewItemText] = useState('');
  const [editingItem, setEditingItem] = useState<{ id: number; text: string } | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; itemId: number | null }>({
    isOpen: false,
    itemId: null,
  });

  // Fetch checklist items
  const { 
    data: checklistData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['checklist', taskId],
    queryFn: () => getTaskChecklist(taskId),
    enabled: !!taskId,
  });

  // Add checklist item mutation
  const addItemMutation = useMutation({
    mutationFn: (text: string) => addChecklistItem({ 
      taskId, 
      item: text 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', taskId] });
      setNewItemText('');
    },
  });

  // Update checklist item mutation
  const updateItemMutation = useMutation({
    mutationFn: (data: { id: number; update: { item?: string; isCompleted?: boolean } }) => 
      updateChecklistItem(data.id, data.update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', taskId] });
      setEditingItem(null);
    },
  });

  // Delete checklist item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => removeChecklistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', taskId] });
      setDeleteModalState({ isOpen: false, itemId: null });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim()) {
      addItemMutation.mutate(newItemText.trim());
    }
  };

  const handleToggleComplete = (item: ChecklistItem) => {
    updateItemMutation.mutate({
      id: item.id,
      update: { isCompleted: !(item.isCompleted) }
    });
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.text.trim()) {
      updateItemMutation.mutate({
        id: editingItem.id,
        update: { item: editingItem.text.trim() }
      });
    }
  };

  const handleDeleteItem = () => {
    if (deleteModalState.itemId) {
      deleteItemMutation.mutate(deleteModalState.itemId);
    }
  };

  const openDeleteModal = (itemId: number) => {
    setDeleteModalState({ isOpen: true, itemId });
  };

  const checklist = checklistData?.data || [];

  if (isLoading) {
    return <div className="py-2">Loading checklist...</div>;
  }

  if (isError) {
    return <div className="text-red-500 py-2">Error loading checklist</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Checklist</h3>
      
      {/* Add new item form */}
      {allowEditing && (
        <form onSubmit={handleAddItem} className="flex space-x-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add a new item..."
            className="flex-1 rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          <Button
            type="submit"
            variant="default"
            isLoading={addItemMutation.isPending}
            disabled={addItemMutation.isPending || !newItemText.trim()}
          >
            Add
          </Button>
        </form>
      )}

      {/* Checklist items */}
      {checklist.length === 0 ? (
        <p className="text-gray-500 text-sm py-2">No items in this checklist yet.</p>
      ) : (
        <ul className="space-y-2">
          {checklist.map((item: ChecklistItem) => (
            <li key={item.id} className="flex items-center space-x-2">
              {editingItem?.id === item.id ? (
                <form onSubmit={handleUpdateItem} className="flex flex-1 space-x-2">
                  <input
                    type="text"
                    value={editingItem.text}
                    onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                    className="flex-1 rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    isLoading={updateItemMutation.isPending}
                    disabled={updateItemMutation.isPending || !editingItem.text.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingItem(null)}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={!!item.isCompleted}
                    onChange={() => allowEditing && handleToggleComplete(item)}
                    disabled={!allowEditing || updateItemMutation.isPending}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span 
                    className={`flex-1 ${item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                  >
                    {item.item}
                  </span>
                  
                  {allowEditing && (
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem({ id: item.id, text: item.item })}
                        disabled={updateItemMutation.isPending}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(item.id)}
                        disabled={deleteItemMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, itemId: null })}
        onConfirm={handleDeleteItem}
        title="Delete Checklist Item"
        message="Are you sure you want to delete this checklist item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteItemMutation.isPending}
        variant="danger"
      />
    </div>
  );
};

export default TaskChecklist; 