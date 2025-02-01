// app/dashboard/calendar/page.js
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Users,
  Plus,
} from "lucide-react";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

const VIEW_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export default function CalendarPage() {
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: "",
    staff_id: "",
    appointment_date: "",
    duration_minutes: 30,
    appointment_type: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, [currentDate, view]);

  const loadData = async () => {
    try {
      // Load appointments for the current view
      const dateRange = getDateRange();
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select(
          `
          *,
          patients (first_name, last_name),
          staff (first_name, last_name),
          treatments (name)
        `
        )
        .gte("appointment_date", dateRange.start)
        .lte("appointment_date", dateRange.end);

      setAppointments(appointmentsData || []);

      // Load staff members
      const { data: staffData } = await supabase
        .from("staff")
        .select("*")
        .order("last_name");

      setStaff(staffData || []);

      // Load patients
      const { data: patientsData } = await supabase
        .from("patients")
        .select("*")
        .order("last_name");

      setPatients(patientsData || []);

      // Load treatments
      const { data: treatmentsData } = await supabase
        .from("treatments")
        .select("*")
        .order("name");

      setTreatments(treatmentsData || []);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (view) {
      case "day":
        end.setDate(start.getDate() + 1);
        break;
      case "week":
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case "month":
        start.setDate(1);
        end.setMonth(start.getMonth() + 1);
        end.setDate(0);
        break;
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  };

  const handleDateChange = (direction) => {
    const newDate = new Date(currentDate);

    switch (view) {
      case "day":
        newDate.setDate(newDate.getDate() + direction);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + direction * 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + direction);
        break;
    }

    setCurrentDate(newDate);
  };

  const handleSlotClick = (date, hour) => {
    const slot = new Date(date);
    slot.setHours(hour, 0, 0, 0);
    setSelectedSlot(slot);
    setAppointmentForm((prev) => ({
      ...prev,
      appointment_date: slot.toISOString(),
    }));
    setIsNewAppointmentOpen(true);
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("appointments")
        .insert([appointmentForm]);

      if (error) throw error;

      loadData();
      setIsNewAppointmentOpen(false);
      setAppointmentForm({
        patient_id: "",
        staff_id: "",
        appointment_date: "",
        duration_minutes: 30,
        appointment_type: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const getAppointmentsForSlot = (date, hour) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointment_date);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getHours() === hour
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
                ...(view === "day" && { day: "numeric" }),
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEW_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select
                    value={appointmentForm.patient_id}
                    onValueChange={(value) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        patient_id: value,
                      }))
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
                  <Label>Doctor/Staff</Label>
                  <Select
                    value={appointmentForm.staff_id}
                    onValueChange={(value) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        staff_id: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Treatment</Label>
                  <Select
                    value={appointmentForm.appointment_type}
                    onValueChange={(value) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        appointment_type: value,
                      }))
                    }
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

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={appointmentForm.notes}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
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
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-8 gap-4">
          {/* Time column */}
          <div className="space-y-4">
            <div className="h-12"></div> {/* Header spacing */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-20 flex items-center justify-end pr-2 text-sm text-gray-500"
              >
                {hour % 12 || 12}:00 {hour >= 12 ? "PM" : "AM"}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {WEEKDAYS.map((day, index) => (
            <div key={day} className="space-y-4">
              <div className="h-12 flex items-center justify-center font-medium">
                {day}
              </div>
              {HOURS.map((hour) => {
                const date = new Date(currentDate);
                date.setDate(date.getDate() - date.getDay() + index);
                const appointments = getAppointmentsForSlot(date, hour);

                return (
                  <div
                    key={`${day}-${hour}`}
                    className="h-20 border rounded-lg p-1 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSlotClick(date, hour)}
                  >
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="text-xs p-1 mb-1 rounded bg-blue-100 text-blue-800"
                      >
                        {new Date(apt.appointment_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        <br />
                        {apt.patients?.first_name} {apt.patients?.last_name}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
