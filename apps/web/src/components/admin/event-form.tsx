"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateEventInput } from "@repo/types";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Form, FormField } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import { Textarea } from "@repo/ui/components/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";

const eventFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().min(1, "Venue is required"),
  city: z.string().min(1, "City is required"),
  category: z.string().min(1, "Category is required"),
  totalSeats: z.number().int().min(1).max(500),
  description: z.string().optional(),
  imageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  featured: z.boolean(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  submitLabel: string;
  onSubmit: (values: CreateEventInput) => Promise<void>;
}

function toDatetimeLocalValue(isoDate?: string): string {
  if (!isoDate) {
    return "";
  }

  const date = new Date(isoDate);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function EventForm({
  defaultValues,
  submitLabel,
  onSubmit,
}: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      date: defaultValues?.date ? toDatetimeLocalValue(defaultValues.date) : "",
      venue: defaultValues?.venue ?? "",
      city: defaultValues?.city ?? "",
      category: defaultValues?.category ?? "",
      totalSeats: defaultValues?.totalSeats ?? 30,
      description: defaultValues?.description ?? "",
      imageUrl: defaultValues?.imageUrl ?? "",
      featured: defaultValues?.featured ?? false,
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit({
            name: values.name,
            date: new Date(values.date).toISOString(),
            venue: values.venue,
            city: values.city,
            category: values.category,
            totalSeats: values.totalSeats,
            description: values.description || undefined,
            imageUrl: values.imageUrl || undefined,
            featured: values.featured,
          });
        })}
      >
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Name</FieldLabel>
                <Input {...field} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Date & time</FieldLabel>
                <Input {...field} type="datetime-local" />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="venue"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Venue</FieldLabel>
                <Input {...field} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>City</FieldLabel>
                <Input {...field} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Category</FieldLabel>
                <Input {...field} placeholder="Music, Comedy, Film..." />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="totalSeats"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Total seats</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  min={1}
                  max={500}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field, fieldState }) => (
              <Field
                className="md:col-span-2"
                data-invalid={!!fieldState.error}
              >
                <FieldLabel>Image URL</FieldLabel>
                <Input {...field} placeholder="https://..." />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field
                className="md:col-span-2"
                data-invalid={!!fieldState.error}
              >
                <FieldLabel>Description</FieldLabel>
                <Textarea {...field} rows={4} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <Field orientation="horizontal">
                <Switch
                  id="featured-event"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel htmlFor="featured-event">Featured event</FieldLabel>
              </Field>
            )}
          />
        </FieldGroup>
        <FieldError errors={[form.formState.errors.root]} />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
