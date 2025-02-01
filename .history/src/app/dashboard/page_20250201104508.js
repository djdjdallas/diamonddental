// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    upcomingAppointments: [],
  });
  const [revenueData, setRevenueData] = useState([]);
  const [treatmentData, setTreatmentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get total patients
      const { count: patientsCount } = await supabase
        .from("patients")
        .select("*", { count: "exact" });

      // Get today's appointments
      const today = new Date().toISOString().split("T")[0];
      const { data: todayAppointments } = await supabase
        .from("appointments")
        .select(
          `
          *,
          patients(first_name, last_name),
          staff(first_name, last_name),
          treatments(name)
        `
        )
        .gte("appointment_date", today)
        .lte("appointment_date", today + "T23:59:59")
        .order("appointment_date");

      // Get total revenue
      const { data: revenue } = await supabase
        .from("invoices")
        .select("total_amount")
        .not("status", "eq", "cancelled");

      const totalRevenue =
        revenue?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

      setMetrics({
        totalPatients: patientsCount || 0,
        totalAppointments: todayAppointments?.length || 0,
        totalRevenue: totalRevenue,
        upcomingAppointments: todayAppointments || [],
      });

      // Get monthly revenue data
      const startOfYear = new Date(
        new Date().getFullYear(),
        0,
        1
      ).toISOString();
      const { data: monthlyRevenue } = await supabase
        .from("invoices")
        .select("created_at, total_amount")
        .gte("created_at", startOfYear)
        .order("created_at");

      // Process revenue data by month
      const revenueByMonth = monthlyRevenue?.reduce((acc, curr) => {
        const month = new Date(curr.created_at).toLocaleString("default", {
          month: "short",
        });
        acc[month] = (acc[month] || 0) + curr.total_amount;
        return acc;
      }, {});

      setRevenueData(
        Object.entries(revenueByMonth || {}).map(([month, amount]) => ({
          month,
          amount,
        }))
      );

      // Get treatment distribution
      const { data: treatments } = await supabase
        .from("patient_treatments")
        .select("treatments(name)")
        .gte("treatment_date", startOfYear);

      const treatmentCounts = treatments?.reduce((acc, curr) => {
        const name = curr.treatments?.name || "Unknown";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      setTreatmentData(
        Object.entries(treatmentCounts || {}).map(([name, count]) => ({
          name,
          count,
        }))
      );
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPatients}</div>
            <p className="text-xs text-gray-500">Registered patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalAppointments}
            </div>
            <p className="text-xs text-gray-500">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Treatment Success
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-gray-500">Patient satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Treatment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={treatmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Treatments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No appointments scheduled for today
              </p>
            ) : (
              metrics.upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {appointment.patients.first_name}{" "}
                        {appointment.patients.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.treatments.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Date(
                        appointment.appointment_date
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Dr. {appointment.staff.first_name}{" "}
                      {appointment.staff.last_name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
