import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { travelApi } from "../../api/travelPlan/TravelPlanAPIService";
import { expenseApi } from "../../api/expense/ExpenseAPIService";
import { Navbar } from "../../components/Navbar";
import { ExpenseModal } from "../../components/expense/ExpenseModal";
import { ExpenseList } from "../../components/expense/ExpenseList";
import { BudgetSummary } from "../../components/expense/BudgetSummary";
import { useSharedPlan } from "../../contexts/sharing/SharedPlanContext";
import type { TravelPlan } from "../../models/travel/TravelPlan";
import type { Expense } from "../../models/travel/Expense";
import type { BudgetSummary as BudgetSummaryModel } from "../../models/travel/BudgetSummary";
import type { CreateExpenseDto } from "../../dtos/expense/CreateExpenseDto";

interface ExpensesPageProps {
  isShared?: boolean;
}

export const ExpensesPage = ({ isShared = false }: ExpensesPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const sharedContext = isShared ? useSharedPlan() : null;
  const sharedPlan = sharedContext?.plan;
  const isViewOnly = sharedContext?.isViewOnly ?? false;
  
  const actualId = isShared ? sharedPlan?.id : (id ? parseInt(id) : null);
  
  const [plan, setPlan] = useState<TravelPlan | null>(isShared && sharedPlan ? sharedPlan : null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpensesLoading, setIsExpensesLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

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
      loadExpenses();
      loadBudgetSummary();
    }
  }, [plan, sharedPlan, selectedCategory]);

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

  const loadExpenses = async () => {
    if (!actualId) return;

    try {
      setIsExpensesLoading(true);
      let data: Expense[];

      if (selectedCategory !== null) {
        data = await expenseApi.getByCategory(actualId, selectedCategory);
      } else {
        data = await expenseApi.getAll(actualId);
      }

      setExpenses(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load expenses.");
    } finally {
      setIsExpensesLoading(false);
    }
  };

  const loadBudgetSummary = async () => {
    if (!actualId) return;

    try {
      setIsSummaryLoading(true);
      const data = await expenseApi.getBudgetSummary(actualId);
      setBudgetSummary(data);
    } catch (err: any) {
      console.error("Failed to load budget summary:", err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleCreate = async (data: CreateExpenseDto) => {
    if (!actualId) return;
    await expenseApi.create(actualId, data);
    await loadExpenses();
    await loadBudgetSummary();
  };

  const handleUpdate = async (data: CreateExpenseDto) => {
    if (!actualId || !editingExpense) return;
    await expenseApi.update(actualId, editingExpense.id, data);
    await loadExpenses();
    await loadBudgetSummary();
    setEditingExpense(null);
  };

  const handleDelete = async (expenseId: number) => {
    if (!actualId) return;

    try {
      await expenseApi.delete(actualId, expenseId);
      await loadExpenses();
      await loadBudgetSummary();
    } catch (err: any) {
      alert(err?.message || "Failed to delete expense.");
    }
  };

  const openCreateModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const categoryFilters = [
    { value: null, label: "All Categories", icon: "📊" },
    { value: 0, label: "Transportation", icon: "🚗" },
    { value: 1, label: "Accommodation", icon: "🏨" },
    { value: 2, label: "Food", icon: "🍽️" },
    { value: 3, label: "Tickets", icon: "🎫" },
    { value: 4, label: "Shopping", icon: "🛍️" },
    { value: 5, label: "Other", icon: "📦" },
  ];

  const currentPlan = plan || sharedPlan;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
        {!isShared && <Navbar activeTravelPlanId={actualId || undefined} />}
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin h-12 w-12 text-emerald-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error && !currentPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
        {!isShared && <Navbar activeTravelPlanId={actualId || undefined} />}
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Travel Plan Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/travels")}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600
                       text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            Back to Travel Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
      {!isShared && <Navbar activeTravelPlanId={actualId || undefined} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isShared && (
          <div className="flex items-center gap-2 text-sm mb-6">
            <button onClick={() => navigate("/travels")} className="text-emerald-600 hover:text-emerald-700 font-medium">
              My Travels
            </button>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <button onClick={() => navigate(`/travels/${actualId}`)} className="text-emerald-600 hover:text-emerald-700 font-medium">
              {currentPlan?.title}
            </button>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-600">Expenses</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
              {isShared ? "Expenses" : "Manage Expenses"}
            </h1>
            <p className="text-gray-600 mt-2">
              Track spending for <span className="font-semibold">{currentPlan?.title}</span>
            </p>
          </div>
          {!isViewOnly && (
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600
                         text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl
                         transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </button>
          )}
        </div>

        {error && currentPlan && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-5">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Budget Overview
                </h2>
                <p className="text-white/80 text-sm mt-1">Financial summary and breakdown</p>
              </div>
              <div className="p-6">
                <BudgetSummary summary={budgetSummary} isLoading={isSummaryLoading} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-5">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Expenses
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
                </p>
              </div>

              <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="flex flex-col gap-2">
                  {categoryFilters.map((filter) => (
                    <button
                      key={filter.value ?? "all"}
                      onClick={() => setSelectedCategory(filter.value)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-all text-left ${
                        selectedCategory === filter.value
                          ? "bg-emerald-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {filter.icon} {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                <ExpenseList
                  expenses={expenses}
                  onEdit={isViewOnly ? () => {} : openEditModal}
                  onDelete={isViewOnly ? () => {} : handleDelete}
                  isLoading={isExpensesLoading}
                  isReadOnly={isViewOnly}
                />
              </div>
            </div>
          </div>
        </div>

        {!isShared && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(`/travels/${actualId}`)}
              className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2"
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
        <ExpenseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingExpense(null);
          }}
          onSubmit={editingExpense ? handleUpdate : handleCreate}
          editingExpense={editingExpense}
          travelPlanStartDate={currentPlan?.startDate}
          travelPlanEndDate={currentPlan?.endDate}
        />
      )}
    </div>
  );
};