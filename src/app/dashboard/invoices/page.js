// app/dashboard/invoices/page.js
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { FilePlus, DollarSign, FileText, Calendar, Search } from "lucide-react";

const PAYMENT_STATUS = {
  pending: { label: "Pending", class: "bg-yellow-50 text-yellow-700" },
  paid: { label: "Paid", class: "bg-green-50 text-green-700" },
  partially_paid: {
    label: "Partially Paid",
    class: "bg-blue-50 text-blue-700",
  },
  overdue: { label: "Overdue", class: "bg-red-50 text-red-700" },
};

const PAYMENT_METHODS = [
  { value: "credit_card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "insurance", label: "Insurance" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    total_amount: 0,
    due_date: "",
    status: "pending",
    payment_method: "",
    notes: "",
    items: [{ treatment_id: "", description: "", amount: 0 }],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load invoices with patient names
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select(
          `
          *,
          patients (
            first_name,
            last_name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData);

      // Load patients for the dropdown
      const { data: patientsData, error: patientsError } = await supabase
        .from("patients")
        .select("id, first_name, last_name")
        .order("last_name");

      if (patientsError) throw patientsError;
      setPatients(patientsData);

      // Load treatments for the items dropdown
      const { data: treatmentsData, error: treatmentsError } = await supabase
        .from("treatments")
        .select("*")
        .order("name");

      if (treatmentsError) throw treatmentsError;
      setTreatments(treatmentsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First, create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([
          {
            patient_id: formData.patient_id,
            total_amount: formData.total_amount,
            due_date: formData.due_date,
            status: formData.status,
            payment_method: formData.payment_method,
            notes: formData.notes,
          },
        ])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Then, create the invoice items
      const invoiceItems = formData.items.map((item) => ({
        invoice_id: invoice.id,
        treatment_id: item.treatment_id,
        description: item.description,
        amount: item.amount,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      total_amount: 0,
      due_date: "",
      status: "pending",
      payment_method: "",
      notes: "",
      items: [{ treatment_id: "", description: "", amount: 0 }],
    });
  };

  const addInvoiceItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { treatment_id: "", description: "", amount: 0 }],
    }));
  };

  const removeInvoiceItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateInvoiceItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
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
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-500 mt-2">
            Manage patient invoices and payments
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
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

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInvoiceItem}
                  >
                    Add Item
                  </Button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Treatment</Label>
                        <Select
                          value={item.treatment_id}
                          onValueChange={(value) => {
                            const treatment = treatments.find(
                              (t) => t.id === value
                            );
                            updateInvoiceItem(index, "treatment_id", value);
                            updateInvoiceItem(
                              index,
                              "description",
                              treatment.name
                            );
                            updateInvoiceItem(
                              index,
                              "amount",
                              treatment.base_cost
                            );
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select treatment" />
                          </SelectTrigger>
                          <SelectContent>
                            {treatments.map((treatment) => (
                              <SelectItem
                                key={treatment.id}
                                value={treatment.id}
                              >
                                {treatment.name} - ${treatment.base_cost}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) =>
                            updateInvoiceItem(
                              index,
                              "amount",
                              parseFloat(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeInvoiceItem(index)}
                      >
                        Remove Item
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        due_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        payment_method: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
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
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Additional notes..."
                />
              </div>

              <Button type="submit" className="w-full">
                Create Invoice
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(PAYMENT_STATUS).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices
              .filter(
                (invoice) =>
                  (filterStatus === "all" || invoice.status === filterStatus) &&
                  (searchTerm === "" ||
                    `${invoice.patients?.first_name} ${invoice.patients?.last_name}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()))
              )
              .map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      INV-{String(invoice.id).padStart(6, "0")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {invoice.patients?.first_name} {invoice.patients?.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4" />
                      {invoice.total_amount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        PAYMENT_STATUS[invoice.status].class
                      }`}
                    >
                      {PAYMENT_STATUS[invoice.status].label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        Record Payment
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
