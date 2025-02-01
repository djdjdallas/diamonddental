// app/dashboard/settings/page.js
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Clock,
  Bell,
  Mail,
  UserCog,
  Shield,
  Palette,
  Save,
} from "lucide-react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, "0") + ":00",
  label: i.toString().padStart(2, "0") + ":00",
}));

export default function SettingsPage() {
  const [practiceInfo, setPracticeInfo] = useState({
    name: "Diamond Smile Dental",
    address: "123 Dental Street",
    phone: "(555) 123-4567",
    email: "info@diamondsmile.com",
    website: "www.diamondsmile.com",
  });

  const [workingHours, setWorkingHours] = useState(
    DAYS.reduce(
      (acc, day) => ({
        ...acc,
        [day]: {
          isOpen: day !== "Sunday",
          start: "09:00",
          end: "17:00",
        },
      }),
      {}
    )
  );

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: true,
    appointmentConfirmations: true,
    marketingEmails: false,
  });

  const handlePracticeInfoChange = (e) => {
    const { name, value } = e.target;
    setPracticeInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleNotificationChange = (setting) => {
    setNotifications((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-2">
            Manage your practice settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="practice" className="space-y-4">
        <TabsList>
          <TabsTrigger value="practice">Practice Information</TabsTrigger>
          <TabsTrigger value="hours">Working Hours</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Practice Information */}
        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <CardTitle>Practice Information</CardTitle>
              <CardDescription>
                Update your practice details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="practiceName">Practice Name</Label>
                  <Input
                    id="practiceName"
                    name="name"
                    value={practiceInfo.name}
                    onChange={handlePracticeInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={practiceInfo.phone}
                    onChange={handlePracticeInfoChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={practiceInfo.address}
                  onChange={handlePracticeInfoChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={practiceInfo.email}
                    onChange={handlePracticeInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={practiceInfo.website}
                    onChange={handlePracticeInfoChange}
                  />
                </div>
              </div>

              <Button className="mt-4">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set your practice's operating hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-32">
                      <Label>{day}</Label>
                    </div>
                    <Switch
                      checked={workingHours[day].isOpen}
                      onCheckedChange={(checked) =>
                        handleWorkingHoursChange(day, "isOpen", checked)
                      }
                    />
                    {workingHours[day].isOpen && (
                      <>
                        <Select
                          value={workingHours[day].start}
                          onValueChange={(value) =>
                            handleWorkingHoursChange(day, "start", value)
                          }
                        >
                          <SelectTrigger className="w-32">
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
                        <span>to</span>
                        <Select
                          value={workingHours[day].end}
                          onValueChange={(value) =>
                            handleWorkingHoursChange(day, "end", value)
                          }
                        >
                          <SelectTrigger className="w-32">
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
                      </>
                    )}
                  </div>
                ))}
                <Button className="mt-4">
                  <Save className="mr-2 h-4 w-4" />
                  Save Hours
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage your email and SMS notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Reminders</Label>
                    <p className="text-sm text-gray-500">
                      Receive appointment reminders via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailReminders}
                    onCheckedChange={() =>
                      handleNotificationChange("emailReminders")
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive appointment reminders via SMS
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsReminders}
                    onCheckedChange={() =>
                      handleNotificationChange("smsReminders")
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Appointment Confirmations</Label>
                    <p className="text-sm text-gray-500">
                      Send automatic confirmation requests
                    </p>
                  </div>
                  <Switch
                    checked={notifications.appointmentConfirmations}
                    onCheckedChange={() =>
                      handleNotificationChange("appointmentConfirmations")
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-500">
                      Receive updates about promotions and news
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={() =>
                      handleNotificationChange("marketingEmails")
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-gray-500">
                      Enable dark mode for the dashboard
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      "#000000",
                      "#1E40AF",
                      "#047857",
                      "#B91C1C",
                      "#6D28D9",
                    ].map((color) => (
                      <div
                        key={color}
                        className="w-12 h-12 rounded-full cursor-pointer border-2 border-transparent hover:border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your security preferences and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Change Password</Label>
                  <div className="space-y-2">
                    <Input type="password" placeholder="Current Password" />
                    <Input type="password" placeholder="New Password" />
                    <Input type="password" placeholder="Confirm New Password" />
                  </div>
                  <Button className="mt-2">Update Password</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
