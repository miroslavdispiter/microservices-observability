import { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { sharingApi } from "../../api/sharing/SharingAPIService";
import { travelApi } from "../../api/travelPlan/TravelPlanAPIService";
import type { SharingToken } from "../../models/sharing/SharingToken";
import type { TravelPlan } from "../../models/travel/TravelPlan";

interface SharedPlanContextType {
  sharingToken: SharingToken | null;
  plan: TravelPlan | null;
  isLoading: boolean;
  error: string;
  isViewOnly: boolean;
}

const SharedPlanContext = createContext<SharedPlanContextType | null>(null);

export const SharedPlanProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useParams<{ token: string }>();
  const [sharingToken, setSharingToken] = useState<SharingToken | null>(null);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSharedPlan();
  }, [token]);

  const loadSharedPlan = async () => {
    if (!token) {
      setError("Invalid sharing token");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const tokenData = await sharingApi.getSharingToken(token);
      setSharingToken(tokenData);

      await sharingApi.validateToken({
        token,
        travelPlanId: tokenData.travelPlanId,
      });

      const planData = await travelApi.getById(tokenData.travelPlanId);
      setPlan(planData);
    } catch (err: any) {
      setError(err?.message || "Failed to load shared plan");
    } finally {
      setIsLoading(false);
    }
  };

  const isViewOnly = sharingToken?.accessType === "VIEW";

  return (
    <SharedPlanContext.Provider
      value={{
        sharingToken,
        plan,
        isLoading,
        error,
        isViewOnly,
      }}
    >
      {children}
    </SharedPlanContext.Provider>
  );
};

export const useSharedPlan = () => {
  const context = useContext(SharedPlanContext);
  if (!context) {
    throw new Error("useSharedPlan must be used within SharedPlanProvider");
  }
  return context;
};