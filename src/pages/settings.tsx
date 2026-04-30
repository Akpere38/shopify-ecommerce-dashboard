import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetStore, useUpdateStore, getGetStoreQueryKey } from "@/api/mock";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Store } from "lucide-react";

const settingsSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  accentColor: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  location: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { data: store, isLoading } = useGetStore();
  const updateMutation = useUpdateStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      slug: "",
      tagline: "",
      description: "",
      logoUrl: "",
      accentColor: "",
      currency: "USD",
      contactEmail: "",
      location: "",
    },
  });

  useEffect(() => {
    if (store) {
      form.reset({
        name: store.name || "",
        slug: store.slug || "",
        tagline: store.tagline || "",
        description: store.description || "",
        logoUrl: store.logoUrl || "",
        accentColor: store.accentColor || "",
        currency: store.currency || "USD",
        contactEmail: store.contactEmail || "",
        location: store.location || "",
      });
    }
  }, [store, form]);

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await updateMutation.mutateAsync({
        data: {
          ...values,
          logoUrl: values.logoUrl || null,
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetStoreQueryKey() });
      toast({ title: "Settings updated successfully" });
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your boutique's identity, branding, and contact details.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-[1fr_300px]">
            <div className="space-y-8">
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-sm">
                <h2 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. The Emerald Boutique" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store URL Slug</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border/50 bg-muted/30 text-muted-foreground text-sm">
                              {window.location.host}/s/
                            </span>
                            <Input placeholder="my-boutique" {...field} className="rounded-l-none bg-background/50" />
                          </div>
                        </FormControl>
                        <FormDescription>This will be your public storefront link.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                          <Input placeholder="Curated goods for modern living" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About Your Store</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell your customers about your story, values, and products..." 
                            className="min-h-[120px] bg-background/50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-sm">
                <h2 className="font-serif font-bold text-lg mb-4">Contact & Location</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email</FormLabel>
                        <FormControl>
                          <Input placeholder="hello@myboutique.com" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. San Francisco, CA" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-sm">
                <h2 className="font-serif font-bold text-lg mb-4">Branding</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {field.value && (
                              <div className="w-16 h-16 rounded-lg bg-secondary border border-border/50 flex items-center justify-center overflow-hidden">
                                <img src={field.value} alt="Store Logo" className="w-full h-full object-contain" />
                              </div>
                            )}
                            <Input placeholder="https://..." {...field} className="bg-background/50" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent Color (Hex)</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" {...field} className="w-12 h-10 p-1 cursor-pointer bg-background/50" />
                            <Input placeholder="#000000" {...field} className="flex-1 bg-background/50 font-mono" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input placeholder="USD" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormDescription>3-letter currency code (e.g., USD, EUR)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={updateMutation.isPending} className="min-w-[140px]">
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
