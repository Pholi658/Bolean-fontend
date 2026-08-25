import { useState } from "react";
import type { AppScreen } from "@/lib/types";
import LoginScreen from "@/screens/LoginScreen";
import RegisterStep1 from "@/screens/RegisterStep1";
import RegisterStep2 from "@/screens/RegisterStep2";
import ConsumerDashboard from "@/screens/consumer/ConsumerDashboard";
import LenderDashboard from "@/screens/lender/LenderDashboard";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("login");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {screen === "login"    && <LoginScreen    go={setScreen} />}
      {screen === "reg1"     && <RegisterStep1  go={setScreen} />}
      {screen === "reg2"     && <RegisterStep2  go={setScreen} />}
      {screen === "consumer" && <ConsumerDashboard go={setScreen} />}
      {screen === "lender"   && <LenderDashboard  go={setScreen} />}
    </div>
  );
}
