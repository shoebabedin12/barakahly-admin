import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../lib/api";
import { assetUrl } from "../../lib/assetUrl";
import { RichTextEditor } from "../../components/RichTextEditor";
import { listBrands } from "../../lib/brands";
import { listCategories } from "../../lib/categories";
import { listActiveColors } from "../../lib/colors";
import {
  createProduct,
  deleteProductImage,
  getProduct,
  setPrimaryProductImage,
  updateProduct,
} from "../../lib/products";
import { listActiveSizes } from "../../lib/sizes";
import type { Brand, Category, Color, Product, ProductImage, Size, VariantInput } from "../../lib/types";

interface VariantRow extends VariantInput {
  key: string;
  /** The variant's currently saved image path, for preview - not sent back to the API. */
  existingImage?: string | null;
  /** A newly picked file for this row, held client-side until submit builds the variantImages array. */
  newImageFile?: File | null;
}

let rowKeyCounter = 0;
function newRowKey() {
  rowKeyCounter += 1;
  return `row-${rowKeyCounter}`;
}

export function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [name, setName] = useState("");
  const [sourceReference, setSourceReference] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [variants, setVariants] = useState<VariantRow[]>([]);

  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageActionBusy, setImageActionBusy] = useState(false);
  const [imagePickerKey, setImagePickerKey] = useState<string | null>(null);

  useEffect(() => {
    listCategories(1).then((res) => setCategories(res.data));
    listBrands(1).then((res) => setBrands(res.data));
    listActiveColors().then(setColors);
    listActiveSizes().then(setSizes);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getProduct(Number(id))
      .then((product: Product) => {
        setCategoryId(String(product.categoryId));
        setBrandId(product.brandId ? String(product.brandId) : "");
        setName(product.name);
        setSourceReference(product.sourceReference ?? "");
        setPrice(product.price);
        setDiscountPrice(product.discountPrice ?? "");
        setStock(String(product.stock));
        setDescription(product.description ?? "");
        setStatus(product.status);
        setExistingImages(product.images);
        setVariants(
          product.variants.map((v) => ({
            key: newRowKey(),
            id: v.id,
            colorId: v.colorId,
            sizeId: v.sizeId,
            sku: v.sku,
            price: v.price ? Number(v.price) : null,
            discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
            stock: v.stock,
            existingImage: v.image,
            newImageFile: null,
            reuseImagePath: null,
            removeImage: false,
          })),
        );
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load product."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function addVariantRow() {
    setVariants((prev) => [
      ...prev,
      {
        key: newRowKey(),
        colorId: null,
        sizeId: null,
        sku: null,
        price: null,
        discountPrice: null,
        stock: 0,
        existingImage: null,
        newImageFile: null,
        reuseImagePath: null,
        removeImage: false,
      },
    ]);
  }

  function updateVariantRow(key: string, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeVariantRow(key: string) {
    setVariants((prev) => prev.filter((row) => row.key !== key));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function removeNewImage(index: number) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleMakePrimary(imageId: number) {
    setImageActionBusy(true);
    try {
      await setPrimaryProductImage(imageId);
      setExistingImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update primary image.");
    } finally {
      setImageActionBusy(false);
    }
  }

  async function handleRemoveExistingImage(imageId: number) {
    setImageActionBusy(true);
    try {
      await deleteProductImage(imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove image.");
    } finally {
      setImageActionBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const variantImages: File[] = [];
    const variantsPayload = variants.map(({ key: _key, existingImage: _existingImage, newImageFile, ...rest }) => {
      let imageIndex: number | null = null;
      if (newImageFile) {
        imageIndex = variantImages.length;
        variantImages.push(newImageFile);
      }
      return { ...rest, imageIndex };
    });

    const input = {
      categoryId: Number(categoryId),
      brandId: brandId ? Number(brandId) : null,
      name,
      sourceReference: sourceReference || null,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock),
      description: description || null,
      status,
      variants: variantsPayload,
    };

    try {
      if (isEdit) {
        await updateProduct(Number(id), input, newImages, variantImages);
      } else {
        await createProduct(input, newImages, variantImages);
      }
      navigate("/products");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save product.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? "Edit Product" : "New Product"}</h1>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <form onSubmit={handleSubmit}>
          <div className="two-col">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="sourceReference">Source reference (optional)</label>
              <input
                id="sourceReference"
                value={sourceReference}
                onChange={(e) => setSourceReference(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? "— " : ""}
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="brand">Brand (optional)</label>
              <select id="brand" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="discountPrice">Discount price (optional)</label>
              <input
                id="discountPrice"
                type="number"
                step="0.01"
                min="0"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="stock">Stock</label>
              <input
                id="stock"
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>

            <div className="field checkbox-field" style={{ alignSelf: "center" }}>
              <input id="status" type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} />
              <label htmlFor="status" style={{ margin: 0 }}>
                Active
              </label>
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>

          <div className="field">
            <label>Images</label>
            <div className="image-grid">
              {existingImages.map((image) => (
                <div key={image.id} className={`image-tile ${image.isPrimary ? "is-primary" : ""}`}>
                  {image.isPrimary && <span className="image-tile-primary-badge">Primary</span>}
                  <img src={assetUrl(image.image) ?? undefined} alt="" />
                  <div className="image-tile-actions">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        disabled={imageActionBusy}
                        onClick={() => handleMakePrimary(image.id)}
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={imageActionBusy}
                      onClick={() => handleRemoveExistingImage(image.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {newImages.map((file, index) => (
                <div key={`${file.name}-${index}`} className="image-tile">
                  <img src={URL.createObjectURL(file)} alt="" />
                  <div className="image-tile-actions">
                    <button type="button" onClick={() => removeNewImage(index)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="upload-tile" onClick={() => fileInputRef.current?.click()}>
                + Add image
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                hidden
                onChange={handleFileSelect}
              />
            </div>
          </div>

          <div className="field">
            <label>Variants (color/size combinations, optional)</label>
            {variants.length > 0 && (
              <table className="variant-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((row) => (
                    <tr key={row.key}>
                      <td style={{ position: "relative" }}>
                        {row.newImageFile ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <img
                              src={URL.createObjectURL(row.newImageFile)}
                              alt=""
                              style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }}
                            />
                            <button type="button" onClick={() => updateVariantRow(row.key, { newImageFile: null })}>
                              ×
                            </button>
                          </div>
                        ) : row.reuseImagePath ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <img
                              src={assetUrl(row.reuseImagePath) ?? undefined}
                              alt=""
                              style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }}
                            />
                            <button
                              type="button"
                              onClick={() => updateVariantRow(row.key, { reuseImagePath: null })}
                            >
                              ×
                            </button>
                          </div>
                        ) : row.existingImage && !row.removeImage ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <img
                              src={assetUrl(row.existingImage) ?? undefined}
                              alt=""
                              style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }}
                            />
                            <button type="button" onClick={() => updateVariantRow(row.key, { removeImage: true })}>
                              ×
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            style={{ fontSize: 12, color: "var(--color-primary, #0B3D2E)" }}
                            onClick={() => setImagePickerKey(row.key)}
                          >
                            + Add
                          </button>
                        )}

                        {imagePickerKey === row.key && (
                          <>
                            <div className="image-picker-backdrop" onClick={() => setImagePickerKey(null)} />
                            <div className="image-picker-popover">
                              <p className="image-picker-title">Use an existing product image</p>
                              {existingImages.length > 0 ? (
                                <div className="image-picker-grid">
                                  {existingImages.map((image) => (
                                    <img
                                      key={image.id}
                                      src={assetUrl(image.image) ?? undefined}
                                      alt=""
                                      onClick={() => {
                                        updateVariantRow(row.key, {
                                          reuseImagePath: image.image,
                                          newImageFile: null,
                                          removeImage: false,
                                        });
                                        setImagePickerKey(null);
                                      }}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <p className="image-picker-empty">No product images uploaded yet.</p>
                              )}
                              <label className="image-picker-upload">
                                + Upload a new image instead
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp"
                                  hidden
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    if (file) {
                                      updateVariantRow(row.key, {
                                        newImageFile: file,
                                        reuseImagePath: null,
                                        removeImage: false,
                                      });
                                    }
                                    setImagePickerKey(null);
                                  }}
                                />
                              </label>
                            </div>
                          </>
                        )}
                      </td>
                      <td>
                        <select
                          value={row.colorId ?? ""}
                          onChange={(e) =>
                            updateVariantRow(row.key, { colorId: e.target.value ? Number(e.target.value) : null })
                          }
                        >
                          <option value="">None</option>
                          {colors.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={row.sizeId ?? ""}
                          onChange={(e) =>
                            updateVariantRow(row.key, { sizeId: e.target.value ? Number(e.target.value) : null })
                          }
                        >
                          <option value="">None</option>
                          {sizes.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          value={row.sku ?? ""}
                          onChange={(e) => updateVariantRow(row.key, { sku: e.target.value || null })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.price ?? ""}
                          onChange={(e) =>
                            updateVariantRow(row.key, { price: e.target.value ? Number(e.target.value) : null })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.discountPrice ?? ""}
                          onChange={(e) =>
                            updateVariantRow(row.key, {
                              discountPrice: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={row.stock}
                          onChange={(e) => updateVariantRow(row.key, { stock: Number(e.target.value) || 0 })}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="remove-variant"
                          onClick={() => removeVariantRow(row.key)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button type="button" className="btn-secondary" style={{ marginTop: 8 }} onClick={addVariantRow}>
              + Add variant
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate("/products")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
