import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout/Layout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth, AuthProvider } from "@/lib/AuthContext";
import { useEffect } from "react";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Brands from "@/pages/Brands";
import Contact from "@/pages/Contact";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import HRAssistant from "@/pages/assistants/HRAssistant";
import MarketingAssistant from "@/pages/assistants/MarketingAssistant";
import BusinessAnalysisAssistant from "@/pages/assistants/BusinessAnalysisAssistant";
import OperationalAssistant from "@/pages/assistants/OperationalAssistant";
import GeneralAssistant from "@/pages/assistants/GeneralAssistant";

function PrivateRoute({ component: Component }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
      return;
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <Layout>
      <Component />
    </Layout>
  ) : null;
}

function PublicRoute({ component: Component }) {
  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function DashboardRoute({ component: Component }) {
  return (
    <PrivateRoute
      component={() => (
        <DashboardLayout>
          <Component />
        </DashboardLayout>
      )}
    />
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/">
        <PublicRoute component={Home} />
      </Route>
      <Route path="/about">
        <PublicRoute component={About} />
      </Route>
      <Route path="/brands">
        <PublicRoute component={Brands} />
      </Route>
      <Route path="/contact">
        <PublicRoute component={Contact} />
      </Route>
      <Route path="/login">
        <PublicRoute component={Login} />
      </Route>

      {/* Dashboard Routes */}
      <Route path="/dashboard">
        <DashboardRoute component={Dashboard} />
      </Route>
      <Route path="/dashboard/employees">
        <DashboardRoute component={() => (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Employees</h1>
          </div>
        )} />
      </Route>
      <Route path="/dashboard/departments">
        <DashboardRoute component={() => (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Departments</h1>
          </div>
        )} />
      </Route>
      <Route path="/dashboard/performance">
        <DashboardRoute component={() => (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Performance</h1>
          </div>
        )} />
      </Route>
      <Route path="/dashboard/benefits">
        <DashboardRoute component={() => (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Benefits</h1>
          </div>
        )} />
      </Route>

      {/* AI Assistant Routes */}
      <Route path="/dashboard/assistants/hr">
        <DashboardRoute component={HRAssistant} />
      </Route>
      <Route path="/dashboard/assistants/marketing">
        <DashboardRoute component={MarketingAssistant} />
      </Route>
      <Route path="/dashboard/assistants/business">
        <DashboardRoute component={BusinessAnalysisAssistant} />
      </Route>
      <Route path="/dashboard/assistants/operational">
        <DashboardRoute component={OperationalAssistant} />
      </Route>
      <Route path="/dashboard/assistants/general">
        <DashboardRoute component={GeneralAssistant} />
      </Route>

      {/* Profile Route */}
      <Route path="/profile/:id">
        <PrivateRoute component={Profile} />
      </Route>

      {/* 404 Route */}
      <Route>
        <PublicRoute component={NotFound} />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;