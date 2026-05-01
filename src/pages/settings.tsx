import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { Loader2, Save, Store, Upload, X, Link as LinkIcon } from "lucide-react";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

const settingsSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  slug: z.string(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal("")),
  accentColor: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  location: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function LogoUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-secondary border-2 border-dashed border-border/70 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
          {value ? (
            <>
              <img
                src={value}
                alt="Store Logo"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </>
          ) : (
            <Store className="w-6 h-6 text-muted-foreground opacity-40" />
          )}
        </div>

        <div className="space-y-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            {value ? "Change Logo" : "Upload Logo"}
          </Button>
          <p className="text-xs text-muted-foreground">
            PNG or SVG, square preferred.
          </p>
        </div>
      </div>
    </div>
  );
}

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
      currency: "NGN",
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
        currency: store.currency || "NGN",
        contactEmail: store.contactEmail || "",
        location: store.location || "",
      });
    }
  }, [store, form]);

  const watchedName = useWatch({ control: form.control, name: "name" });
  useEffect(() => {
    if (watchedName) {
      form.setValue("slug", toSlug(watchedName), { shouldValidate: false });
    }
  }, [watchedName, form]);

  const currentSlug = form.watch("slug");
  const storeUrl = `${window.location.origin}/s/${currentSlug}`;

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await updateMutation.mutateAsync({
        data: { ...values, logoUrl: values.logoUrl || null },
      });
      queryClient.invalidateQueries({ queryKey: getGetStoreQueryKey() });
      toast({ title: "Settings updated successfully" });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Please try again later.";
      toast({
        title: "Error updating settings",
        description: message,
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
        <h1 className="text-3xl font-serif font-bold tracking-tight">
          Store Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your store's identity, branding, and contact details.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-[1fr_300px]">
            <div className="space-y-8">
              {/* Basic info */}
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
                          <Input
                            placeholder="e.g. The Emerald Boutique"
                            {...field}
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Read-only store link — auto-generated from store name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">
                      Your Public Store Link
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-border/50 bg-muted/20 text-sm">
                      <LinkIcon className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground truncate font-mono">
                        {storeUrl}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-generated from your store name. Updates when you save.
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Curated goods for modern living"
                            {...field}
                            className="bg-background/50"
                          />
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

              {/* Contact */}
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-sm">
                <h2 className="font-serif font-bold text-lg mb-4">
                  Contact & Location
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="hello@mystore.com"
                            {...field}
                            className="bg-background/50"
                          />
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
                          <Input
                            placeholder="e.g. Lagos, Nigeria"
                            {...field}
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Branding sidebar */}
            <div className="space-y-8">
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-sm">
                <h2 className="font-serif font-bold text-lg mb-4">Branding</h2>
                <div className="space-y-4">
                  {/* Logo upload */}
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Logo</FormLabel>
                        <FormControl>
                          <LogoUpload
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
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
                        <FormLabel>Accent Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              {...field}
                              className="w-12 h-10 p-1 cursor-pointer bg-background/50"
                            />
                            <Input
                              placeholder="#1E3A8A"
                              {...field}
                              className="flex-1 bg-background/50 font-mono"
                            />
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
                        <FormLabel>Currency Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="NGN"
                            {...field}
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormDescription>
                          3-letter code (e.g. NGN, USD, EUR)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="min-w-[140px]"
            >
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
