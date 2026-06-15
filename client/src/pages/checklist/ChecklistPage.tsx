import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { travelApi } from "../../api/travelPlan/TravelPlanAPIService";
import { checklistApi } from "../../api/checklist/ChecklistAPIService";
import { Navbar } from "../../components/Navbar";
import { ChecklistModal } from "../../components/checklist/ChecklistModal";
import { ChecklistList } from "../../components/checklist/ChecklistList";
import { useSharedPlan } from "../../contexts/sharing/SharedPlanContext";
import type { TravelPlan } from "../../models/travel/TravelPlan";
import type { ChecklistItem } from "../../models/travel/ChecklistItem";
import type { CreateChecklistItemDto } from "../../dtos/checklist/CreateChecklistItemDto";

interface ChecklistPageProps {
  isShared?: boolean;
}

export const ChecklistPage = ({ isShared = false }: ChecklistPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const sharedContext = isShared ? useSharedPlan() : null;
  const sharedPlan = sharedContext?.plan;
  const isViewOnly = sharedContext?.isViewOnly ?? false;
  
  const actualId = isShared ? sharedPlan?.id : (id ? parseInt(id) : null);
  
  const [plan, setPlan] = useState<TravelPlan | null>(isShared && sharedPlan ? sharedPlan : null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

  useEffect(() => {
    if (!isShared) {
      loadPlan();
    } else if (sharedPlan) {
      setPlan(sharedPlan);
      setIsLoading(false);
    }
  }, [id, isShared, sharedPlan]);

  useEffect(() => {
    if (plan || sharedPlan) {
      loadItems();
    }
  }, [plan, sharedPlan]);

  const loadPlan = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError("");
      const data = await travelApi.getById(parseInt(id));
      setPlan(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load travel plan.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadItems = async () => {
    if (!actualId) return;

    try {
      setIsItemsLoading(true);
      const data = await checklistApi.getAll(actualId);
      setItems(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load checklist items.");
    } finally {
      setIsItemsLoading(false);
    }
  };

  const handleCreate = async (data: CreateChecklistItemDto) => {
    if (!actualId) return;
    await checklistApi.create(actualId, data);
    await loadItems();
  };

  const handleUpdate = async (data: CreateChecklistItemDto) => {
    if (!actualId || !editingItem) return;
    await checklistApi.update(actualId, editingItem.id, data);
    await loadItems();
    setEditingItem(null);
  };

  const handleToggle = async (itemId: number) => {
    if (!actualId || isViewOnly) return;

    try {
      await checklistApi.toggle(actualId, itemId);
      await loadItems();
    } catch (err: any) {
      alert(err?.message || "Failed to toggle checklist item.");
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!actualId) return;

    try {
      await checklistApi.delete(actualId, itemId);
      await loadItems();
    } catch (err: any) {
      alert(err?.message || "Failed to delete checklist item.");
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ChecklistItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const completedCount = items.filter((item) => item.isCompleted).length;
  const totalCount = items.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const currentPlan = plan || sharedPlan;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100">
        {!isShared && <Navbar activeTravelPlanId={actualId || undefined} />}
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin h-12 w-12 text-orange-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error && !currentPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100">
        {!isShared && <Navbar activeTravelPlanId={actualId || undefined} />}
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Travel Plan Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/travels")}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600
                       text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            Back to Travel Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100">
      {!isShared && <Navbar activeTravelPlanId={actualId || undefined} />}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isShared && (
          <div className="flex items-center gap-2 text-sm mb-6">
            <button onClick={() => navigate("/travels")} className="text-orange-600 hover:text-orange-700 font-medium">
              My Travels
            </button>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <button onClick={() => navigate(`/travels/${actualId}`)} className="text-orange-600 hover:text-orange-700 font-medium">
              {currentPlan?.title}
            </button>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-600">Packing List</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
              Packing List
            </h1>
            <p className="text-gray-600 mt-2">
              Get ready for <span className="font-semibold">{currentPlan?.title}</span>
            </p>
          </div>
          {!isViewOnly && (
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600
                         text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl
                         transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          )}
        </div>

        {error && currentPlan && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {totalCount > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Overall Progress</h2>
              <span className="text-3xl font-bold text-orange-600">
                {completedCount}/{totalCount}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500 
                           flex items-center justify-center text-white text-sm font-bold"
                style={{ width: `${completionPercentage}%` }}
              >
                {completionPercentage > 15 && `${completionPercentage.toFixed(0)}%`}
              </div>
            </div>

            {completionPercentage === 100 ? (
              <p className="text-green-600 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                All items packed! You're ready to go!
              </p>
            ) : (
              <p className="text-gray-600">
                {totalCount - completedCount} item{totalCount - completedCount !== 1 ? "s" : ""} remaining
              </p>
            )}
          </div>
        )}

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-5">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Your Checklist
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {totalCount} {totalCount === 1 ? "item" : "items"} total
            </p>
          </div>

          <div className="p-6">
            <ChecklistList
              items={items}
              onEdit={isViewOnly ? () => {} : openEditModal}
              onDelete={isViewOnly ? () => {} : handleDelete}
              onToggle={handleToggle}
              isLoading={isItemsLoading}
              isReadOnly={isViewOnly}
            />
          </div>
        </div>

        {!isShared && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(`/travels/${actualId}`)}
              className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Travel Plan Overview
            </button>
          </div>
        )}
      </div>

      {!isViewOnly && (
        <ChecklistModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          editingItem={editingItem}
        />
      )}
    </div>
  );
};