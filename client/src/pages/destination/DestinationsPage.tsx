import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { travelApi } from "../../api/travelPlan/TravelPlanAPIService";
import { destinationApi } from "../../api/destination/DestinationAPIService";
import { Navbar } from "../../components/Navbar";
import { DestinationModal } from "../../components/destination/DestinationModal";
import { DestinationList } from "../../components/destination/DestinationList";
import type { TravelPlan } from "../../models/travel/TravelPlan";
import type { Destination } from "../../models/travel/Destination";
import type { CreateDestinationDto } from "../../dtos/destination/CreateDestinationDto";

export const DestinationsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDestinationsLoading, setIsDestinationsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);

  useEffect(() => {
    loadPlan();
  }, [id]);

  useEffect(() => {
    if (plan) {
      loadDestinations();
    }
  }, [plan]);

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

  const loadDestinations = async () => {
    if (!id) return;

    try {
      setIsDestinationsLoading(true);
      const data = await destinationApi.getAll(parseInt(id));
      setDestinations(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load destinations.");
    } finally {
      setIsDestinationsLoading(false);
    }
  };

  const handleCreate = async (data: CreateDestinationDto) => {
    if (!id) return;
    await destinationApi.create(parseInt(id), data);
    await loadDestinations();
  };

  const handleUpdate = async (data: CreateDestinationDto) => {
    if (!id || !editingDestination) return;
    await destinationApi.update(parseInt(id), editingDestination.id, data);
    await loadDestinations();
    setEditingDestination(null);
  };

  const handleDelete = async (destinationId: number) => {
    if (!id) return;

    try {
      await destinationApi.delete(parseInt(id), destinationId);
      await loadDestinations();
    } catch (err: any) {
      alert(err?.message || "Failed to delete destination.");
    }
  };

  const openCreateModal = () => {
    setEditingDestination(null);
    setIsModalOpen(true);
  };

  const openEditModal = (destination: Destination) => {
    setEditingDestination(destination);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100">
        <Navbar activeTravelPlanId={parseInt(id!)} />
        <div className="flex justify-center items-center py-20">
          <svg
            className="animate-spin h-12 w-12 text-teal-500"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100">
        <Navbar activeTravelPlanId={parseInt(id!)} />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Travel Plan Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/travels")}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600
                       text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            Back to Travel Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100">
      <Navbar activeTravelPlanId={parseInt(id!)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => navigate("/travels")}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            My Travels
          </button>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <button
            onClick={() => navigate(`/travels/${id}`)}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            {plan?.title}
          </button>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-600">Destinations</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
              Manage Destinations
            </h1>
            <p className="text-gray-600 mt-2">
              Plan the places you'll visit during{" "}
              <span className="font-semibold">{plan?.title}</span>
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600
                       text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl
                       transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Destination
          </button>
        </div>

        {/* Error Message */}
        {error && plan && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Destinations List */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-teal-100 overflow-hidden">
          <div className="p-8">
            <DestinationList
              destinations={destinations}
              onEdit={openEditModal}
              onDelete={handleDelete}
              isLoading={isDestinationsLoading}
            />
          </div>
        </div>

        {/* Back to Overview */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(`/travels/${id}`)}
            className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Travel Plan Overview
          </button>
        </div>
      </div>

      {/* Modal */}
      <DestinationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDestination(null);
        }}
        onSubmit={editingDestination ? handleUpdate : handleCreate}
        editingDestination={editingDestination}
        travelPlanStartDate={plan?.startDate}
        travelPlanEndDate={plan?.endDate}
      />
    </div>
  );
};