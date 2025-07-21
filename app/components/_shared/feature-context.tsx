import React, { createContext, useContext, useState, useCallback } from "react";

interface FeatureContextType {
  features: Record<string, boolean>;
  refreshFeatures: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export function FeatureProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState<Record<string, boolean>>({});

  const refreshFeatures = useCallback(async () => {
    const res = await fetch("/api/features", { credentials: "include" });
    const data = await res.json();
    setFeatures(
      (data.features || []).reduce((acc: any, f: any) => {
        acc[f.name] = !!f.enabled;
        return acc;
      }, {})
    );
  }, []);

  React.useEffect(() => {
    refreshFeatures();
  }, [refreshFeatures]);

  return (
    <FeatureContext.Provider value={{ features, refreshFeatures }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureContext);
  if (!ctx) throw new Error("useFeatureFlags must be used within a FeatureProvider");
  return ctx;
} 