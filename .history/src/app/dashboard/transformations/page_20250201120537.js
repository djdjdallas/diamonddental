"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { Plus, Upload, Image as ImageIcon } from "lucide-react";

const DUMMY_TRANSFORMATIONS = [
  {
    id: "1",
    patient_id: "1",
    treatment_type: "Diamond Smile",
    description: "Complete smile makeover with porcelain veneers",
    before_image: "/beforeandafter.jpg",
    after_image: "/beforeandafter.jpg",
    treatment_date: "2024-02-01",
    patients: {
      first_name: "John",
      last_name: "Doe",
    },
  },
  {
    id: "2",
    patient_id: "2",
    treatment_type: "Teeth Whitening",
    description: "Professional whitening treatment",
    before_image: "/before1.jpg",
    after_image: "/after1.jpg",
    treatment_date: "2024-02-01",
    patients: {
      first_name: "Jane",
      last_name: "Smith",
    },
  },
  {
    id: "3",
    patient_id: "3",
    treatment_type: "Dental Implants",
    description: "Full mouth restoration with dental implants",
    before_image: "/before2.jpg",
    after_image: "/after2.jpg",
    treatment_date: "2024-02-01",
    patients: {
      first_name: "Robert",
      last_name: "Johnson",
    },
  },
];

const DUMMY_PATIENTS = [
  { id: "1", first_name: "John", last_name: "Doe" },
  { id: "2", first_name: "Jane", last_name: "Smith" },
  { id: "3", first_name: "Robert", last_name: "Johnson" },
];

export default function TransformationsPage() {
  const [transformations, setTransformations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: "",
    treatment_type: "",
    description: "",
    before_image: "",
    after_image: "",
    treatment_date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Use dummy data instead of fetching from Supabase
      setTransformations(DUMMY_TRANSFORMATIONS);
      setPatients(DUMMY_PATIENTS);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    try {
      // For demo purposes, just use the dummy image
      const dummyUrl = "/beforeandafter.jpg";

      if (type === "before") {
        setBeforeImage(dummyUrl);
        setFormData((prev) => ({ ...prev, before_image: dummyUrl }));
      } else {
        setAfterImage(dummyUrl);
        setFormData((prev) => ({ ...prev, after_image: dummyUrl }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create new transformation with dummy data
      const newTransformation = {
        id: String(transformations.length + 1),
        ...formData,
        patients: DUMMY_PATIENTS.find((p) => p.id === formData.patient_id),
        before_image: "/beforeandafter.jpg",
        after_image: "/beforeandafter.jpg",
      };

      // Add to existing transformations
      setTransformations([newTransformation, ...transformations]);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving transformation:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      treatment_type: "",
      description: "",
      before_image: "",
      after_image: "",
      treatment_date: "",
    });
    setBeforeImage(null);
    setAfterImage(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transformations</h1>
          <p className="text-gray-500">
            Manage patient before and after images
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transformation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Transformation</DialogTitle>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Treatment Type</Label>
                  <Input
                    value={formData.treatment_type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        treatment_type: e.target.value,
                      }))
                    }
                    placeholder="e.g., Veneers, Implants"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Treatment Date</Label>
                  <Input
                    type="date"
                    value={formData.treatment_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        treatment_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Before Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {beforeImage ? (
                      <div className="relative h-40">
                        <Image
                          src={beforeImage}
                          alt="Before"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                        <label className="mt-2 cursor-pointer">
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(e.target.files[0], "before")
                            }
                          />
                          <span className="text-sm text-gray-500">
                            Upload before image
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>After Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {afterImage ? (
                      <div className="relative h-40">
                        <Image
                          src={afterImage}
                          alt="After"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                        <label className="mt-2 cursor-pointer">
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(e.target.files[0], "after")
                            }
                          />
                          <span className="text-sm text-gray-500">
                            Upload after image
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the transformation..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Save Transformation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transformations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transformations.map((transformation) => (
          <Card key={transformation.id}>
            <CardHeader>
              <CardTitle>
                {transformation.patients.first_name}{" "}
                {transformation.patients.last_name}
              </CardTitle>
              <CardDescription>{transformation.treatment_type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Before</Label>
                  <div className="relative h-40 rounded-lg overflow-hidden">
                    <Image
                      src={transformation.before_image}
                      alt="Before"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.src = "/beforeandafter.jpg";
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">After</Label>
                  <div className="relative h-40 rounded-lg overflow-hidden">
                    <Image
                      src={transformation.after_image}
                      alt="After"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.src = "/beforeandafter.jpg";
                      }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {transformation.description}
              </p>
              <p className="text-xs text-gray-400">
                Treatment Date:{" "}
                {new Date(transformation.treatment_date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
