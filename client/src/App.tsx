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

function PrivateRoute({ component: Component, layout: RouteLayout = DashboardLayout }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <RouteLayout>
      <Component />
    </RouteLayout>
  ) : null;
}

function PublicRoute({ component: Component }) {
  return (
    <Layout>
      <Component />
    </Layout>
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

      {/* Private Routes */}
      <Route path="/dashboard">
        <PrivateRoute component={Dashboard} />
      </Route>
      <Route path="/dashboard/employees">
        <PrivateRoute component={() => <div>Employees</div>} />
      </Route>
      <Route path="/dashboard/departments">
        <PrivateRoute component={() => <div>Departments</div>} />
      </Route>
      <Route path="/dashboard/performance">
        <PrivateRoute component={() => <div>Performance</div>} />
      </Route>
      <Route path="/dashboard/benefits">
        <PrivateRoute component={() => <div>Benefits</div>} />
      </Route>
      <Route path="/profile/:id">
        <PrivateRoute component={Profile} layout={Layout} />
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