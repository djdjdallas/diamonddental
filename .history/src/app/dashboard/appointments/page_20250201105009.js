// app/dashboard/appointments/page.js
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  Clock,
  Search,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarClock,
} from "lucide-react";

const APPOINTMENT_STATUS = {
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  "no-show": { label: "No Show", color: "bg-gray-100 text-gray-800" },
};

const TIME_SLOTS = Array.from({ length: 22 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8; // Start from 8 AM
  const minute = i % 2 === 0 ? "00" : "30";
  const time = `${hour.toString().padStart(2, "0")}:${minute}`;
  return {
    value: time,
    label: time,
  };
});

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    staff_id: "",
    treatment_id: "",
    appointment_date: selectedDate,
    appointment_time: "09:00",
    duration_minutes: 30,
    notes: "",
    status: "scheduled",
  });

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      // Load appointments for selected date
      const { data: appointmentsData, error: appointmentsError } =
        await supabase
          .from("appointments")
          .select(
            `
          *,
          patients (id, first_name, last_name, phone),
          staff (id, first_name, last_name),
          treatments (id, name, default_duration_minutes)
        `
          )
          .eq("appointment_date", selectedDate)
          .order("appointment_date");

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

      // Load patients
      const { data: patientsData } = await supabase
        .from("patients")
        .select("id, first_name, last_name")
        .order("last_name");

      setPatients(patientsData || []);

      // Load staff
      const { data: staffData } = await supabase
        .from("staff")
        .select("id, first_name, last_name, role")
        .eq("role", "dentist")
        .order("last_name");

      setStaff(staffData || []);

      // Load treatments
      const { data: treatmentsData } = await supabase
        .from("treatments")
        .select("*")
        .order("name");

      setTreatments(treatmentsData || []);
    } catch (error) {
      console.error("Error loading appointments data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time
      const appointmentDateTime = new Date(formData.appointment_date);
      const [hours, minutes] = formData.appointment_time.split(":");
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const { data, error } = await supabase.from("appointments").insert([
        {
          patient_id: formData.patient_id,
          staff_id: formData.staff_id,
          treatment_id: formData.treatment_id,
          appointment_date: appointmentDateTime.toISOString(),
          duration_minutes: formData.duration_minutes,
          notes: formData.notes,
          status: formData.status,
        },
      ]);

      if (error) throw error;

      loadData();
      setIsNewAppointmentOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      staff_id: "",
      treatment_id: "",
      appointment_date: selectedDate,
      appointment_time: "09:00",
      duration_minutes: 30,
      notes: "",
      status: "scheduled",
    });
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus =
      filterStatus === "all" || appointment.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      `${appointment.patients?.first_name} ${appointment.patients?.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-gray-500 mt-2">Manage and schedule appointments</p>
        </div>

        <Dialog
          open={isNewAppointmentOpen}
          onOpenChange={setIsNewAppointmentOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, patient_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select
                  value={formData.staff_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, staff_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.first_name} {doctor.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Treatment</Label>
                <Select
                  value={formData.treatment_id}
                  onValueChange={(value) => {
                    const treatment = treatments.find((t) => t.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      treatment_id: value,
                      duration_minutes:
                        treatment?.default_duration_minutes || 30,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatments.map((treatment) => (
                      <SelectItem key={treatment.id} value={treatment.id}>
                        {treatment.name} ({treatment.default_duration_minutes}{" "}
                        mins)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        appointment_date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <Select
                    value={formData.appointment_time}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        appointment_time: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Additional notes..."
                />
              </div>

              <Button type="submit" className="w-full">
                Schedule Appointment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto"
        />

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(APPOINTMENT_STATUS).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No appointments found for the selected date
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">
                      {appointment.patients?.first_name}{" "}
                      {appointment.patients?.last_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {appointment.patients?.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge
                    className={APPOINTMENT_STATUS[appointment.status].color}
                    variant="secondary"
                  >
                    {APPOINTMENT_STATUS[appointment.status].label}
                  </Badge>

                  <div className="flex items-center space-x-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(
                        appointment.appointment_date
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateAppointmentStatus(appointment.id, "completed")
                      }
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateAppointmentStatus(appointment.id, "cancelled")
                      }
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Treatment: </span>
                  {appointment.treatments?.name}
                </div>
                <div>
                  <span className="text-gray-500">Doctor: </span>
                  Dr. {appointment.staff?.first_name}{" "}
                  {appointment.staff?.last_name}
                </div>
                <div>
                  <span className="text-gray-500">Duration: </span>
                  {appointment.duration_minutes} minutes
                </div>
                {appointment.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Notes: </span>
                    {appointment.notes}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Total Appointments</span>
              <span className="text-2xl font-bold">{appointments.length}</span>
            </div>
            <CalendarClock className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Completed</span>
              <span className="text-2xl font-bold text-green-600">
                {appointments.filter((a) => a.status === "completed").length}
              </span>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Cancelled</span>
              <span className="text-2xl font-bold text-red-600">
                {appointments.filter((a) => a.status === "cancelled").length}
              </span>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">No Shows</span>
              <span className="text-2xl font-bold text-gray-600">
                {appointments.filter((a) => a.status === "no-show").length}
              </span>
            </div>
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
      </div>
    </div>
  );
}
