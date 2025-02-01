// app/dashboard/reports/page.js
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";
import {
  Download,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";

// Chart colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("month");
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    newPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [treatmentDistribution, setTreatmentDistribution] = useState([]);
  const [appointmentTrends, setAppointmentTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      // Load key metrics
      const { data: patientsCount } = await supabase
        .from("patients")
        .select("id", { count: "exact" });

      const { data: newPatientsCount } = await supabase
        .from("patients")
        .select("id", { count: "exact" })
        .gte("created_at", getDateRange());

      const { data: appointmentsCount } = await supabase
        .from("appointments")
        .select("id", { count: "exact" })
        .gte("appointment_date", getDateRange());

      const { data: revenueSum } = await supabase
        .from("invoices")
        .select("total_amount")
        .gte("created_at", getDateRange());

      // Set metrics
      setMetrics({
        totalPatients: patientsCount?.length || 0,
        newPatients: newPatientsCount?.length || 0,
        totalAppointments: appointmentsCount?.length || 0,
        totalRevenue:
          revenueSum?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
      });

      // Load revenue data for chart
      const { data: revenueByDate } = await supabase
        .from("invoices")
        .select("created_at, total_amount")
        .gte("created_at", getDateRange())
        .order("created_at");

      // Process revenue data for chart
      const processedRevenueData = processTimeSeriesData(
        revenueByDate,
        "total_amount"
      );
      setRevenueData(processedRevenueData);

      // Load treatment distribution
      const { data: treatments } = await supabase
        .from("patient_treatments")
        .select("treatment_id, treatments(name)")
        .gte("treatment_date", getDateRange());

      const treatmentCounts = treatments?.reduce((acc, curr) => {
        const name = curr.treatments?.name || "Unknown";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      setTreatmentDistribution(
        Object.entries(treatmentCounts || {}).map(([name, value]) => ({
          name,
          value,
        }))
      );

      // Load appointment trends
      const { data: appointments } = await supabase
        .from("appointments")
        .select("appointment_date, status")
        .gte("appointment_date", getDateRange())
        .order("appointment_date");

      const processedAppointments = processTimeSeriesData(
        appointments,
        "count"
      );
      setAppointmentTrends(processedAppointments);
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case "week":
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case "month":
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case "year":
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      default:
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    }
  };

  const processTimeSeriesData = (data, valueKey) => {
    if (!data) return [];

    const grouped = data.reduce((acc, curr) => {
      const date = new Date(curr.created_at || curr.appointment_date);
      const key = date.toISOString().split("T")[0];

      if (valueKey === "count") {
        acc[key] = (acc[key] || 0) + 1;
      } else {
        acc[key] = (acc[key] || 0) + (curr[valueKey] || 0);
      }

      return acc;
    }, {});

    return Object.entries(grouped).map(([date, value]) => ({
      date,
      value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Practice Analytics</h1>
          <p className="text-gray-500 mt-2">
            Track your practice performance and trends
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

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
            <p className="text-xs text-gray-500">
              {metrics.newPatients} new this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalAppointments}
            </div>
            <p className="text-xs text-gray-500">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((metrics.newPatients / metrics.totalPatients) * 100).toFixed(1)}
              %
            </div>
            <p className="text-xs text-gray-500">Patient growth rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Revenue"
                    stroke="#0088FE"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Treatment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={treatmentDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {treatmentDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Appointments" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
