import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useGetStore,
  getGetProductQueryKey,
  getListProductsQueryKey,
  getGetStatsSummaryQueryKey
} from "@/api/mock";
import { useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Package, Save, Trash2, Image as ImageIcon } from "lucide-react";
import { formatMoney } from "@/lib/format";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  priceDisplay: z.string().min(1, "Price is required"),
  inventory: z.coerce.number().min(0, "Inventory must be 0 or greater"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["active", "draft", "archived"]),
  sku: z.string().min(1, "SKU is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductEdit() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: store } = useGetStore();

  const isNew = !params.id || params.id === "new";
  const productId = isNew ? 0 : parseInt(params.id as string, 10);

  const { data: product, isLoading: isProductLoading } = useGetProduct(productId, {
    query: {
      enabled: !isNew,
      queryKey: getGetProductQueryKey(productId),
    },
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      priceDisplay: "",
      inventory: 0,
      imageUrl: "",
      category: "",
      status: "draft",
      sku: "",
    },
  });

  useEffect(() => {
    if (product && !isNew) {
      form.reset({
        name: product.name,
        description: product.description,
        priceDisplay: (product.priceCents / 100).toFixed(2),
        inventory: product.inventory,
        imageUrl: product.imageUrl || "",
        category: product.category,
        status: product.status as any,
        sku: product.sku,
      });
    }
  }, [product, isNew, form]);

  const onSubmit = async (values: ProductFormValues) => {
    const priceCents = Math.round(parseFloat(values.priceDisplay) * 100);
    const data = {
      ...values,
      priceCents,
      imageUrl: values.imageUrl || null,
      status: values.status as "active" | "draft" | "archived",
    };

    try {
      if (isNew) {
        await createMutation.mutateAsync({ data });
        toast({ title: "Product created successfully" });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
        setLocation("/products");
      } else {
        await updateMutation.mutateAsync({ id: productId, data });
        toast({ title: "Product updated successfully" });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) });
      }
    } catch (error) {
      toast({
        title: "Error saving product",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    }
  };

  const onDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: productId });
      toast({ title: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
      setLocation("/products");
    } catch (error) {
      toast({
        title: "Error deleting product",
        variant: "destructive",
      });
    }
  };

  if (!isNew && isProductLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/products")} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">
            {isNew ? "Add Product" : "Edit Product"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isNew ? "Create a new product in your catalog." : "Update product details and inventory."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-[1fr_300px]">
            <div className="space-y-8">
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-sm">
                <h2 className="font-serif font-bold text-lg mb-4">General Information</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Leather Bound Ledger" {...field} className="bg-background/50" />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your product in detail..." 
                            className="min-h-[120px] bg-background/50 resize-y" 
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
                <h2 className="font-serif font-bold text-lg mb-4">Media</h2>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <div className="flex gap-4 items-start">
                          <div className="w-24 h-24 rounded-lg bg-secondary border border-border/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {field.value ? (
                              <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <Input placeholder="https://example.com/image.jpg" {...field} className="bg-background/50" />
                            <p className="text-xs text-muted-foreground">Provide a direct link to an image. We recommend a square aspect ratio.</p>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-sm">
                <h2 className="font-serif font-bold text-lg mb-4">Pricing & Inventory</h2>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priceDisplay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ({store?.currency || "USD"})</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                            <Input placeholder="0.00" type="number" step="0.01" min="0" {...field} className="pl-7 bg-background/50" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inventory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} className="bg-background/50" />
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
                <h2 className="font-serif font-bold text-lg mb-4">Organization</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Draft products won't be visible on your storefront.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Leather Goods" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. LBL-001" {...field} className="bg-background/50 font-mono text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-6">
            {!isNew ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button" disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Delete Product
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the product from your catalog.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <div /> // Spacer
            )}

            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" onClick={() => setLocation("/products")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="min-w-[120px]">
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
