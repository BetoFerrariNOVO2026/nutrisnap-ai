import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useSubscription() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlan("free");
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setPlan((data?.subscription_plan as string) || "free");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isPaid = plan !== "free";
  return { plan, isPaid, loading };
}
