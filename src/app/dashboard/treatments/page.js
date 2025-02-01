// app/dashboard/treatments/page.js
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { supabase } from "@/lib/supabase";

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    default_duration_minutes: 30,
    base_cost: "",
    category: "",
  });

  useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = async () => {
    try {
      const { data, error } = await supabase
        .from("treatments")
        .select("*")
        .order("name");

      if (error) throw error;
      setTreatments(data);
    } catch (error) {
      console.error("Error loading treatments:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("treatments").insert([formData]);

      if (error) throw error;

      loadTreatments();
      setFormData({
        name: "",
        description: "",
        default_duration_minutes: 30,
        base_cost: "",
        category: "",
      });
    } catch (error) {
      console.error("Error adding treatment:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Treatments & Procedures</h1>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Treatment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Treatment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Treatment Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_duration_minutes">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="default_duration_minutes"
                    name="default_duration_minutes"
                    type="number"
                    value={formData.default_duration_minutes}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_cost">Base Cost ($)</Label>
                  <Input
                    id="base_cost"
                    name="base_cost"
                    type="number"
                    step="0.01"
                    value={formData.base_cost}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>

              <Button type="submit" className="w-full">
                Save Treatment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Treatment</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Base Cost</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {treatments.map((treatment) => (
              <TableRow key={treatment.id}>
                <TableCell className="font-medium">{treatment.name}</TableCell>
                <TableCell>{treatment.default_duration_minutes} mins</TableCell>
                <TableCell>${treatment.base_cost}</TableCell>
                <TableCell>{treatment.category}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
